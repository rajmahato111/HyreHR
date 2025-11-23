import { IsArray, IsUUID } from 'class-validator';

export class AddCandidatesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  candidateIds: string[];
}
