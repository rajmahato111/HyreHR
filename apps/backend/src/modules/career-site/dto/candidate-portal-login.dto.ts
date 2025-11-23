import { IsEmail, IsString, MinLength } from 'class-validator';

export class CandidatePortalLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class CandidatePortalRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  candidateId: string;
}
