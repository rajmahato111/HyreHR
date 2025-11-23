import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { ElasticsearchService } from './elasticsearch.service';
import { Candidate } from '../../database/entities/candidate.entity';
import { CandidateMergeHistory } from '../../database/entities/candidate-merge-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, CandidateMergeHistory])],
  controllers: [CandidatesController],
  providers: [CandidatesService, ElasticsearchService],
  exports: [CandidatesService, ElasticsearchService],
})
export class CandidatesModule {}
