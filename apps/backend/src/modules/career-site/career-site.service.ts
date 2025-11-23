import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerSite } from '../../database/entities/career-site.entity';
import { CreateCareerSiteDto, UpdateCareerSiteDto } from './dto';

@Injectable()
export class CareerSiteService {
  constructor(
    @InjectRepository(CareerSite)
    private careerSiteRepository: Repository<CareerSite>,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateCareerSiteDto,
  ): Promise<CareerSite> {
    // Check if slug already exists
    const existing = await this.careerSiteRepository.findOne({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Career site with this slug already exists');
    }

    const careerSite = this.careerSiteRepository.create({
      ...createDto,
      organizationId,
    });

    return this.careerSiteRepository.save(careerSite);
  }

  async findAll(organizationId: string): Promise<CareerSite[]> {
    return this.careerSiteRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<CareerSite> {
    const careerSite = await this.careerSiteRepository.findOne({
      where: { id, organizationId },
    });

    if (!careerSite) {
      throw new NotFoundException('Career site not found');
    }

    return careerSite;
  }

  async findBySlug(slug: string): Promise<CareerSite> {
    const careerSite = await this.careerSiteRepository.findOne({
      where: { slug, published: true },
    });

    if (!careerSite) {
      throw new NotFoundException('Career site not found');
    }

    return careerSite;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateCareerSiteDto,
  ): Promise<CareerSite> {
    const careerSite = await this.findOne(id, organizationId);

    // Check slug uniqueness if being updated
    if (updateDto.slug && updateDto.slug !== careerSite.slug) {
      const existing = await this.careerSiteRepository.findOne({
        where: { slug: updateDto.slug },
      });

      if (existing) {
        throw new ConflictException('Career site with this slug already exists');
      }
    }

    Object.assign(careerSite, updateDto);
    return this.careerSiteRepository.save(careerSite);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const careerSite = await this.findOne(id, organizationId);
    await this.careerSiteRepository.remove(careerSite);
  }

  async publish(id: string, organizationId: string): Promise<CareerSite> {
    const careerSite = await this.findOne(id, organizationId);
    careerSite.published = true;
    return this.careerSiteRepository.save(careerSite);
  }

  async unpublish(id: string, organizationId: string): Promise<CareerSite> {
    const careerSite = await this.findOne(id, organizationId);
    careerSite.published = false;
    return this.careerSiteRepository.save(careerSite);
  }
}
