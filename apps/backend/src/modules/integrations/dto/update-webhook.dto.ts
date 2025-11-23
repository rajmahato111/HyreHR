import { IsString, IsEnum, IsArray, IsObject, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import { WebhookEvent, WebhookStatus } from '../../../database/entities';

export class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsEnum(WebhookStatus)
  @IsOptional()
  status?: WebhookStatus;

  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  @IsOptional()
  events?: WebhookEvent[];

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @IsInt()
  @Min(0)
  @IsOptional()
  retryAttempts?: number;

  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;
}
