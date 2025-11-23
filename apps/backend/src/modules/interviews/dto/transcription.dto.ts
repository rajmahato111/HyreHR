import { IsUUID, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StartTranscriptionDto {
  @IsUUID()
  interviewId: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}

export class TranscriptSegmentDto {
  @IsString()
  speakerId: string;

  @IsString()
  text: string;

  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;

  @IsNumber()
  confidence: number;
}

export class UpdateTranscriptionDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranscriptSegmentDto)
  segments?: TranscriptSegmentDto[];

  @IsOptional()
  @IsString()
  fullText?: string;
}

export class GetTranscriptionDto {
  @IsUUID()
  interviewId: string;
}

export class TranscriptionResponseDto {
  id: string;
  interviewId: string;
  status: string;
  speakers?: any[];
  segments?: any[];
  fullText?: string;
  keyPoints?: any[];
  sentimentAnalysis?: any;
  redFlags?: any[];
  greenFlags?: any[];
  summary?: string;
  suggestedFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}
