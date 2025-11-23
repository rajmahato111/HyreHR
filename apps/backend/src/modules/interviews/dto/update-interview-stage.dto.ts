import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewStageDto } from './create-interview-stage.dto';

export class UpdateInterviewStageDto extends PartialType(
  CreateInterviewStageDto,
) {}
