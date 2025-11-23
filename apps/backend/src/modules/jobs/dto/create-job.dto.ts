import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { JobStatus, EmploymentType, SeniorityLevel } from '../../../database/entities/job.entity';

export class CreateJobDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  locationIds?: string[];

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(SeniorityLevel)
  @IsOptional()
  seniorityLevel?: SeniorityLevel;

  @IsBoolean()
  @IsOptional()
  remoteOk?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  salaryCurrency?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  requisitionId?: string;

  @IsBoolean()
  @IsOptional()
  confidential?: boolean;

  @IsUUID()
  @IsOptional()
  interviewPlanId?: string;

  @IsOptional()
  customFields?: Record<string, any>;
}
