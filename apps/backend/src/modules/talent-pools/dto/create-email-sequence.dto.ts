import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SequenceStepDto {
  @IsNumber()
  @Min(1)
  order: number;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsNumber()
  @Min(0)
  delayDays: number;

  @IsNumber()
  @Min(0)
  delayHours: number;
}

export class CreateEmailSequenceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  steps: SequenceStepDto[];
}
