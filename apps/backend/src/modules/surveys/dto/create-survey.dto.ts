import { IsString, IsEnum, IsArray, IsBoolean, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyTriggerType, SurveyQuestionType } from '../../../database/entities';

export class SurveyQuestionDto {
  @IsString()
  id: string;

  @IsEnum(SurveyQuestionType)
  type: SurveyQuestionType;

  @IsString()
  question: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsNumber()
  order: number;
}

export class CreateSurveyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SurveyTriggerType)
  triggerType: SurveyTriggerType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions: SurveyQuestionDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  sendDelayHours?: number;
}
