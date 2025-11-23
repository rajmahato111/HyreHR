import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationForm } from '../../database/entities/application-form.entity';
import { CreateApplicationFormDto, UpdateApplicationFormDto } from './dto';

@Injectable()
export class ApplicationFormService {
  constructor(
    @InjectRepository(ApplicationForm)
    private applicationFormRepository: Repository<ApplicationForm>,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateApplicationFormDto,
  ): Promise<ApplicationForm> {
    // If setting as default, unset other defaults
    if (createDto.isDefault) {
      await this.applicationFormRepository.update(
        { organizationId, isDefault: true },
        { isDefault: false },
      );
    }

    const form = this.applicationFormRepository.create({
      ...createDto,
      organizationId,
    });

    return this.applicationFormRepository.save(form);
  }

  async findAll(organizationId: string): Promise<ApplicationForm[]> {
    return this.applicationFormRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<ApplicationForm> {
    const form = await this.applicationFormRepository.findOne({
      where: { id, organizationId },
    });

    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    return form;
  }

  async findByJobId(jobId: string, organizationId: string): Promise<ApplicationForm> {
    // First try to find job-specific form
    let form = await this.applicationFormRepository.findOne({
      where: { jobId, organizationId },
    });

    // If not found, get default form
    if (!form) {
      form = await this.applicationFormRepository.findOne({
        where: { organizationId, isDefault: true },
      });
    }

    if (!form) {
      throw new NotFoundException('No application form found for this job');
    }

    return form;
  }

  async findDefault(organizationId: string): Promise<ApplicationForm> {
    const form = await this.applicationFormRepository.findOne({
      where: { organizationId, isDefault: true },
    });

    if (!form) {
      throw new NotFoundException('No default application form found');
    }

    return form;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    const form = await this.findOne(id, organizationId);

    // If setting as default, unset other defaults
    if (updateDto.isDefault && !form.isDefault) {
      await this.applicationFormRepository.update(
        { organizationId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(form, updateDto);
    return this.applicationFormRepository.save(form);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const form = await this.findOne(id, organizationId);
    await this.applicationFormRepository.remove(form);
  }
}
