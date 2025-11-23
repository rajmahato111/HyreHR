import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateRetentionPolicyDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  retentionPeriodDays?: number;

  @IsOptional()
  @IsBoolean()
  autoDelete?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  notifyBeforeDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
