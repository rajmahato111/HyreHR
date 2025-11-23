import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsUUID } from 'class-validator';
import { TalentPoolType } from '../../../database/entities';

export class CreateTalentPoolDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TalentPoolType)
  type: TalentPoolType;

  @IsOptional()
  @IsObject()
  criteria?: {
    skills?: string[];
    experience?: { min?: number; max?: number };
    location?: string[];
    tags?: string[];
    currentTitle?: string;
    currentCompany?: string;
  };

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  candidateIds?: string[];
}
