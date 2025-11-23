import { IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
