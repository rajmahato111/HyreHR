import { IsString, IsEnum, IsObject, IsOptional, IsArray } from 'class-validator';
import { IntegrationStatus } from '../../../database/entities';

export class UpdateIntegrationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsArray()
  @IsOptional()
  webhookUrls?: string[];

  @IsString()
  @IsOptional()
  webhookSecret?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
