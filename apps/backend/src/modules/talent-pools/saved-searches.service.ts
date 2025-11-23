import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from '../../database/entities';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private savedSearchRepository: Repository<SavedSearch>,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    createDto: CreateSavedSearchDto,
  ): Promise<SavedSearch> {
    const savedSearch = this.savedSearchRepository.create({
      ...createDto,
      organizationId,
      userId,
    });

    return this.savedSearchRepository.save(savedSearch);
  }

  async findAll(
    organizationId: string,
    userId: string,
  ): Promise<SavedSearch[]> {
    return this.savedSearchRepository.find({
      where: [
        { organizationId, userId },
        { organizationId, isShared: true },
      ],
      relations: ['user'],
      order: { lastUsedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, organizationId },
      relations: ['user'],
    });

    if (!savedSearch) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    // Check access - must be owner or shared
    if (savedSearch.userId !== userId && !savedSearch.isShared) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    return savedSearch;
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    updateDto: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, organizationId, userId },
    });

    if (!savedSearch) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    Object.assign(savedSearch, updateDto);
    return this.savedSearchRepository.save(savedSearch);
  }

  async remove(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, organizationId, userId },
    });

    if (!savedSearch) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    await this.savedSearchRepository.remove(savedSearch);
  }

  async recordUsage(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const savedSearch = await this.findOne(id, organizationId, userId);

    savedSearch.lastUsedAt = new Date();
    savedSearch.useCount++;

    await this.savedSearchRepository.save(savedSearch);
  }
}
