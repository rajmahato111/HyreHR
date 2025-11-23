import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EmailTone } from '../ai-email.service';

export class GenerateResponseEmailDto {
  @IsString()
  candidateEmail: string;

  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsEnum(EmailTone)
  tone: EmailTone;

  @IsString()
  @IsOptional()
  context?: string;
}
