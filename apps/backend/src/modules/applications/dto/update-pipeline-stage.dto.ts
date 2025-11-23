import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { StageType } from '../../../database/entities';

export class UpdatePipelineStageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
