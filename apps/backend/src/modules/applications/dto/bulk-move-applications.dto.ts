import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class BulkMoveApplicationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  applicationIds: string[];

  @IsUUID()
  stageId: string;
}
