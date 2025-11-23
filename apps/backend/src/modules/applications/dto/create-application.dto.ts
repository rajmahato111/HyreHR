import { IsUUID, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  candidateId: string;

  @IsUUID()
  jobId: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsObject()
  sourceDetails?: Record<string, any>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
