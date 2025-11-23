import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
  DATE = 'date',
}

class FieldValidationDto {
  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

class FormFieldDto {
  @IsString()
  id: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @IsOptional()
  order?: number;
}

enum QuestionType {
  TEXT = 'text',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

class ScreeningQuestionDto {
  @IsString()
  id: string;

  @IsString()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disqualifyingAnswers?: string[];

  @IsOptional()
  order?: number;
}

class EeoQuestionDto {
  @IsString()
  id: string;

  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];
}

class EeoConfigDto {
  @IsBoolean()
  voluntary: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EeoQuestionDto)
  questions: EeoQuestionDto[];
}

export class CreateApplicationFormDto {
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreeningQuestionDto)
  screeningQuestions?: ScreeningQuestionDto[];

  @IsOptional()
  @IsBoolean()
  includeResume?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCoverLetter?: boolean;

  @IsOptional()
  @IsBoolean()
  includeEEO?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => EeoConfigDto)
  eeoConfig?: EeoConfigDto;
}
