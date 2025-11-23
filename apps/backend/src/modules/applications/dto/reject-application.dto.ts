import { IsUUID, IsOptional } from 'class-validator';

export class RejectApplicationDto {
  @IsOptional()
  @IsUUID()
  rejectionReasonId?: string;
}
