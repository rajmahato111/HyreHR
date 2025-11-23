import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PipelineStage,
  Application,
  ApplicationHistory,
  RejectionReason,
} from '../../database/entities';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PipelineStage, Application, ApplicationHistory, RejectionReason]),
    MatchingModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
