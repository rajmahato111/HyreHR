import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';
import { MetricsCalculationService } from './metrics-calculation.service';
import { DashboardService } from './dashboard.service';
import { ReportService } from './report.service';
import { Application } from '../../database/entities/application.entity';
import { Interview } from '../../database/entities/interview.entity';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Interview,
      InterviewFeedback,
      Candidate,
      Job,
    ]),
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    MetricsCalculationService,
    DashboardService,
    ReportService,
  ],
  exports: [
    MetricsCalculationService,
    DashboardService,
    ReportService,
  ],
})
export class AnalyticsModule {}
