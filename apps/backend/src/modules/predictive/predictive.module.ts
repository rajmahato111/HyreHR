import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictiveController } from './predictive.controller';
import { TimeToFillService } from './time-to-fill.service';
import { OfferAcceptanceService } from './offer-acceptance.service';
import { FeatureEngineeringService } from './feature-engineering.service';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { Offer } from '../../database/entities/offer.entity';
import { Interview } from '../../database/entities/interview.entity';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { SurveyResponse } from '../../database/entities/survey-response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Application,
      Offer,
      Interview,
      InterviewFeedback,
      SurveyResponse,
    ]),
  ],
  controllers: [PredictiveController],
  providers: [
    TimeToFillService,
    OfferAcceptanceService,
    FeatureEngineeringService,
  ],
  exports: [TimeToFillService, OfferAcceptanceService],
})
export class PredictiveModule {}
