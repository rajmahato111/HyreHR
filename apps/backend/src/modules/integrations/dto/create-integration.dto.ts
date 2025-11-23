import { IsString, IsEnum, IsObject, IsOptional, IsArray } from 'class-validator';
import { IntegrationProvider, AuthType } from '../../../database/entities';

export class CreateIntegrationDto {
  @IsString()
  name: string;

  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @IsEnum(AuthType)
  authType: AuthType;

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
