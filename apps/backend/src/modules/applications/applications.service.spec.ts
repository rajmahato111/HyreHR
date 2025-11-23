import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationStatus, PipelineStage, ApplicationHistory, RejectionReason } from '../../database/entities';
import { User, UserRole } from '../../database/entities/user.entity';
import { CandidateMatchingService } from '../matching/candidate-matching.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationRepository: any;
  let historyRepository: any;
  let pipelineStageRepository: any;
  let rejectionReasonRepository: any;

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-123',
    email: 'recruiter@example.com',
    role: UserRole.RECRUITER,
  } as User;

  const mockApplication: Application = {
    id: 'app-123',
    candidateId: 'candidate-123',
    jobId: 'job-123',
    stageId: 'stage-123',
    status: ApplicationStatus.ACTIVE,
    appliedAt: new Date(),
    stageEnteredAt: new Date(),
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Application;

  beforeEach(async () => {
    const mockApplicationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
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

    const mockHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockPipelineStageRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockRejectionReasonRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockCandidateMatchingService = {
      calculateMatchScore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationHistory),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(PipelineStage),
          useValue: mockPipelineStageRepository,
        },
        {
          provide: getRepositoryToken(RejectionReason),
          useValue: mockRejectionReasonRepository,
        },
        {
          provide: CandidateMatchingService,
          useValue: mockCandidateMatchingService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationRepository = module.get(getRepositoryToken(Application));
    historyRepository = module.get(getRepositoryToken(ApplicationHistory));
    pipelineStageRepository = module.get(getRepositoryToken(PipelineStage));
    rejectionReasonRepository = module.get(getRepositoryToken(RejectionReason));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new application', async () => {
      const createApplicationDto = {
        candidateId: 'candidate-123',
        jobId: 'job-123',
        stageId: 'stage-123',
        sourceType: 'career_site',
      };

      applicationRepository.create.mockReturnValue({ ...mockApplication, ...createApplicationDto });
      applicationRepository.save.mockResolvedValue({ ...mockApplication, ...createApplicationDto });

      const result = await service.create(createApplicationDto, mockUser);

      expect(result).toHaveProperty('id');
      expect(result.candidateId).toBe(createApplicationDto.candidateId);
      expect(result.jobId).toBe(createApplicationDto.jobId);
      expect(result.status).toBe(ApplicationStatus.ACTIVE);
    });

    it('should set appliedAt timestamp', async () => {
      const createApplicationDto = {
        candidateId: 'candidate-123',
        jobId: 'job-123',
        stageId: 'stage-123',
      };

      applicationRepository.create.mockReturnValue(mockApplication);
      applicationRepository.save.mockResolvedValue(mockApplication);

      const result = await service.create(createApplicationDto, mockUser);

      expect(result.appliedAt).toBeDefined();
      expect(result.stageEnteredAt).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated applications', async () => {
      const applications = [mockApplication];
      const queryBuilder = applicationRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([applications, 1]);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        mockUser
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toEqual(applications);
    });

    it('should filter applications by job', async () => {
      const queryBuilder = applicationRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockApplication], 1]);

      await service.findAll(
        { page: 1, limit: 10, jobId: 'job-123' },
        mockUser
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'application.jobId = :jobId',
        { jobId: 'job-123' }
      );
    });

    it('should filter applications by status', async () => {
      const queryBuilder = applicationRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockApplication], 1]);

      await service.findAll(
        { page: 1, limit: 10, status: ApplicationStatus.ACTIVE },
        mockUser
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'application.status = :status',
        { status: ApplicationStatus.ACTIVE }
      );
    });
  });

  describe('findOne', () => {
    it('should return an application by id', async () => {
      applicationRepository.findOne.mockResolvedValue(mockApplication);

      const result = await service.findOne('app-123', mockUser);

      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('moveToStage', () => {
    it('should move application to new stage', async () => {
      const newStageId = 'stage-456';
      applicationRepository.findOne.mockResolvedValue(mockApplication);
      applicationRepository.save.mockResolvedValue({
        ...mockApplication,
        stageId: newStageId,
        stageEnteredAt: new Date(),
      });
      historyRepository.create.mockReturnValue({});
      historyRepository.save.mockResolvedValue({});

      const result = await service.moveToStage('app-123', newStageId, mockUser);

      expect(result.stageId).toBe(newStageId);
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should create history entry when moving stages', async () => {
      const newStageId = 'stage-456';
      applicationRepository.findOne.mockResolvedValue(mockApplication);
      applicationRepository.save.mockResolvedValue({
        ...mockApplication,
        stageId: newStageId,
      });
      historyRepository.create.mockReturnValue({
        applicationId: 'app-123',
        fromStageId: 'stage-123',
        toStageId: newStageId,
        userId: mockUser.id,
      });
      historyRepository.save.mockResolvedValue({});

      await service.moveToStage('app-123', newStageId, mockUser);

      expect(historyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fromStageId: mockApplication.stageId,
          toStageId: newStageId,
        })
      );
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.moveToStage('nonexistent', 'stage-456', mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('should reject an application', async () => {
      applicationRepository.findOne.mockResolvedValue(mockApplication);
      applicationRepository.save.mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReasonId: 'reason-123',
      });

      const result = await service.reject(
        'app-123',
        { rejectionReasonId: 'reason-123' },
        mockUser
      );

      expect(result.status).toBe(ApplicationStatus.REJECTED);
      expect(result.rejectedAt).toBeDefined();
      expect(result.rejectionReasonId).toBe('reason-123');
    });

    it('should throw BadRequestException if already rejected', async () => {
      const rejectedApp = { ...mockApplication, status: ApplicationStatus.REJECTED };
      applicationRepository.findOne.mockResolvedValue(rejectedApp);

      await expect(
        service.reject('app-123', { rejectionReasonId: 'reason-123' }, mockUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('hire', () => {
    it('should mark application as hired', async () => {
      applicationRepository.findOne.mockResolvedValue(mockApplication);
      applicationRepository.save.mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.HIRED,
        hiredAt: new Date(),
      });

      const result = await service.hire('app-123', mockUser);

      expect(result.status).toBe(ApplicationStatus.HIRED);
      expect(result.hiredAt).toBeDefined();
    });

    it('should throw BadRequestException if already hired', async () => {
      const hiredApp = { ...mockApplication, status: ApplicationStatus.HIRED };
      applicationRepository.findOne.mockResolvedValue(hiredApp);

      await expect(service.hire('app-123', mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('bulkMove', () => {
    it('should move multiple applications to new stage', async () => {
      const applicationIds = ['app-1', 'app-2', 'app-3'];
      const newStageId = 'stage-456';

      applicationRepository.findOne
        .mockResolvedValueOnce({ ...mockApplication, id: 'app-1' })
        .mockResolvedValueOnce({ ...mockApplication, id: 'app-2' })
        .mockResolvedValueOnce({ ...mockApplication, id: 'app-3' });

      applicationRepository.save.mockResolvedValue(mockApplication);
      historyRepository.create.mockReturnValue({});
      historyRepository.save.mockResolvedValue({});

      const result = await service.bulkMove(applicationIds, newStageId, mockUser);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(applicationRepository.save).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in bulk move', async () => {
      const applicationIds = ['app-1', 'app-2', 'app-3'];
      const newStageId = 'stage-456';

      applicationRepository.findOne
        .mockResolvedValueOnce({ ...mockApplication, id: 'app-1' })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockApplication, id: 'app-3' });

      applicationRepository.save.mockResolvedValue(mockApplication);
      historyRepository.create.mockReturnValue({});
      historyRepository.save.mockResolvedValue({});

      const result = await service.bulkMove(applicationIds, newStageId, mockUser);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });
  });

  describe('getHistory', () => {
    it('should return application history', async () => {
      const history = [
        {
          id: 'history-1',
          applicationId: 'app-123',
          fromStageId: 'stage-1',
          toStageId: 'stage-2',
          timestamp: new Date(),
        },
      ];

      historyRepository.find.mockResolvedValue(history);

      const result = await service.getHistory('app-123', mockUser);

      expect(result).toEqual(history);
      expect(historyRepository.find).toHaveBeenCalledWith({
        where: { applicationId: 'app-123' },
        order: { timestamp: 'DESC' },
      });
    });
  });
});
