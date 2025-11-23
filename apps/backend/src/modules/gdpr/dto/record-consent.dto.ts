import { IsString } from 'class-validator';

export class RecordConsentDto {
  @IsString()
  consentType: string;
}
