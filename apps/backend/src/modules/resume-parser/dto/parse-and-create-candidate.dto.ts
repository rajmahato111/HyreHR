import { IsOptional, IsBoolean, IsString, IsObject } from 'class-validator';

export class ParseAndCreateCandidateDto {
  @IsOptional()
  @IsBoolean()
  autoCreate?: boolean;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsObject()
  sourceDetails?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  gdprConsent?: boolean;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
