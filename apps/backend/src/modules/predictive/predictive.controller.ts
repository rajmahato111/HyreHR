import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TimeToFillService } from './time-to-fill.service';
import { OfferAcceptanceService } from './offer-acceptance.service';
import {
  TimeToFillPredictionResponse,
  OfferAcceptancePredictionResponse,
} from './dto';

@Controller('predictive')
export class PredictiveController {
  constructor(
    private readonly timeToFillService: TimeToFillService,
    private readonly offerAcceptanceService: OfferAcceptanceService,
  ) {}

  @Get('time-to-fill/:jobId')
  async predictTimeToFill(
    @Param('jobId') jobId: string,
  ): Promise<TimeToFillPredictionResponse> {
    return this.timeToFillService.predictTimeToFill(jobId);
  }

  @Get('offer-acceptance/:offerId')
  async predictOfferAcceptance(
    @Param('offerId') offerId: string,
  ): Promise<OfferAcceptancePredictionResponse> {
    return this.offerAcceptanceService.predictOfferAcceptance(offerId);
  }
}
