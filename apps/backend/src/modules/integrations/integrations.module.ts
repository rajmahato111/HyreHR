import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Integration, Webhook, WebhookLog, Job } from '../../database/entities';
import { IntegrationsController } from './integrations.controller';
import { IntegrationConfigService } from './integration-config.service';
import { OAuthService } from './oauth.service';
import { WebhookService } from './webhook.service';
import { IntegrationHealthService } from './integration-health.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { JobBoardController } from './job-boards/job-board.controller';
import { JobBoardPostingService } from './job-boards/job-board-posting.service';
import { LinkedInJobBoardService } from './job-boards/linkedin.service';
import { IndeedJobBoardService } from './job-boards/indeed.service';
import { GlassdoorJobBoardService } from './job-boards/glassdoor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, Webhook, WebhookLog, Job]),
    ScheduleModule.forRoot(),
  ],
  controllers: [IntegrationsController, JobBoardController],
  providers: [
    IntegrationConfigService,
    OAuthService,
    WebhookService,
    IntegrationHealthService,
    EncryptionService,
    JobBoardPostingService,
    LinkedInJobBoardService,
    IndeedJobBoardService,
    GlassdoorJobBoardService,
  ],
  exports: [
    IntegrationConfigService,
    OAuthService,
    WebhookService,
    IntegrationHealthService,
    JobBoardPostingService,
  ],
})
export class IntegrationsModule {}
