import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  body: string;

  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mentions?: string[]; // User IDs mentioned in the note
}
