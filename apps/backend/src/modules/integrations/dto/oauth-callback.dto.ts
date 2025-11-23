import { IsString, IsOptional } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  error?: string;

  @IsString()
  @IsOptional()
  error_description?: string;
}
