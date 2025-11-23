import { IsString, IsUUID, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateMatchDto {
  @IsUUID()
  candidateId: string;

  @IsUUID()
  jobId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  skillsWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  experienceWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  educationWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  locationWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  titleWeight?: number;
}

export class CalculateJobMatchesDto {
  @IsUUID()
  jobId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  candidateIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  skillsWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  experienceWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  educationWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  locationWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  titleWeight?: number;
}

export class UpdateApplicationMatchDto {
  @IsUUID()
  applicationId: string;
}
