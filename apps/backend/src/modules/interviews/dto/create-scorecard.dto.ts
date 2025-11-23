import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ScorecardAttribute } from '../../../database/entities/scorecard.entity';

export class CreateScorecardDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  attributes: ScorecardAttribute[];
}
