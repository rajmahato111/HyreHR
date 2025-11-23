import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyMFADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 8)
  token: string;
}

export class MFALoginDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 8)
  token: string;
}
