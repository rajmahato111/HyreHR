import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateRetentionPolicyDto {
  @IsString()
  entityType: string;

  @IsInt()
  @Min(1)
  retentionPeriodDays: number;

  @IsBoolean()
  autoDelete: boolean;

  @IsInt()
  @Min(1)
  notifyBeforeDays: number;

  @IsOptional()
  @IsString()
  description?: string;
}
