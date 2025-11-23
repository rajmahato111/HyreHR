import { IsArray, IsUUID, IsOptional } from 'class-validator';

export class EnrollCandidatesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  candidateIds: string[];

  @IsOptional()
  @IsUUID()
  poolId?: string;
}
