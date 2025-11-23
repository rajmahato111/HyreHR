import { IsString, IsEnum, IsInt, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { SlaRuleType } from '../../../database/entities';

export class CreateSlaRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SlaRuleType)
  type: SlaRuleType;

  @IsInt()
  @Min(1)
  thresholdHours: number;

  @IsArray()
  @IsString({ each: true })
  alertRecipients: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  escalationRecipients?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  escalationHours?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];
}
