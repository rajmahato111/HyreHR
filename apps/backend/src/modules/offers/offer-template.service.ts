import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferTemplate } from '../../database/entities';
import {
  CreateOfferTemplateDto,
  UpdateOfferTemplateDto,
} from './dto';

@Injectable()
export class OfferTemplateService {
  constructor(
    @InjectRepository(OfferTemplate)
    private offerTemplateRepository: Repository<OfferTemplate>,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    createDto: CreateOfferTemplateDto,
  ): Promise<OfferTemplate> {
    const template = this.offerTemplateRepository.create({
      ...createDto,
      organizationId,
      createdBy: userId,
      variables: createDto.variables || [],
      defaultCurrency: createDto.defaultCurrency || 'USD',
      expiryDays: createDto.expiryDays || 7,
      active: createDto.active !== undefined ? createDto.active : true,
    });

    return this.offerTemplateRepository.save(template);
  }

  async findAll(organizationId: string): Promise<OfferTemplate[]> {
    return this.offerTemplateRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(organizationId: string): Promise<OfferTemplate[]> {
    return this.offerTemplateRepository.find({
      where: { organizationId, active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<OfferTemplate> {
    const template = await this.offerTemplateRepository.findOne({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Offer template not found');
    }

    return template;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateOfferTemplateDto,
  ): Promise<OfferTemplate> {
    const template = await this.findOne(id, organizationId);

    Object.assign(template, updateDto);

    return this.offerTemplateRepository.save(template);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const template = await this.findOne(id, organizationId);
    await this.offerTemplateRepository.remove(template);
  }

  async renderTemplate(
    templateId: string,
    organizationId: string,
    variables: Record<string, any>,
  ): Promise<string> {
    const template = await this.findOne(templateId, organizationId);

    let content = template.content;

    // Replace variables in the format {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    return content;
  }
}
