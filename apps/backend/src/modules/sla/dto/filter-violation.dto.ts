import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { SlaViolationStatus, SlaEntityType } from '../../../database/entities';

export class FilterViolationDto {
  @IsOptional()
  @IsString()
  slaRuleId?: string;

  @IsOptional()
  @IsEnum(SlaEntityType)
  entityType?: SlaEntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(SlaViolationStatus)
  status?: SlaViolationStatus;

  @IsOptional()
  @IsBoolean()
  escalated?: boolean;
}
