import { IsString, IsEmail, IsOptional, IsObject, IsArray } from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  jobId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsObject()
  customFields: Record<string, any>;

  @IsOptional()
  @IsArray()
  screeningAnswers?: Array<{
    questionId: string;
    answer: any;
  }>;

  @IsOptional()
  @IsObject()
  eeoData?: Record<string, any>;

  @IsOptional()
  @IsString()
  source?: string;
}
