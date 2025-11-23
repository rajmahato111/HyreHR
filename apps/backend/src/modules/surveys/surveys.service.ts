import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, SurveyTriggerType } from '../../database/entities';
import { CreateSurveyDto, UpdateSurveyDto } from './dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    createSurveyDto: CreateSurveyDto,
  ): Promise<Survey> {
    const survey = this.surveyRepository.create({
      ...createSurveyDto,
      organizationId,
      createdBy: userId,
    });

    return this.surveyRepository.save(survey);
  }

  async findAll(organizationId: string): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id, organizationId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async findByTriggerType(
    organizationId: string,
    triggerType: SurveyTriggerType,
  ): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: {
        organizationId,
        triggerType,
        active: true,
      },
    });
  }

  async update(
    id: string,
    organizationId: string,
    updateSurveyDto: UpdateSurveyDto,
  ): Promise<Survey> {
    const survey = await this.findOne(id, organizationId);

    Object.assign(survey, updateSurveyDto);

    return this.surveyRepository.save(survey);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const survey = await this.findOne(id, organizationId);
    await this.surveyRepository.remove(survey);
  }

  async toggleActive(id: string, organizationId: string): Promise<Survey> {
    const survey = await this.findOne(id, organizationId);
    survey.active = !survey.active;
    return this.surveyRepository.save(survey);
  }
}
