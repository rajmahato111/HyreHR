import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer, OfferTemplate, Application } from '../../database/entities';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferTemplateService } from './offer-template.service';
import { DocuSignService } from './docusign.service';
import { HRISIntegrationService } from './hris/hris-integration.service';
import { BambooHRService } from './hris/bamboohr.service';
import { WorkdayService } from './hris/workday.service';
import { RipplingService } from './hris/rippling.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, OfferTemplate, Application])],
  controllers: [OffersController],
  providers: [
    OffersService,
    OfferTemplateService,
    DocuSignService,
    HRISIntegrationService,
    BambooHRService,
    WorkdayService,
    RipplingService,
  ],
  exports: [
    OffersService,
    OfferTemplateService,
    DocuSignService,
    HRISIntegrationService,
  ],
})
export class OffersModule {}
