import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { Interview, InterviewStatus, LocationType } from '../../database/entities/interview.entity';
import { InterviewFeedback, Decision } from '../../database/entities/interview-feedback.entity';
import { User, UserRole } from '../../database/entities/user.entity';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let interviewRepository: any;
  let feedbackRepository: any;

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-123',
    email: 'interviewer@example.com',
    role: UserRole.INTERVIEWER,
  } as User;

  const mockInterview: Interview = {
    id: 'interview-123',
    applicationId: 'app-123',
    scheduledAt: new Date('2025-12-01T10:00:00Z'),
    durationMinutes: 60,
    status: InterviewStatus.SCHEDULED,
    locationType: LocationType.VIDEO,
    meetingLink: 'https://zoom.us/j/123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Interview;

  beforeEach(async () => {
    const mockInterviewRepository = {
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

    const mockFeedbackRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: getRepositoryToken(Interview),
          useValue: mockInterviewRepository,
        },
        {
          provide: getRepositoryToken(InterviewFeedback),
          useValue: mockFeedbackRepository,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    interviewRepository = module.get(getRepositoryToken(Interview));
    feedbackRepository = module.get(getRepositoryToken(InterviewFeedback));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new interview', async () => {
      const createInterviewDto = {
        applicationId: 'app-123',
        scheduledAt: new Date('2025-12-01T10:00:00Z'),
        durationMinutes: 60,
        locationType: LocationType.VIDEO,
        meetingLink: 'https://zoom.us/j/123456',
        participants: [{ userId: 'user-123', role: 'interviewer' }],
      };

      interviewRepository.create.mockReturnValue({ ...mockInterview, ...createInterviewDto });
      interviewRepository.save.mockResolvedValue({ ...mockInterview, ...createInterviewDto });

      const result = await service.create(createInterviewDto, mockUser);

      expect(result).toHaveProperty('id');
      expect(result.applicationId).toBe(createInterviewDto.applicationId);
      expect(result.status).toBe(InterviewStatus.SCHEDULED);
    });

    it('should validate scheduledAt is in the future', async () => {
      const createInterviewDto = {
        applicationId: 'app-123',
        scheduledAt: new Date('2020-01-01T10:00:00Z'), // Past date
        durationMinutes: 60,
        locationType: LocationType.VIDEO,
      };

      await expect(service.create(createInterviewDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate duration is positive', async () => {
      const createInterviewDto = {
        applicationId: 'app-123',
        scheduledAt: new Date('2025-12-01T10:00:00Z'),
        durationMinutes: -30,
        locationType: LocationType.VIDEO,
      };

      await expect(service.create(createInterviewDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated interviews', async () => {
      const interviews = [mockInterview];
      const queryBuilder = interviewRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([interviews, 1]);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        mockUser
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toEqual(interviews);
    });

    it('should filter interviews by status', async () => {
      const queryBuilder = interviewRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockInterview], 1]);

      await service.findAll(
        { page: 1, limit: 10, status: InterviewStatus.SCHEDULED },
        mockUser
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'interview.status = :status',
        { status: InterviewStatus.SCHEDULED }
      );
    });

    it('should filter interviews by date range', async () => {
      const queryBuilder = interviewRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockInterview], 1]);

      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      await service.findAll(
        { page: 1, limit: 10, startDate, endDate },
        mockUser
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'interview.scheduledAt >= :startDate',
        { startDate }
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'interview.scheduledAt <= :endDate',
        { endDate }
      );
    });
  });

  describe('findOne', () => {
    it('should return an interview by id', async () => {
      interviewRepository.findOne.mockResolvedValue(mockInterview);

      const result = await service.findOne('interview-123', mockUser);

      expect(result).toEqual(mockInterview);
    });

    it('should throw NotFoundException if interview not found', async () => {
      interviewRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update an interview', async () => {
      const updateInterviewDto = {
        scheduledAt: new Date('2025-12-02T14:00:00Z'),
        durationMinutes: 90,
      };

      interviewRepository.findOne.mockResolvedValue(mockInterview);
      interviewRepository.save.mockResolvedValue({ ...mockInterview, ...updateInterviewDto });

      const result = await service.update('interview-123', updateInterviewDto, mockUser);

      expect(result.scheduledAt).toEqual(updateInterviewDto.scheduledAt);
      expect(result.durationMinutes).toBe(updateInterviewDto.durationMinutes);
    });

    it('should throw NotFoundException if interview not found', async () => {
      interviewRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { durationMinutes: 90 }, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel an interview', async () => {
      interviewRepository.findOne.mockResolvedValue(mockInterview);
      interviewRepository.save.mockResolvedValue({
        ...mockInterview,
        status: InterviewStatus.CANCELLED,
      });

      const result = await service.cancel('interview-123', mockUser);

      expect(result.status).toBe(InterviewStatus.CANCELLED);
    });

    it('should throw BadRequestException if already completed', async () => {
      const completedInterview = { ...mockInterview, status: InterviewStatus.COMPLETED };
      interviewRepository.findOne.mockResolvedValue(completedInterview);

      await expect(service.cancel('interview-123', mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('complete', () => {
    it('should mark interview as completed', async () => {
      interviewRepository.findOne.mockResolvedValue(mockInterview);
      interviewRepository.save.mockResolvedValue({
        ...mockInterview,
        status: InterviewStatus.COMPLETED,
      });

      const result = await service.complete('interview-123', mockUser);

      expect(result.status).toBe(InterviewStatus.COMPLETED);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      const cancelledInterview = { ...mockInterview, status: InterviewStatus.CANCELLED };
      interviewRepository.findOne.mockResolvedValue(cancelledInterview);

      await expect(service.complete('interview-123', mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('submitFeedback', () => {
    it('should submit interview feedback', async () => {
      const feedbackDto = {
        interviewId: 'interview-123',
        overallRating: 4,
        decision: Decision.YES,
        strengths: 'Strong technical skills',
        concerns: 'Limited experience with cloud',
        attributeRatings: [
          { attribute: 'Technical Skills', rating: 5 },
          { attribute: 'Communication', rating: 4 },
        ],
      };

      interviewRepository.findOne.mockResolvedValue(mockInterview);
      feedbackRepository.create.mockReturnValue(feedbackDto);
      feedbackRepository.save.mockResolvedValue({
        id: 'feedback-123',
        ...feedbackDto,
        interviewerId: mockUser.id,
        submittedAt: new Date(),
      });

      const result = await service.submitFeedback(feedbackDto, mockUser);

      expect(result).toHaveProperty('id');
      expect(result.overallRating).toBe(feedbackDto.overallRating);
      expect(result.decision).toBe(feedbackDto.decision);
      expect(result.submittedAt).toBeDefined();
    });

    it('should validate overall rating is between 1 and 5', async () => {
      const feedbackDto = {
        interviewId: 'interview-123',
        overallRating: 6, // Invalid
        decision: Decision.YES,
        strengths: 'Good',
        concerns: 'None',
      };

      await expect(service.submitFeedback(feedbackDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if interview not found', async () => {
      interviewRepository.findOne.mockResolvedValue(null);

      const feedbackDto = {
        interviewId: 'nonexistent',
        overallRating: 4,
        decision: Decision.YES,
        strengths: 'Good',
        concerns: 'None',
      };

      await expect(service.submitFeedback(feedbackDto, mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getFeedback', () => {
    it('should return all feedback for an interview', async () => {
      const feedback = [
        {
          id: 'feedback-1',
          interviewId: 'interview-123',
          interviewerId: 'user-1',
          overallRating: 4,
          decision: Decision.YES,
        },
        {
          id: 'feedback-2',
          interviewId: 'interview-123',
          interviewerId: 'user-2',
          overallRating: 5,
          decision: Decision.STRONG_YES,
        },
      ];

      feedbackRepository.find.mockResolvedValue(feedback);

      const result = await service.getFeedback('interview-123', mockUser);

      expect(result).toEqual(feedback);
      expect(result).toHaveLength(2);
    });
  });
});
