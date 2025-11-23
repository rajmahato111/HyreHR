import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeParserService } from './resume-parser.service';
import { ResumeParserController } from './resume-parser.controller';
import { FileStorageService } from './file-storage.service';
import { TextExtractionService } from './text-extraction.service';
import { NlpExtractionService } from './nlp-extraction.service';
import { ConfidenceScoringService } from './confidence-scoring.service';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [ConfigModule, CandidatesModule],
  controllers: [ResumeParserController],
  providers: [
    ResumeParserService,
    FileStorageService,
    TextExtractionService,
    NlpExtractionService,
    ConfidenceScoringService,
  ],
  exports: [ResumeParserService],
})
export class ResumeParserModule {}
