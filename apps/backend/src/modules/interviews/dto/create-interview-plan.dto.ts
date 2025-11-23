import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateInterviewPlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  jobId?: string;
}
