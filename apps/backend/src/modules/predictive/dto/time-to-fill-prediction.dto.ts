import { IsUUID } from 'class-validator';

export class TimeToFillPredictionDto {
  @IsUUID()
  jobId: string;
}

export class TimeToFillPredictionResponse {
  predictedDays: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: {
    name: string;
    impact: number;
    value: any;
  }[];
}
