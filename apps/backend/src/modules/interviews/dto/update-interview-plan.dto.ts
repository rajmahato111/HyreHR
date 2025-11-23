import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewPlanDto } from './create-interview-plan.dto';

export class UpdateInterviewPlanDto extends PartialType(
  CreateInterviewPlanDto,
) {}
