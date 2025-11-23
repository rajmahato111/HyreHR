import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GDPRController } from './gdpr.controller';
import { GDPRService } from '../../common/services/gdpr.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { Candidate } from '../../database/entities/candidate.entity';
import { Application } from '../../database/entities/application.entity';
import { Interview } from '../../database/entities/interview.entity';
import { Communication } from '../../database/entities/communication.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { DataRetentionPolicy } from '../../database/entities/data-retention-policy.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      Application,
      Interview,
      Communication,
      AuditLog,
      DataRetentionPolicy,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [GDPRController],
  providers: [GDPRService, EncryptionService, AuditLogService],
  exports: [GDPRService, EncryptionService],
})
export class GDPRModule {}
