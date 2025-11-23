import { IsString, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { StageType } from '../../../database/entities';

export class CreatePipelineStageDto {
  @IsString()
  name: string;

  @IsEnum(StageType)
  type: StageType;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsOptional()
  @IsUUID()
  jobId?: string;
}
