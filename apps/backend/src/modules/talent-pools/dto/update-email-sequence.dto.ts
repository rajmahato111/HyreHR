import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateEmailSequenceDto } from './create-email-sequence.dto';
import { SequenceStatus } from '../../../database/entities';

export class UpdateEmailSequenceDto extends PartialType(CreateEmailSequenceDto) {
  @IsOptional()
  @IsEnum(SequenceStatus)
  status?: SequenceStatus;
}
