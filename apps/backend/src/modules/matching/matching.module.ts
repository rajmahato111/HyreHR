import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { MatchingController } from './matching.controller';
import { CandidateMatchingService } from './candidate-matching.service';
import { SkillMatchingService } from './skill-matching.service';
import { ExperienceMatchingService } from './experience-matching.service';
import { EducationMatchingService } from './education-matching.service';
import { LocationMatchingService } from './location-matching.service';
import { TitleMatchingService } from './title-matching.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, Job, Application]),
  ],
  controllers: [MatchingController],
  providers: [
    CandidateMatchingService,
    SkillMatchingService,
    ExperienceMatchingService,
    EducationMatchingService,
    LocationMatchingService,
    TitleMatchingService,
  ],
  exports: [
    CandidateMatchingService,
    SkillMatchingService,
    ExperienceMatchingService,
    EducationMatchingService,
    LocationMatchingService,
    TitleMatchingService,
  ],
})
export class MatchingModule {}
