import { IsUUID } from 'class-validator';

export class OfferAcceptancePredictionDto {
  @IsUUID()
  offerId: string;
}

export class OfferAcceptancePredictionResponse {
  acceptanceProbability: number;
  factors: {
    name: string;
    impact: number;
    value: any;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
