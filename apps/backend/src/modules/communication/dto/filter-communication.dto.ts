import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { CommunicationType, CommunicationDirection } from '../../../database/entities';

export class FilterCommunicationDto {
  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsEnum(CommunicationType)
  @IsOptional()
  type?: CommunicationType;

  @IsEnum(CommunicationDirection)
  @IsOptional()
  direction?: CommunicationDirection;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
