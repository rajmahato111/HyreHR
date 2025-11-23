import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, In } from 'typeorm';
import { Candidate } from '../../database/entities/candidate.entity';
import { CandidateMergeHistory } from '../../database/entities/candidate-merge-history.entity';
import {
  CreateCandidateDto,
  UpdateCandidateDto,
  FilterCandidateDto,
  MergeCandidateDto,
} from './dto';
import {
  createPaginatedResponse,
  PaginatedResponse,
} from '../../common/dto/pagination.dto';
import { ElasticsearchService, CandidateSearchQuery } from './elasticsearch.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateMergeHistory)
    private mergeHistoryRepository: Repository<CandidateMergeHistory>,
    private elasticsearchService: ElasticsearchService,
  ) { }

  async create(
    createCandidateDto: CreateCandidateDto,
    organizationId: string,
  ): Promise<Candidate> {
    // Check for duplicates
    const duplicates = await this.findDuplicates(
      createCandidateDto.email,
      organizationId,
    );

    if (duplicates.length > 0) {
      throw new ConflictException({
        message: 'Duplicate candidate found',
        duplicates: duplicates.map((c) => ({
          id: c.id,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
        })),
      });
    }

    const candidate = this.candidateRepository.create({
      ...createCandidateDto,
      organizationId,
    });

    // Set GDPR consent date if consent is given
    if (candidate.gdprConsent && !candidate.gdprConsentDate) {
      candidate.gdprConsentDate = new Date();
    }

    const savedCandidate = await this.candidateRepository.save(candidate);

    // Index in Elasticsearch
    await this.elasticsearchService.indexCandidate(savedCandidate);

    return savedCandidate;
  }

  async findAll(
    filterDto: FilterCandidateDto,
    organizationId: string,
  ): Promise<PaginatedResponse<Candidate>> {
    const {
      page = 1,
      limit = 20,
      search,
      locationCity,
      locationState,
      locationCountry,
      currentCompany,
      tags,
      sourceType,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.organizationId = :organizationId', { organizationId });

    // Search across multiple fields
    if (search) {
      queryBuilder.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search OR candidate.currentTitle ILIKE :search OR candidate.currentCompany ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Location filters
    if (locationCity) {
      queryBuilder.andWhere('candidate.locationCity ILIKE :locationCity', {
        locationCity: `%${locationCity}%`,
      });
    }

    if (locationState) {
      queryBuilder.andWhere('candidate.locationState = :locationState', {
        locationState,
      });
    }

    if (locationCountry) {
      queryBuilder.andWhere('candidate.locationCountry = :locationCountry', {
        locationCountry,
      });
    }

    // Company filter
    if (currentCompany) {
      queryBuilder.andWhere('candidate.currentCompany ILIKE :currentCompany', {
        currentCompany: `%${currentCompany}%`,
      });
    }

    // Tags filter (contains any of the specified tags)
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('candidate.tags && :tags', { tags });
    }

    // Source type filter
    if (sourceType) {
      queryBuilder.andWhere('candidate.sourceType = :sourceType', {
        sourceType,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`candidate.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [candidates, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(candidates, total, page, limit);
  }

  async findOne(id: string, organizationId: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id, organizationId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
    organizationId: string,
  ): Promise<Candidate> {
    const candidate = await this.findOne(id, organizationId);

    // If email is being updated, check for duplicates
    if (
      updateCandidateDto.email &&
      updateCandidateDto.email !== candidate.email
    ) {
      const duplicates = await this.findDuplicates(
        updateCandidateDto.email,
        organizationId,
        id,
      );

      if (duplicates.length > 0) {
        throw new ConflictException({
          message: 'Duplicate candidate found with this email',
          duplicates: duplicates.map((c: Candidate) => ({
            id: c.id,
            email: c.email,
            firstName: c.firstName,
            lastName: c.lastName,
          })),
        });
      }
    }

    // Update GDPR consent date if consent is being given
    if (
      updateCandidateDto.gdprConsent &&
      !candidate.gdprConsent
    ) {
      (updateCandidateDto as any).gdprConsentDate = new Date();
    }

    Object.assign(candidate, updateCandidateDto);

    const updatedCandidate = await this.candidateRepository.save(candidate);

    // Update in Elasticsearch
    await this.elasticsearchService.updateCandidate(updatedCandidate);

    return updatedCandidate;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const candidate = await this.findOne(id, organizationId);
    await this.candidateRepository.remove(candidate);

    // Remove from Elasticsearch
    await this.elasticsearchService.deleteCandidate(id);
  }

  async findDuplicates(
    email: string,
    organizationId: string,
    excludeId?: string,
  ): Promise<Candidate[]> {
    const where: FindOptionsWhere<Candidate> = {
      organizationId,
      email: ILike(email),
    };

    const candidates = await this.candidateRepository.find({ where });

    // Filter out the excluded ID if provided
    return excludeId
      ? candidates.filter((c) => c.id !== excludeId)
      : candidates;
  }

  async merge(
    sourceCandidateId: string,
    mergeCandidateDto: MergeCandidateDto,
    organizationId: string,
    userId: string,
  ): Promise<Candidate> {
    const { targetCandidateId, fieldResolutions = {} } = mergeCandidateDto;

    // Validate both candidates exist and belong to the organization
    const sourceCandidate = await this.findOne(
      sourceCandidateId,
      organizationId,
    );
    const targetCandidate = await this.findOne(
      targetCandidateId,
      organizationId,
    );

    if (sourceCandidateId === targetCandidateId) {
      throw new BadRequestException('Cannot merge a candidate with itself');
    }

    // Merge logic: for each field, use the resolution if provided, otherwise prefer non-null values
    const mergedData: Partial<Candidate> = {};

    const fields: (keyof Candidate)[] = [
      'firstName',
      'lastName',
      'phone',
      'locationCity',
      'locationState',
      'locationCountry',
      'currentCompany',
      'currentTitle',
      'linkedinUrl',
      'githubUrl',
      'portfolioUrl',
      'sourceType',
    ];

    for (const field of fields) {
      const resolution = fieldResolutions[field];

      if (resolution === 'source') {
        (mergedData as any)[field] = sourceCandidate[field];
      } else if (resolution === 'target') {
        (mergedData as any)[field] = targetCandidate[field];
      } else {
        // Default: prefer source if it has a value, otherwise use target
        (mergedData as any)[field] =
          sourceCandidate[field] || targetCandidate[field];
      }
    }

    // Merge tags (combine unique tags from both)
    const combinedTags = [
      ...new Set([...sourceCandidate.tags, ...targetCandidate.tags]),
    ];
    mergedData.tags = combinedTags;

    // Merge custom fields (combine both objects, source takes precedence)
    mergedData.customFields = {
      ...targetCandidate.customFields,
      ...sourceCandidate.customFields,
    };

    // Merge source details
    mergedData.sourceDetails = {
      ...targetCandidate.sourceDetails,
      ...sourceCandidate.sourceDetails,
      mergedFrom: sourceCandidateId,
      mergedAt: new Date().toISOString(),
    };

    // GDPR consent: keep if either has consented
    if (sourceCandidate.gdprConsent || targetCandidate.gdprConsent) {
      mergedData.gdprConsent = true;
      mergedData.gdprConsentDate =
        sourceCandidate.gdprConsentDate || targetCandidate.gdprConsentDate;
    }

    // Store original target data for history
    const targetDataBefore = { ...targetCandidate };

    // Update target candidate with merged data
    Object.assign(targetCandidate, mergedData);
    const updatedCandidate = await this.candidateRepository.save(
      targetCandidate,
    );

    // Create merge history record
    const mergeHistory = this.mergeHistoryRepository.create({
      organizationId,
      sourceCandidateId,
      targetCandidateId,
      mergedBy: userId,
      sourceData: {
        id: sourceCandidate.id,
        email: sourceCandidate.email,
        firstName: sourceCandidate.firstName,
        lastName: sourceCandidate.lastName,
        phone: sourceCandidate.phone,
        locationCity: sourceCandidate.locationCity,
        locationState: sourceCandidate.locationState,
        locationCountry: sourceCandidate.locationCountry,
        currentCompany: sourceCandidate.currentCompany,
        currentTitle: sourceCandidate.currentTitle,
        tags: sourceCandidate.tags,
        customFields: sourceCandidate.customFields,
      },
      targetDataBefore: {
        id: targetDataBefore.id,
        email: targetDataBefore.email,
        firstName: targetDataBefore.firstName,
        lastName: targetDataBefore.lastName,
        phone: targetDataBefore.phone,
        locationCity: targetDataBefore.locationCity,
        locationState: targetDataBefore.locationState,
        locationCountry: targetDataBefore.locationCountry,
        currentCompany: targetDataBefore.currentCompany,
        currentTitle: targetDataBefore.currentTitle,
        tags: targetDataBefore.tags,
        customFields: targetDataBefore.customFields,
      },
      fieldResolutions,
    });

    await this.mergeHistoryRepository.save(mergeHistory);

    // TODO: In a real implementation, we would also need to:
    // 1. Move all applications from source to target
    // 2. Move all communications from source to target
    // 3. Update talent pool memberships
    // For now, we'll just delete the source candidate

    await this.candidateRepository.remove(sourceCandidate);

    // Update Elasticsearch - delete source and update target
    await this.elasticsearchService.deleteCandidate(sourceCandidateId);
    await this.elasticsearchService.updateCandidate(updatedCandidate);

    return updatedCandidate;
  }

  async getMergeHistory(
    candidateId: string,
    organizationId: string,
  ): Promise<CandidateMergeHistory[]> {
    return this.mergeHistoryRepository.find({
      where: [
        { targetCandidateId: candidateId, organizationId },
        { sourceCandidateId: candidateId, organizationId },
      ],
      relations: ['mergedByUser'],
      order: { mergedAt: 'DESC' },
    });
  }

  async searchWithElasticsearch(
    searchQuery: CandidateSearchQuery,
    organizationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.elasticsearchService.search(
      searchQuery,
      organizationId,
      page,
      limit,
    );
  }

  async getStatistics(organizationId: string) {
    const total = await this.candidateRepository.count({
      where: { organizationId },
    });

    const withGdprConsent = await this.candidateRepository.count({
      where: { organizationId, gdprConsent: true },
    });

    // Get top sources
    const sourcesQuery = await this.candidateRepository
      .createQueryBuilder('candidate')
      .select('candidate.sourceType', 'sourceType')
      .addSelect('COUNT(*)', 'count')
      .where('candidate.organizationId = :organizationId', { organizationId })
      .andWhere('candidate.sourceType IS NOT NULL')
      .groupBy('candidate.sourceType')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      total,
      withGdprConsent,
      topSources: sourcesQuery.map((s: any) => ({
        sourceType: s.sourceType,
        count: parseInt(s.count),
      })),
    };
  }
}
