import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey, SurveyResponse } from '../../database/entities';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { SurveyResponseService } from './survey-response.service';
import { SurveyTriggerService } from './survey-trigger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyResponse])],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyResponseService, SurveyTriggerService],
  exports: [SurveysService, SurveyResponseService, SurveyTriggerService],
})
export class SurveysModule {}
