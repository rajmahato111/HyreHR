import { IsString, IsBoolean, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BrandingDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  headerImage?: string;
}

class TestimonialDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  quote: string;

  @IsOptional()
  order?: number;
}

class CustomSectionDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsObject()
  content: any;

  @IsOptional()
  order?: number;
}

class ContentDto {
  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  aboutCompany?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  testimonials?: TestimonialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomSectionDto)
  customSections?: CustomSectionDto[];
}

class SeoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  ogImage?: string;
}

class SettingsDto {
  @IsOptional()
  @IsBoolean()
  showJobCount?: boolean;

  @IsOptional()
  @IsBoolean()
  enableFilters?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSearch?: boolean;

  @IsOptional()
  jobsPerPage?: number;

  @IsOptional()
  @IsBoolean()
  requireLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  enableApplicationTracking?: boolean;
}

export class CreateCareerSiteDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: BrandingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContentDto)
  content?: ContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;
}
