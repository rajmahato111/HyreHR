import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EmailTone } from '../ai-email.service';

export class GenerateRejectionEmailDto {
  @IsUUID()
  applicationId: string;

  @IsEnum(EmailTone)
  tone: EmailTone;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  constructiveFeedback?: string;
}
