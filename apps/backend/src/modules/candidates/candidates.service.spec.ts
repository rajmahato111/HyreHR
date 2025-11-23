import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { Candidate } from '../../database/entities/candidate.entity';
import { CandidateMergeHistory } from '../../database/entities/candidate-merge-history.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { ElasticsearchService } from './elasticsearch.service';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let candidateRepository: any;
  let mergeHistoryRepository: any;
  let elasticsearchService: any;

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-123',
    email: 'recruiter@example.com',
    role: UserRole.RECRUITER,
  } as User;

  const mockCandidate: Candidate = {
    id: 'candidate-123',
    organizationId: 'org-123',
    email: 'candidate@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567890',
    tags: ['javascript', 'react'],
    gdprConsent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Candidate;

  beforeEach(async () => {
    const mockCandidateRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockMergeHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockElasticsearchService = {
      indexCandidate: jest.fn(),
      searchCandidates: jest.fn(),
      deleteCandidate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockCandidateRepository,
        },
        {
          provide: getRepositoryToken(CandidateMergeHistory),
          useValue: mockMergeHistoryRepository,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    candidateRepository = module.get(getRepositoryToken(Candidate));
    mergeHistoryRepository = module.get(getRepositoryToken(CandidateMergeHistory));
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new candidate', async () => {
      const createCandidateDto = {
        email: 'newcandidate@example.com',
        firstName: 'John',
        lastName: 'Doe',
        gdprConsent: true,
      };

      candidateRepository.find.mockResolvedValue([]);
      candidateRepository.create.mockReturnValue({ ...mockCandidate, ...createCandidateDto });
      candidateRepository.save.mockResolvedValue({ ...mockCandidate, ...createCandidateDto });
      elasticsearchService.indexCandidate.mockResolvedValue(undefined);

      const result = await service.create(createCandidateDto, mockUser.organizationId);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createCandidateDto.email);
      expect(result.organizationId).toBe(mockUser.organizationId);
      expect(elasticsearchService.indexCandidate).toHaveBeenCalled();
    });

    it('should throw ConflictException if candidate email already exists', async () => {
      const createCandidateDto = {
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        gdprConsent: true,
      };

      candidateRepository.find.mockResolvedValue([mockCandidate]);

      await expect(service.create(createCandidateDto, mockUser.organizationId)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated candidates', async () => {
      const candidates = [mockCandidate];
      const queryBuilder = candidateRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([candidates, 1]);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        mockUser.organizationId
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(candidates);
      expect(result.meta.total).toBe(1);
    });

    it('should filter candidates by tags', async () => {
      const queryBuilder = candidateRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockCandidate], 1]);

      await service.findAll(
        { page: 1, limit: 10, tags: ['javascript'] },
        mockUser.organizationId
      );

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a candidate by id', async () => {
      candidateRepository.findOne.mockResolvedValue(mockCandidate);

      const result = await service.findOne('candidate-123', mockUser.organizationId);

      expect(result).toEqual(mockCandidate);
      expect(candidateRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'candidate-123', organizationId: mockUser.organizationId },
      });
    });

    it('should throw NotFoundException if candidate not found', async () => {
      candidateRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser.organizationId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a candidate', async () => {
      const updateCandidateDto = {
        firstName: 'Updated',
        phone: '+9876543210',
      };

      candidateRepository.findOne.mockResolvedValue(mockCandidate);
      candidateRepository.save.mockResolvedValue({ ...mockCandidate, ...updateCandidateDto });
      elasticsearchService.indexCandidate.mockResolvedValue(undefined);

      const result = await service.update('candidate-123', updateCandidateDto, mockUser.organizationId);

      expect(result.firstName).toBe(updateCandidateDto.firstName);
      expect(result.phone).toBe(updateCandidateDto.phone);
      expect(elasticsearchService.indexCandidate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if candidate not found', async () => {
      candidateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { firstName: 'New' }, mockUser.organizationId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a candidate (GDPR)', async () => {
      candidateRepository.findOne.mockResolvedValue(mockCandidate);
      candidateRepository.remove.mockResolvedValue(mockCandidate);
      elasticsearchService.deleteCandidate.mockResolvedValue(undefined);

      await service.remove('candidate-123', mockUser.organizationId);

      expect(candidateRepository.remove).toHaveBeenCalledWith(mockCandidate);
      expect(elasticsearchService.deleteCandidate).toHaveBeenCalledWith('candidate-123');
    });

    it('should throw NotFoundException if candidate not found', async () => {
      candidateRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser.organizationId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('search', () => {
    it('should search candidates using Elasticsearch', async () => {
      const searchQuery = {
        query: 'javascript',
        page: 1,
        limit: 20,
      };

      const searchResults = {
        data: [mockCandidate],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      };

      elasticsearchService.searchCandidates.mockResolvedValue(searchResults);

      const result = await service.search(searchQuery, mockUser.organizationId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(elasticsearchService.searchCandidates).toHaveBeenCalledWith(
        searchQuery,
        mockUser.organizationId
      );
    });
  });
});
