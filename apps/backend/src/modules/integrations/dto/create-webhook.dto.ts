import { IsString, IsEnum, IsArray, IsObject, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import { WebhookEvent } from '../../../database/entities';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events: WebhookEvent[];

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

  @IsString()
  @IsOptional()
  integrationId?: string;
}
