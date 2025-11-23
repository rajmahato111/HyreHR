import { IsEnum, IsString, IsOptional, IsObject, IsUUID } from 'class-validator';

export enum BiasAlertType {
  BIASED_LANGUAGE = 'biased_language',
  STATISTICAL_DISPARITY = 'statistical_disparity',
  RATING_INCONSISTENCY = 'rating_inconsistency',
  DEMOGRAPHIC_PATTERN = 'demographic_pattern',
}

export enum BiasAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class BiasAlertDto {
  @IsEnum(BiasAlertType)
  type: BiasAlertType;

  @IsEnum(BiasAlertSeverity)
  severity: BiasAlertSeverity;

  @IsString()
  message: string;

  @IsOptional()
  @IsUUID()
  feedbackId?: string;

  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsString()
  recommendation?: string;
}

export class BiasReportQueryDto {
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class BiasedTermDto {
  @IsString()
  term: string;

  @IsString()
  category: string;

  @IsString()
  context: string;

  @IsString()
  suggestion: string;
}
