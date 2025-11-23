import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  SlaRule,
  SlaViolation,
  Application,
  Interview,
  Offer,
} from '../../database/entities';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { SlaMonitoringService } from './sla-monitoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SlaRule,
      SlaViolation,
      Application,
      Interview,
      Offer,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [SlaController],
  providers: [SlaService, SlaMonitoringService],
  exports: [SlaService, SlaMonitoringService],
})
export class SlaModule {}
