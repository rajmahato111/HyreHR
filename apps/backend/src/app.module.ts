import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ResumeParserModule } from './modules/resume-parser/resume-parser.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { TalentPoolsModule } from './modules/talent-pools/talent-pools.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AIModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OffersModule } from './modules/offers/offers.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { SlaModule } from './modules/sla/sla.module';
import { CareerSiteModule } from './modules/career-site/career-site.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { PredictiveModule } from './modules/predictive/predictive.module';
import { BiasDetectionModule } from './modules/bias-detection/bias-detection.module';
import { GDPRModule } from './modules/gdpr/gdpr.module';
import { AuditModule } from './modules/audit/audit.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Common services (cache, CDN, performance monitoring, etc.)
    CommonModule,

    // Feature modules
    AuthModule,
    HealthModule,
    JobsModule,
    CandidatesModule,
    ApplicationsModule,
    ResumeParserModule,
    InterviewsModule,
    CommunicationModule,
    TalentPoolsModule,
    MatchingModule,
    AIModule,
    AnalyticsModule,
    OffersModule,
    WorkflowsModule,
    SlaModule,
    CareerSiteModule,
    SurveysModule,
    PredictiveModule,
    BiasDetectionModule,
    GDPRModule,
    AuditModule,
    PerformanceModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
