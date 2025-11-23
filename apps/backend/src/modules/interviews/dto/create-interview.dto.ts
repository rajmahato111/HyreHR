import {
  IsUUID,
  IsDateString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../../../database/entities/interview.entity';
import { ParticipantRole } from '../../../database/entities/interview-participant.entity';

export class InterviewParticipantDto {
  @IsUUID()
  userId: string;

  @IsEnum(ParticipantRole)
  role: ParticipantRole;
}

export class CreateInterviewDto {
  @IsUUID()
  applicationId: string;

  @IsOptional()
  @IsUUID()
  interviewStageId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsNumber()
  durationMinutes: number;

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsString()
  locationDetails?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewParticipantDto)
  participants: InterviewParticipantDto[];
}
