import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job, JobStatus, EmploymentType } from '../../database/entities/job.entity';
import { Location } from '../../database/entities/location.entity';
import { User, UserRole } from '../../database/entities/user.entity';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: any;
  let locationRepository: any;

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-123',
    email: 'recruiter@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.RECRUITER,
    permissions: ['jobs:create', 'jobs:read', 'jobs:update'],
    active: true,
  } as User;

  const mockJob: Job = {
    id: 'job-123',
    organizationId: 'org-123',
    title: 'Senior Software Engineer',
    description: 'We are looking for a senior engineer',
    status: JobStatus.OPEN,
    employmentType: EmploymentType.FULL_TIME,
    remoteOk: true,
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Job;

  beforeEach(async () => {
    const mockJobRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findBy: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockLocationRepository = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get(getRepositoryToken(Job));
    locationRepository = module.get(getRepositoryToken(Location));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createJobDto = {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior engineer',
        employmentType: EmploymentType.FULL_TIME,
        remoteOk: true,
      };

      jobRepository.create.mockReturnValue({ ...mockJob, ...createJobDto });
      jobRepository.save.mockResolvedValue({ ...mockJob, ...createJobDto });

      const result = await service.create(createJobDto, mockUser.organizationId, mockUser.id);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createJobDto.title);
      expect(result.organizationId).toBe(mockUser.organizationId);
      expect(jobRepository.create).toHaveBeenCalled();
      expect(jobRepository.save).toHaveBeenCalled();
    });

    it('should set status to DRAFT by default', async () => {
      const createJobDto = {
        title: 'Software Engineer',
        description: 'Job description',
        employmentType: EmploymentType.FULL_TIME,
      };

      jobRepository.create.mockReturnValue({ ...mockJob, status: JobStatus.DRAFT });
      jobRepository.save.mockResolvedValue({ ...mockJob, status: JobStatus.DRAFT });

      const result = await service.create(createJobDto, mockUser.organizationId, mockUser.id);

      expect(result.status).toBe(JobStatus.DRAFT);
    });
  });

  describe('findAll', () => {
    it('should return paginated jobs', async () => {
      const jobs = [mockJob];
      const queryBuilder = jobRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([jobs, 1]);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        mockUser.organizationId
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(jobs);
      expect(result.meta.total).toBe(1);
    });

    it('should filter jobs by status', async () => {
      const queryBuilder = jobRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockJob], 1]);

      await service.findAll(
        { page: 1, limit: 10, status: JobStatus.OPEN },
        mockUser.organizationId
      );

      expect(jobRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      jobRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne('job-123', mockUser.organizationId);

      expect(result).toEqual(mockJob);
      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-123', organizationId: mockUser.organizationId },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser.organizationId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      const updateJobDto = {
        title: 'Updated Title',
        status: JobStatus.OPEN,
      };

      jobRepository.findOne.mockResolvedValue(mockJob);
      jobRepository.save.mockResolvedValue({ ...mockJob, ...updateJobDto });

      const result = await service.update('job-123', updateJobDto, mockUser.organizationId);

      expect(result.title).toBe(updateJobDto.title);
      expect(result.status).toBe(updateJobDto.status);
      expect(jobRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'New Title' }, mockUser.organizationId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a job', async () => {
      jobRepository.findOne.mockResolvedValue(mockJob);
      jobRepository.remove.mockResolvedValue(mockJob);

      await service.remove('job-123', mockUser.organizationId);

      expect(jobRepository.remove).toHaveBeenCalledWith(mockJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser.organizationId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateStatus', () => {
    it('should change job status to OPEN', async () => {
      const draftJob = { ...mockJob, status: JobStatus.DRAFT };
      jobRepository.findOne.mockResolvedValue(draftJob);
      jobRepository.save.mockResolvedValue({ ...draftJob, status: JobStatus.OPEN, openedAt: new Date() });

      const result = await service.updateStatus('job-123', JobStatus.OPEN, mockUser.organizationId);

      expect(result.status).toBe(JobStatus.OPEN);
      expect(result.openedAt).toBeDefined();
    });

    it('should change job status to CLOSED', async () => {
      jobRepository.findOne.mockResolvedValue(mockJob);
      jobRepository.save.mockResolvedValue({ ...mockJob, status: JobStatus.CLOSED, closedAt: new Date() });

      const result = await service.updateStatus('job-123', JobStatus.CLOSED, mockUser.organizationId);

      expect(result.status).toBe(JobStatus.CLOSED);
      expect(result.closedAt).toBeDefined();
    });
  });
});
