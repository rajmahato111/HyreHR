import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SlaViolationStatus } from '../../../database/entities';

export class UpdateViolationDto {
  @IsOptional()
  @IsEnum(SlaViolationStatus)
  status?: SlaViolationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
