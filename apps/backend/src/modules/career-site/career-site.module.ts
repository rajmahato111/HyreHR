import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CareerSite } from '../../database/entities/career-site.entity';
import { ApplicationForm } from '../../database/entities/application-form.entity';
import { CandidatePortalUser } from '../../database/entities/candidate-portal-user.entity';
import { Job } from '../../database/entities/job.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Application } from '../../database/entities/application.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { Interview } from '../../database/entities/interview.entity';
import { CareerSiteController } from './career-site.controller';
import { CareerSiteService } from './career-site.service';
import { ApplicationFormService } from './application-form.service';
import { PublicCareerSiteService } from './public-career-site.service';
import { CandidatePortalService } from './candidate-portal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CareerSite,
      ApplicationForm,
      CandidatePortalUser,
      Job,
      Candidate,
      Application,
      PipelineStage,
      Interview,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CareerSiteController],
  providers: [
    CareerSiteService,
    ApplicationFormService,
    PublicCareerSiteService,
    CandidatePortalService,
  ],
  exports: [
    CareerSiteService,
    ApplicationFormService,
    PublicCareerSiteService,
    CandidatePortalService,
  ],
})
export class CareerSiteModule {}
