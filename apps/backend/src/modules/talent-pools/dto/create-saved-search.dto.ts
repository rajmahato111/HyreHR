import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  criteria: {
    query?: string;
    skills?: string[];
    experience?: { min?: number; max?: number };
    location?: string[];
    tags?: string[];
    currentTitle?: string;
    currentCompany?: string;
    source?: string[];
  };

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
