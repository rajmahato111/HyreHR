import { IsArray, IsString, IsOptional } from 'class-validator';

export class CalculateSkillMatchDto {
  @IsArray()
  @IsString({ each: true })
  candidateSkills: string[];

  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSkills?: string[];
}

export class ExtractSkillsDto {
  @IsString()
  text: string;
}

export class NormalizeSkillsDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}

export class GetSkillSuggestionsDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  limit?: number;
}
