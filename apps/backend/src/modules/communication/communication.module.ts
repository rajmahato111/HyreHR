import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Communication,
  EmailTemplate,
  Candidate,
  Application,
  ApplicationHistory,
  Interview,
  InterviewFeedback,
} from '../../database/entities';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { EmailTemplateService } from './email-template.service';
import { ActivityFeedService } from './activity-feed.service';
import { EmailTrackingService } from './email-tracking.service';
import { GmailService } from './providers/gmail.service';
import { OutlookService } from './providers/outlook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Communication,
      EmailTemplate,
      Candidate,
      Application,
      ApplicationHistory,
      Interview,
      InterviewFeedback,
    ]),
  ],
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    EmailTemplateService,
    ActivityFeedService,
    EmailTrackingService,
    GmailService,
    OutlookService,
  ],
  exports: [
    CommunicationService,
    EmailTemplateService,
    ActivityFeedService,
    EmailTrackingService,
  ],
})
export class CommunicationModule {}
