import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateInterviewDto } from './create-interview.dto';
import { InterviewStatus } from '../../../database/entities/interview.entity';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}
