import { IsString, IsEnum, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { TemplateCategory } from '../../../database/entities';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  shared?: boolean;
}
