import {
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsEmail,
  IsObject,
} from 'class-validator';

export class SendEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  toEmails: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  ccEmails?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bccEmails?: string[];

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  templateVariables?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
