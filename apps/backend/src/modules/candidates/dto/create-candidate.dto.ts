import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateCandidateDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  locationCity?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  locationState?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  locationCountry?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  currentCompany?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  currentTitle?: string;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @MaxLength(50)
  @IsOptional()
  sourceType?: string;

  @IsObject()
  @IsOptional()
  sourceDetails?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  gdprConsent?: boolean;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}
