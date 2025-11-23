import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  PipelineStage,
  Application,
  ApplicationHistory,
  RejectionReason,
  ApplicationStatus,
  StageType,
} from '../../database/entities';
import {
  CreatePipelineStageDto,
  UpdatePipelineStageDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  MoveApplicationDto,
  RejectApplicationDto,
  BulkMoveApplicationsDto,
  BulkRejectApplicationsDto,
  FilterApplicationDto,
} from './dto';
import { CandidateMatchingService } from '../matching/candidate-matching.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(PipelineStage)
    private pipelineStageRepository: Repository<PipelineStage>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationHistory)
    private applicationHistoryRepository: Repository<ApplicationHistory>,
    @InjectRepository(RejectionReason)
    private rejectionReasonRepository: Repository<RejectionReason>,
    private candidateMatchingService: CandidateMatchingService,
  ) {}

  // Pipeline Stage Management

  async createPipelineStage(
    organizationId: string,
    createDto: CreatePipelineStageDto,
  ): Promise<PipelineStage> {
    const stage = this.pipelineStageRepository.create({
      organizationId,
      ...createDto,
    });

    return this.pipelineStageRepository.save(stage);
  }

  async findAllPipelineStages(
    organizationId: string,
    jobId?: string,
  ): Promise<PipelineStage[]> {
    const where: any = { organizationId };
    
    if (jobId !== undefined) {
      where.jobId = jobId === 'default' ? null : jobId;
    }

    return this.pipelineStageRepository.find({
      where,
      order: { orderIndex: 'ASC' },
    });
  }

  async findOnePipelineStage(
    id: string,
    organizationId: string,
  ): Promise<PipelineStage> {
    const stage = await this.pipelineStageRepository.findOne({
      where: { id, organizationId },
    });

    if (!stage) {
      throw new NotFoundException(`Pipeline stage with ID ${id} not found`);
    }

    return stage;
  }

  async updatePipelineStage(
    id: string,
    organizationId: string,
    updateDto: UpdatePipelineStageDto,
  ): Promise<PipelineStage> {
    const stage = await this.findOnePipelineStage(id, organizationId);

    Object.assign(stage, updateDto);

    return this.pipelineStageRepository.save(stage);
  }

  async deletePipelineStage(id: string, organizationId: string): Promise<void> {
    const stage = await this.findOnePipelineStage(id, organizationId);

    // Check if any applications are using this stage
    const applicationsCount = await this.applicationRepository.count({
      where: { stageId: id },
    });

    if (applicationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete stage with ${applicationsCount} applications. Move applications first.`,
      );
    }

    await this.pipelineStageRepository.remove(stage);
  }

  async initializeDefaultStages(organizationId: string): Promise<PipelineStage[]> {
    const defaultStages = [
      { name: 'Applied', type: StageType.APPLIED, orderIndex: 0 },
      { name: 'Phone Screen', type: StageType.PHONE_SCREEN, orderIndex: 1 },
      { name: 'Technical Interview', type: StageType.TECHNICAL_INTERVIEW, orderIndex: 2 },
      { name: 'Onsite Interview', type: StageType.ONSITE_INTERVIEW, orderIndex: 3 },
      { name: 'Offer', type: StageType.OFFER, orderIndex: 4 },
      { name: 'Hired', type: StageType.HIRED, orderIndex: 5 },
    ];

    const stages = defaultStages.map((stage) =>
      this.pipelineStageRepository.create({
        organizationId,
        jobId: null, // Default stages have no job association
        ...stage,
      }),
    );

    return this.pipelineStageRepository.save(stages);
  }

  // Application Lifecycle Management

  async createApplication(
    organizationId: string,
    userId: string,
    createDto: CreateApplicationDto,
  ): Promise<Application> {
    // If no stage provided, find the first stage (Applied)
    let stageId = createDto.stageId;
    if (!stageId) {
      const firstStage = await this.pipelineStageRepository
        .createQueryBuilder('stage')
        .where('stage.organization_id = :organizationId', { organizationId })
        .andWhere('stage.job_id IS NULL') // Use default stages
        .andWhere('stage.type = :type', { type: StageType.APPLIED })
        .orderBy('stage.order_index', 'ASC')
        .getOne();

      if (!firstStage) {
        throw new BadRequestException('No default pipeline stages found. Initialize stages first.');
      }

      stageId = firstStage.id;
    }

    // Check for duplicate application
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        candidateId: createDto.candidateId,
        jobId: createDto.jobId,
        status: In([ApplicationStatus.ACTIVE, ApplicationStatus.HIRED]),
      },
    });

    if (existingApplication) {
      throw new BadRequestException('Candidate has already applied to this job');
    }

    const application = this.applicationRepository.create({
      ...createDto,
      stageId,
      status: ApplicationStatus.ACTIVE,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Create history entry
    await this.applicationHistoryRepository.save({
      applicationId: savedApplication.id,
      fromStageId: null,
      toStageId: stageId,
      userId,
      automated: false,
    });

    // Calculate and store match score
    try {
      await this.candidateMatchingService.updateApplicationMatchScore(savedApplication.id);
    } catch (error) {
      // Log error but don't fail application creation
      console.error('Failed to calculate match score:', error);
    }

    // Reload application with updated match score
    const reloadedApplication = await this.applicationRepository.findOne({
      where: { id: savedApplication.id },
      relations: ['candidate', 'job', 'stage'],
    });

    return reloadedApplication || savedApplication;
  }

  async findAllApplications(
    organizationId: string,
    filterDto: FilterApplicationDto,
  ): Promise<{ data: Application[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'appliedAt', sortOrder = 'DESC', ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.stage', 'stage')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere('application.archived = :archived', { archived: false });

    if (filters.jobId) {
      queryBuilder.andWhere('application.job_id = :jobId', { jobId: filters.jobId });
    }

    if (filters.candidateId) {
      queryBuilder.andWhere('application.candidate_id = :candidateId', {
        candidateId: filters.candidateId,
      });
    }

    if (filters.stageId) {
      queryBuilder.andWhere('application.stage_id = :stageId', { stageId: filters.stageId });
    }

    if (filters.status) {
      queryBuilder.andWhere('application.status = :status', { status: filters.status });
    }

    // Filter by match score range
    if (filters.minMatchScore !== undefined) {
      queryBuilder.andWhere(
        "CAST(application.custom_fields->>'matchScore' AS INTEGER) >= :minMatchScore",
        { minMatchScore: filters.minMatchScore },
      );
    }

    if (filters.maxMatchScore !== undefined) {
      queryBuilder.andWhere(
        "CAST(application.custom_fields->>'matchScore' AS INTEGER) <= :maxMatchScore",
        { maxMatchScore: filters.maxMatchScore },
      );
    }

    // Sorting
    if (sortBy === 'matchScore') {
      // Sort by match score from custom fields
      queryBuilder.orderBy(
        "CAST(application.custom_fields->>'matchScore' AS INTEGER)",
        sortOrder as 'ASC' | 'DESC',
      );
    } else if (sortBy === 'appliedAt') {
      queryBuilder.orderBy('application.applied_at', sortOrder as 'ASC' | 'DESC');
    } else if (sortBy === 'rating') {
      queryBuilder.orderBy('application.rating', sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('application.applied_at', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOneApplication(id: string, organizationId: string): Promise<Application> {
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.stage', 'stage')
      .where('application.id = :id', { id })
      .andWhere('job.organization_id = :organizationId', { organizationId })
      .getOne();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async updateApplication(
    id: string,
    organizationId: string,
    updateDto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.findOneApplication(id, organizationId);

    Object.assign(application, updateDto);

    return this.applicationRepository.save(application);
  }

  async moveApplication(
    id: string,
    organizationId: string,
    userId: string,
    moveDto: MoveApplicationDto,
  ): Promise<Application> {
    const application = await this.findOneApplication(id, organizationId);

    // Verify the target stage exists
    const targetStage = await this.pipelineStageRepository.findOne({
      where: { id: moveDto.stageId, organizationId },
    });

    if (!targetStage) {
      throw new NotFoundException(`Stage with ID ${moveDto.stageId} not found`);
    }

    const fromStageId = application.stageId;

    // Update application
    application.stageId = moveDto.stageId;
    application.stageEnteredAt = new Date();

    const savedApplication = await this.applicationRepository.save(application);

    // Create history entry
    await this.applicationHistoryRepository.save({
      applicationId: application.id,
      fromStageId,
      toStageId: moveDto.stageId,
      userId,
      automated: false,
    });

    return savedApplication;
  }

  async rejectApplication(
    id: string,
    organizationId: string,
    userId: string,
    rejectDto: RejectApplicationDto,
  ): Promise<Application> {
    const application = await this.findOneApplication(id, organizationId);

    if (application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Application is already rejected');
    }

    // Verify rejection reason if provided
    if (rejectDto.rejectionReasonId) {
      const reason = await this.rejectionReasonRepository.findOne({
        where: { id: rejectDto.rejectionReasonId, organizationId },
      });

      if (!reason) {
        throw new NotFoundException(
          `Rejection reason with ID ${rejectDto.rejectionReasonId} not found`,
        );
      }
    }

    application.status = ApplicationStatus.REJECTED;
    application.rejectedAt = new Date();
    application.rejectionReasonId = rejectDto.rejectionReasonId || null;

    return this.applicationRepository.save(application);
  }

  async getApplicationHistory(
    id: string,
    organizationId: string,
  ): Promise<ApplicationHistory[]> {
    // Verify application exists and belongs to organization
    await this.findOneApplication(id, organizationId);

    return this.applicationHistoryRepository.find({
      where: { applicationId: id },
      relations: ['fromStage', 'toStage', 'user'],
      order: { timestamp: 'DESC' },
    });
  }

  // Bulk Operations

  async bulkMoveApplications(
    organizationId: string,
    userId: string,
    bulkMoveDto: BulkMoveApplicationsDto,
  ): Promise<{ success: number; failed: number }> {
    const { applicationIds, stageId } = bulkMoveDto;

    // Verify the target stage exists
    const targetStage = await this.pipelineStageRepository.findOne({
      where: { id: stageId, organizationId },
    });

    if (!targetStage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    let success = 0;
    let failed = 0;

    for (const applicationId of applicationIds) {
      try {
        await this.moveApplication(applicationId, organizationId, userId, { stageId });
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async bulkRejectApplications(
    organizationId: string,
    userId: string,
    bulkRejectDto: BulkRejectApplicationsDto,
  ): Promise<{ success: number; failed: number }> {
    const { applicationIds, rejectionReasonId } = bulkRejectDto;

    // Verify rejection reason if provided
    if (rejectionReasonId) {
      const reason = await this.rejectionReasonRepository.findOne({
        where: { id: rejectionReasonId, organizationId },
      });

      if (!reason) {
        throw new NotFoundException(`Rejection reason with ID ${rejectionReasonId} not found`);
      }
    }

    let success = 0;
    let failed = 0;

    for (const applicationId of applicationIds) {
      try {
        await this.rejectApplication(applicationId, organizationId, userId, {
          rejectionReasonId,
        });
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  // Rejection Reasons

  async createRejectionReason(
    organizationId: string,
    name: string,
    description?: string,
  ): Promise<RejectionReason> {
    const reason = this.rejectionReasonRepository.create({
      organizationId,
      name,
      description,
    });

    return this.rejectionReasonRepository.save(reason);
  }

  async findAllRejectionReasons(organizationId: string): Promise<RejectionReason[]> {
    return this.rejectionReasonRepository.find({
      where: { organizationId, active: true },
      order: { name: 'ASC' },
    });
  }
}
