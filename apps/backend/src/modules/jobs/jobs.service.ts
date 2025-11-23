import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, In } from 'typeorm';
import { Job, JobStatus } from '../../database/entities/job.entity';
import { Location } from '../../database/entities/location.entity';
import { CreateJobDto, UpdateJobDto, FilterJobDto } from './dto';
import { createPaginatedResponse, PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) { }

  async create(createJobDto: CreateJobDto, organizationId: string, userId: string): Promise<Job> {
    const job = this.jobRepository.create({
      ...createJobDto,
      organizationId,
      ownerId: createJobDto.ownerId || userId,
    });

    // Handle locations
    if (createJobDto.locationIds && createJobDto.locationIds.length > 0) {
      const locations = await this.locationRepository.findBy({
        id: In(createJobDto.locationIds),
        organizationId,
      });
      job.locations = locations;
    }

    // Set openedAt if status is OPEN
    if (job.status === JobStatus.OPEN) {
      job.openedAt = new Date();
    }

    return this.jobRepository.save(job);
  }

  async findAll(
    filterDto: FilterJobDto,
    organizationId?: string,
  ): Promise<PaginatedResponse<Job>> {
    const {
      page = 1,
      limit = 20,
      status,
      departmentId,
      locationId,
      ownerId,
      employmentType,
      seniorityLevel,
      remoteOk,
      confidential,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const where: FindOptionsWhere<Job> = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (ownerId) where.ownerId = ownerId;
    if (employmentType) where.employmentType = employmentType;
    if (seniorityLevel) where.seniorityLevel = seniorityLevel;
    if (remoteOk !== undefined) where.remoteOk = remoteOk;
    if (confidential !== undefined) where.confidential = confidential;
    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.owner', 'owner')
      .leftJoinAndSelect('job.locations', 'locations')
      .where(where);

    // Filter by location if specified
    if (locationId) {
      queryBuilder.andWhere('locations.id = :locationId', { locationId });
    }

    // Apply sorting
    queryBuilder.orderBy(`job.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(jobs, page, limit, total);
  }

  async findOne(id: string, organizationId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, organizationId },
      relations: ['department', 'owner', 'locations'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    organizationId: string,
  ): Promise<Job> {
    const job = await this.findOne(id, organizationId);

    // Handle status changes
    if (updateJobDto.status) {
      if (updateJobDto.status === JobStatus.OPEN && job.status !== JobStatus.OPEN) {
        job.openedAt = new Date();
      }
      if (
        (updateJobDto.status === JobStatus.CLOSED || updateJobDto.status === JobStatus.CANCELLED) &&
        job.status !== JobStatus.CLOSED &&
        job.status !== JobStatus.CANCELLED
      ) {
        job.closedAt = new Date();
      }
    }

    // Handle locations update
    if (updateJobDto.locationIds) {
      const locations = await this.locationRepository.findBy({
        id: In(updateJobDto.locationIds),
        organizationId,
      });
      job.locations = locations;
      delete updateJobDto.locationIds;
    }

    Object.assign(job, updateJobDto);

    return this.jobRepository.save(job);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const job = await this.findOne(id, organizationId);
    await this.jobRepository.remove(job);
  }

  async clone(id: string, organizationId: string, userId: string): Promise<Job> {
    const originalJob = await this.findOne(id, organizationId);

    const clonedJob = this.jobRepository.create({
      ...originalJob,
      id: undefined,
      title: `${originalJob.title} (Copy)`,
      status: JobStatus.DRAFT,
      openedAt: null,
      closedAt: null,
      createdAt: undefined,
      updatedAt: undefined,
      ownerId: userId,
    });

    // Clone locations
    if (originalJob.locations) {
      clonedJob.locations = originalJob.locations;
    }

    return this.jobRepository.save(clonedJob);
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    organizationId: string,
  ): Promise<Job> {
    const job = await this.findOne(id, organizationId);

    job.status = status;

    if (status === JobStatus.OPEN && !job.openedAt) {
      job.openedAt = new Date();
    }

    if (
      (status === JobStatus.CLOSED || status === JobStatus.CANCELLED) &&
      !job.closedAt
    ) {
      job.closedAt = new Date();
    }

    return this.jobRepository.save(job);
  }

  async getStatistics(organizationId?: string) {
    const whereClause = organizationId ? { organizationId } : {};

    const [total, open, draft, onHold, closed] = await Promise.all([
      this.jobRepository.count({ where: whereClause }),
      this.jobRepository.count({ where: { ...whereClause, status: JobStatus.OPEN } }),
      this.jobRepository.count({ where: { ...whereClause, status: JobStatus.DRAFT } }),
      this.jobRepository.count({ where: { ...whereClause, status: JobStatus.ON_HOLD } }),
      this.jobRepository.count({ where: { ...whereClause, status: JobStatus.CLOSED } }),
    ]);

    return {
      total,
      byStatus: {
        open,
        draft,
        onHold,
        closed,
      },
    };
  }
}
