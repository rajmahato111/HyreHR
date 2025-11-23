import {
  IsUUID,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { LocationType } from '../../../database/entities/interview.entity';

export class CreateSchedulingLinkDto {
  @IsUUID()
  applicationId: string;

  @IsOptional()
  @IsUUID()
  interviewStageId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  interviewerIds: string[];

  @IsNumber()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @IsEnum(LocationType)
  locationType: LocationType;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  bufferMinutes?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class GetAvailableSlotsDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class BookSlotDto {
  @IsString()
  token: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class RescheduleInterviewDto {
  @IsString()
  rescheduleToken: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CancelInterviewDto {
  @IsString()
  rescheduleToken: string;
}
