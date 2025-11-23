import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewFeedbackDto } from './create-interview-feedback.dto';

export class UpdateInterviewFeedbackDto extends PartialType(
  CreateInterviewFeedbackDto,
) {}
