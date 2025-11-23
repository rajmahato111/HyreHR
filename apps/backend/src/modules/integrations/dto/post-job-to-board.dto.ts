import { IsUUID, IsNotEmpty } from 'class-validator';

export class PostJobToBoardDto {
  @IsUUID()
  @IsNotEmpty()
  integrationId: string;
}
