import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { InterviewStageType } from '../../../database/entities/interview-stage.entity';

export class CreateInterviewStageDto {
  @IsUUID()
  interviewPlanId: string;

  @IsString()
  name: string;

  @IsEnum(InterviewStageType)
  type: InterviewStageType;

  @IsNumber()
  durationMinutes: number;

  @IsNumber()
  orderIndex: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsUUID()
  scorecardId?: string;
}
