import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  TalentPool,
  TalentPoolType,
  Candidate,
} from '../../database/entities';
import {
  CreateTalentPoolDto,
  UpdateTalentPoolDto,
  AddCandidatesDto,
} from './dto';

@Injectable()
export class TalentPoolsService {
  constructor(
    @InjectRepository(TalentPool)
    private talentPoolRepository: Repository<TalentPool>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateTalentPoolDto,
  ): Promise<TalentPool> {
    const pool = this.talentPoolRepository.create({
      ...createDto,
      organizationId,
    });

    const savedPool = await this.talentPoolRepository.save(pool);

    // If static pool with initial candidates, add them
    if (
      createDto.type === TalentPoolType.STATIC &&
      createDto.candidateIds?.length > 0
    ) {
      await this.addCandidates(savedPool.id, organizationId, {
        candidateIds: createDto.candidateIds,
      });
    }

    // If dynamic pool, sync immediately
    if (createDto.type === TalentPoolType.DYNAMIC && createDto.criteria) {
      await this.syncDynamicPool(savedPool.id, organizationId);
    }

    return this.findOne(savedPool.id, organizationId);
  }

  async findAll(organizationId: string): Promise<TalentPool[]> {
    return this.talentPoolRepository.find({
      where: { organizationId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<TalentPool> {
    const pool = await this.talentPoolRepository.findOne({
      where: { id, organizationId },
      relations: ['owner', 'candidates'],
    });

    if (!pool) {
      throw new NotFoundException(`Talent pool with ID ${id} not found`);
    }

    return pool;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateTalentPoolDto,
  ): Promise<TalentPool> {
    const pool = await this.findOne(id, organizationId);

    Object.assign(pool, updateDto);
    await this.talentPoolRepository.save(pool);

    // If criteria changed for dynamic pool, resync
    if (
      pool.type === TalentPoolType.DYNAMIC &&
      updateDto.criteria
    ) {
      await this.syncDynamicPool(id, organizationId);
    }

    return this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const pool = await this.findOne(id, organizationId);
    await this.talentPoolRepository.remove(pool);
  }

  async addCandidates(
    id: string,
    organizationId: string,
    addDto: AddCandidatesDto,
  ): Promise<TalentPool> {
    const pool = await this.findOne(id, organizationId);

    if (pool.type !== TalentPoolType.STATIC) {
      throw new BadRequestException(
        'Can only manually add candidates to static pools',
      );
    }

    // Verify candidates exist and belong to organization
    const candidates = await this.candidateRepository.find({
      where: {
        id: In(addDto.candidateIds),
        organizationId,
      },
    });

    if (candidates.length !== addDto.candidateIds.length) {
      throw new BadRequestException('Some candidates not found');
    }

    // Add candidates to pool
    if (!pool.candidates) {
      pool.candidates = [];
    }

    const existingIds = new Set(pool.candidates.map((c) => c.id));
    const newCandidates = candidates.filter((c) => !existingIds.has(c.id));

    pool.candidates.push(...newCandidates);
    pool.memberCount = pool.candidates.length;

    await this.talentPoolRepository.save(pool);

    return this.findOne(id, organizationId);
  }

  async removeCandidates(
    id: string,
    organizationId: string,
    candidateIds: string[],
  ): Promise<TalentPool> {
    const pool = await this.findOne(id, organizationId);

    if (pool.type !== TalentPoolType.STATIC) {
      throw new BadRequestException(
        'Can only manually remove candidates from static pools',
      );
    }

    pool.candidates = pool.candidates.filter(
      (c) => !candidateIds.includes(c.id),
    );
    pool.memberCount = pool.candidates.length;

    await this.talentPoolRepository.save(pool);

    return this.findOne(id, organizationId);
  }

  async syncDynamicPool(
    id: string,
    organizationId: string,
  ): Promise<TalentPool> {
    const pool = await this.findOne(id, organizationId);

    if (pool.type !== TalentPoolType.DYNAMIC) {
      throw new BadRequestException('Can only sync dynamic pools');
    }

    if (!pool.criteria) {
      throw new BadRequestException('Dynamic pool must have criteria');
    }

    // Build query based on criteria
    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.organizationId = :organizationId', { organizationId });

    if (pool.criteria.skills?.length > 0) {
      queryBuilder.andWhere(
        `candidate.skills && ARRAY[:...skills]::text[]`,
        { skills: pool.criteria.skills },
      );
    }

    if (pool.criteria.experience) {
      if (pool.criteria.experience.min !== undefined) {
        queryBuilder.andWhere(
          'candidate.yearsOfExperience >= :minExp',
          { minExp: pool.criteria.experience.min },
        );
      }
      if (pool.criteria.experience.max !== undefined) {
        queryBuilder.andWhere(
          'candidate.yearsOfExperience <= :maxExp',
          { maxExp: pool.criteria.experience.max },
        );
      }
    }

    if (pool.criteria.location?.length > 0) {
      queryBuilder.andWhere(
        'candidate.locationCity IN (:...locations)',
        { locations: pool.criteria.location },
      );
    }

    if (pool.criteria.tags?.length > 0) {
      queryBuilder.andWhere(
        `candidate.tags && ARRAY[:...tags]::text[]`,
        { tags: pool.criteria.tags },
      );
    }

    if (pool.criteria.currentTitle) {
      queryBuilder.andWhere(
        'candidate.currentTitle ILIKE :title',
        { title: `%${pool.criteria.currentTitle}%` },
      );
    }

    if (pool.criteria.currentCompany) {
      queryBuilder.andWhere(
        'candidate.currentCompany ILIKE :company',
        { company: `%${pool.criteria.currentCompany}%` },
      );
    }

    const candidates = await queryBuilder.getMany();

    pool.candidates = candidates;
    pool.memberCount = candidates.length;
    pool.lastSyncedAt = new Date();

    await this.talentPoolRepository.save(pool);

    return this.findOne(id, organizationId);
  }

  async getCandidates(
    id: string,
    organizationId: string,
  ): Promise<Candidate[]> {
    const pool = await this.findOne(id, organizationId);
    return pool.candidates || [];
  }

  async updateEngagementMetrics(
    id: string,
    organizationId: string,
  ): Promise<void> {
    const pool = await this.findOne(id, organizationId);

    // Calculate engagement rate based on email opens, replies, etc.
    // This would integrate with the communication service
    // For now, we'll just update the timestamp
    pool.updatedAt = new Date();
    await this.talentPoolRepository.save(pool);
  }
}
