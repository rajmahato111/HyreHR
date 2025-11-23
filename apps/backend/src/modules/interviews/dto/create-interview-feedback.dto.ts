import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import {
  Decision,
  AttributeRating,
} from '../../../database/entities/interview-feedback.entity';

export class CreateInterviewFeedbackDto {
  @IsUUID()
  interviewId: string;

  @IsOptional()
  @IsUUID()
  scorecardId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @IsOptional()
  @IsEnum(Decision)
  decision?: Decision;

  @IsOptional()
  @IsArray()
  attributeRatings?: AttributeRating[];

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  concerns?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
