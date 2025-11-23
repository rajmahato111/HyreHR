import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  WorkflowTriggerType,
  WorkflowCondition,
  WorkflowAction,
} from '../../../database/entities';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsOptional()
  @IsArray()
  conditions?: WorkflowCondition[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  actions: WorkflowAction[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
