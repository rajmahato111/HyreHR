import { IsUUID, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class BulkRejectApplicationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  applicationIds: string[];

  @IsOptional()
  @IsUUID()
  rejectionReasonId?: string;
}
