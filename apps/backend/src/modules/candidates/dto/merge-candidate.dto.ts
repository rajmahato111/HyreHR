import { IsUUID, IsObject, IsOptional } from 'class-validator';

export class MergeCandidateDto {
  @IsUUID()
  targetCandidateId: string;

  @IsObject()
  @IsOptional()
  fieldResolutions?: Record<string, 'source' | 'target'>;
}
