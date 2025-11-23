import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TalentPool,
  EmailSequence,
  SequenceEnrollment,
  SavedSearch,
  Candidate,
} from '../../database/entities';
import { TalentPoolsController } from './talent-pools.controller';
import { TalentPoolsService } from './talent-pools.service';
import { EmailSequencesService } from './email-sequences.service';
import { SavedSearchesService } from './saved-searches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TalentPool,
      EmailSequence,
      SequenceEnrollment,
      SavedSearch,
      Candidate,
    ]),
  ],
  controllers: [TalentPoolsController],
  providers: [
    TalentPoolsService,
    EmailSequencesService,
    SavedSearchesService,
  ],
  exports: [
    TalentPoolsService,
    EmailSequencesService,
    SavedSearchesService,
  ],
})
export class TalentPoolsModule {}
