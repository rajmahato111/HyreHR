import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EmailTone } from '../ai-email.service';

export class GenerateOutreachEmailDto {
  @IsUUID()
  candidateId: string;

  @IsUUID()
  jobId: string;

  @IsEnum(EmailTone)
  tone: EmailTone;

  @IsString()
  @IsOptional()
  additionalContext?: string;

  @IsString()
  @IsOptional()
  recruiterName?: string;

  @IsString()
  @IsOptional()
  companyName?: string;
}
