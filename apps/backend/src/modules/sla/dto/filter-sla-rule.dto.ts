import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { SlaRuleType } from '../../../database/entities';

export class FilterSlaRuleDto {
  @IsOptional()
  @IsEnum(SlaRuleType)
  type?: SlaRuleType;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}
