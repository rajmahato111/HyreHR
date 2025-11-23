import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiasDetectionController } from './bias-detection.controller';
import { BiasDetectionService } from './bias-detection.service';
import { BiasLanguageService } from './bias-language.service';
import { StatisticalAnalysisService } from './statistical-analysis.service';
import { BiasAlertService } from './bias-alert.service';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { Application } from '../../database/entities/application.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Interview } from '../../database/entities/interview.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewFeedback,
      Application,
      Candidate,
      Interview,
    ]),
  ],
  controllers: [BiasDetectionController],
  providers: [
    BiasDetectionService,
    BiasLanguageService,
    StatisticalAnalysisService,
    BiasAlertService,
  ],
  exports: [BiasDetectionService],
})
export class BiasDetectionModule {}
