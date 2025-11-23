import { IsEnum, IsOptional, IsUUID, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JobStatus, EmploymentType, SeniorityLevel } from '../../../database/entities/job.entity';

export class FilterJobDto extends PaginationDto {
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(SeniorityLevel)
  @IsOptional()
  seniorityLevel?: SeniorityLevel;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  remoteOk?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  confidential?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
