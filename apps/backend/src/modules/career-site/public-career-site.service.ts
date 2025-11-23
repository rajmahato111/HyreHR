import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Job, JobStatus } from '../../database/entities/job.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../../database/entities/application.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { CareerSite } from '../../database/entities/career-site.entity';
import { ApplicationForm } from '../../database/entities/application-form.entity';
import { PublicJobListingQueryDto, SubmitApplicationDto } from './dto';

@Injectable()
export class PublicCareerSiteService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(PipelineStage)
    private pipelineStageRepository: Repository<PipelineStage>,
    @InjectRepository(CareerSite)
    private careerSiteRepository: Repository<CareerSite>,
    @InjectRepository(ApplicationForm)
    private applicationFormRepository: Repository<ApplicationForm>,
  ) { }

  async getCareerSite(slug: string): Promise<CareerSite> {
    const careerSite = await this.careerSiteRepository.findOne({
      where: { slug, published: true },
    });

    if (!careerSite) {
      throw new NotFoundException('Career site not found');
    }

    return careerSite;
  }

  async getPublicJobs(
    slug: string,
    query: PublicJobListingQueryDto,
  ): Promise<{ jobs: any[]; total: number; page: number; totalPages: number }> {
    const careerSite = await this.getCareerSite(slug);
    const page = query.page || 1;
    const limit = query.limit || careerSite.settings?.jobsPerPage || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.locations', 'locations')
      .where('job.organization_id = :organizationId', {
        organizationId: careerSite.organizationId,
      })
      .andWhere('job.status = :status', { status: JobStatus.OPEN })
      .andWhere('job.confidential = :confidential', { confidential: false });

    // Apply search filter
    if (query.search) {
      queryBuilder.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Apply department filter
    if (query.departments && query.departments.length > 0) {
      queryBuilder.andWhere('department.id IN (:...departments)', {
        departments: query.departments,
      });
    }

    // Apply location filter
    if (query.locations && query.locations.length > 0) {
      queryBuilder.andWhere('locations.id IN (:...locations)', {
        locations: query.locations,
      });
    }

    // Apply employment type filter
    if (query.employmentTypes && query.employmentTypes.length > 0) {
      queryBuilder.andWhere('job.employment_type IN (:...employmentTypes)', {
        employmentTypes: query.employmentTypes,
      });
    }

    const [jobs, total] = await queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Transform jobs to public format (remove sensitive data)
    const publicJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      department: job.department?.name,
      locations: job.locations?.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        remote: loc.remote,
      })),
      employmentType: job.employmentType,
      seniorityLevel: job.seniorityLevel,
      remoteOk: job.remoteOk,
      salaryRange: job.salaryMin && job.salaryMax
        ? {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.salaryCurrency,
        }
        : null,
      postedAt: job.openedAt || job.createdAt,
    }));

    return {
      jobs: publicJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicJob(slug: string, jobId: string): Promise<any> {
    const careerSite = await this.getCareerSite(slug);

    const job = await this.jobRepository.findOne({
      where: {
        id: jobId,
        organizationId: careerSite.organizationId,
        status: JobStatus.OPEN,
        confidential: false,
      },
      relations: ['department', 'locations'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      department: job.department?.name,
      locations: job.locations?.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        remote: loc.remote,
      })),
      employmentType: job.employmentType,
      seniorityLevel: job.seniorityLevel,
      remoteOk: job.remoteOk,
      salaryRange: job.salaryMin && job.salaryMax
        ? {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.salaryCurrency,
        }
        : null,
      postedAt: job.openedAt || job.createdAt,
    };
  }

  async getApplicationForm(slug: string, jobId: string): Promise<ApplicationForm> {
    const careerSite = await this.getCareerSite(slug);

    // Try to find job-specific form
    let form = await this.applicationFormRepository.findOne({
      where: {
        jobId,
        organizationId: careerSite.organizationId,
      },
    });

    // If not found, get default form
    if (!form) {
      form = await this.applicationFormRepository.findOne({
        where: {
          organizationId: careerSite.organizationId,
          isDefault: true,
        },
      });
    }

    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    return form;
  }

  async submitApplication(
    slug: string,
    submitDto: SubmitApplicationDto,
  ): Promise<{ applicationId: string; message: string }> {
    const careerSite = await this.getCareerSite(slug);

    // Verify job exists and is open
    const job = await this.jobRepository.findOne({
      where: {
        id: submitDto.jobId,
        organizationId: careerSite.organizationId,
        status: JobStatus.OPEN,
      },
    });

    if (!job) {
      throw new BadRequestException('Job is not available for applications');
    }

    // Find or create candidate
    let candidate = await this.candidateRepository.findOne({
      where: {
        email: submitDto.email,
        organizationId: careerSite.organizationId,
      },
    });

    if (!candidate) {
      candidate = this.candidateRepository.create({
        organizationId: careerSite.organizationId,
        firstName: submitDto.firstName,
        lastName: submitDto.lastName,
        email: submitDto.email,
        phone: submitDto.phone,
        resumeUrls: submitDto.resumeUrl ? [submitDto.resumeUrl] : [],
        gdprConsent: true,
        gdprConsentDate: new Date(),
        customFields: submitDto.customFields,
      });
      await this.candidateRepository.save(candidate);
    } else {
      // Update candidate with new information
      if (submitDto.resumeUrl && !candidate.resumeUrls.includes(submitDto.resumeUrl)) {
        candidate.resumeUrls.push(submitDto.resumeUrl);
      }
      candidate.phone = submitDto.phone || candidate.phone;
      candidate.customFields = { ...candidate.customFields, ...submitDto.customFields };
      await this.candidateRepository.save(candidate);
    }

    // Check if candidate already applied for this job
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        candidateId: candidate.id,
        jobId: job.id,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this position');
    }

    // Get the first pipeline stage for this job
    const firstStage = await this.pipelineStageRepository.findOne({
      where: { jobId: job.id },
      order: { orderIndex: 'ASC' },
    });

    if (!firstStage) {
      throw new BadRequestException('Job pipeline not configured');
    }

    // Create application
    const application = this.applicationRepository.create({
      candidateId: candidate.id,
      jobId: job.id,
      stageId: firstStage.id,
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(),
      stageEnteredAt: new Date(),
      customFields: {
        coverLetter: submitDto.coverLetter,
        ...submitDto.customFields,
      },
    });

    await this.applicationRepository.save(application);

    return {
      applicationId: application.id,
      message: 'Application submitted successfully',
    };
  }
}
