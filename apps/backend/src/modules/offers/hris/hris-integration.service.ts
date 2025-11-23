import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../../database/entities';
import { BambooHRService } from './bamboohr.service';
import { WorkdayService } from './workday.service';
import { RipplingService } from './rippling.service';

export enum HRISProvider {
  BAMBOOHR = 'bamboohr',
  WORKDAY = 'workday',
  RIPPLING = 'rippling',
}

export interface OnboardingHandoff {
  offerId: string;
  provider: HRISProvider;
  externalEmployeeId: string;
  status: 'pending' | 'completed' | 'failed';
  handoffAt: Date;
  error?: string;
}

@Injectable()
export class HRISIntegrationService {
  private readonly logger = new Logger(HRISIntegrationService.name);

  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private bambooHRService: BambooHRService,
    private workdayService: WorkdayService,
    private ripplingService: RipplingService,
  ) {}

  async handoffToHRIS(
    offerId: string,
    provider: HRISProvider,
  ): Promise<OnboardingHandoff> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['application', 'application.candidate', 'application.job', 'application.job.department', 'application.job.locations'],
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    if (offer.status !== 'accepted') {
      throw new BadRequestException('Only accepted offers can be handed off to HRIS');
    }

    try {
      let externalEmployeeId: string;

      switch (provider) {
        case HRISProvider.BAMBOOHR:
          externalEmployeeId = await this.bambooHRService.createEmployee(offer);
          break;

        case HRISProvider.WORKDAY:
          externalEmployeeId = await this.workdayService.createWorker(offer);
          break;

        case HRISProvider.RIPPLING:
          externalEmployeeId = await this.ripplingService.createEmployee(offer);
          // Trigger onboarding workflow
          await this.ripplingService.triggerOnboarding(externalEmployeeId);
          break;

        default:
          throw new BadRequestException(`Unsupported HRIS provider: ${provider}`);
      }

      // Store handoff information in offer custom fields
      offer.customFields = {
        ...offer.customFields,
        hrisHandoff: {
          provider,
          externalEmployeeId,
          handoffAt: new Date(),
          status: 'completed',
        },
      };

      await this.offerRepository.save(offer);

      this.logger.log(`Successfully handed off offer ${offerId} to ${provider} with employee ID ${externalEmployeeId}`);

      return {
        offerId,
        provider,
        externalEmployeeId,
        status: 'completed',
        handoffAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to handoff offer ${offerId} to ${provider}`, error);

      // Store error in offer custom fields
      offer.customFields = {
        ...offer.customFields,
        hrisHandoff: {
          provider,
          handoffAt: new Date(),
          status: 'failed',
          error: error.message,
        },
      };

      await this.offerRepository.save(offer);

      return {
        offerId,
        provider,
        externalEmployeeId: '',
        status: 'failed',
        handoffAt: new Date(),
        error: error.message,
      };
    }
  }

  async syncEmployeeData(
    offerId: string,
    updates: any,
  ): Promise<void> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    const handoff = offer.customFields?.hrisHandoff;

    if (!handoff || handoff.status !== 'completed') {
      throw new BadRequestException('No successful HRIS handoff found for this offer');
    }

    try {
      switch (handoff.provider) {
        case HRISProvider.BAMBOOHR:
          await this.bambooHRService.updateEmployee(handoff.externalEmployeeId, updates);
          break;

        case HRISProvider.WORKDAY:
          await this.workdayService.updateWorker(handoff.externalEmployeeId, updates);
          break;

        case HRISProvider.RIPPLING:
          await this.ripplingService.updateEmployee(handoff.externalEmployeeId, updates);
          break;

        default:
          throw new BadRequestException(`Unsupported HRIS provider: ${handoff.provider}`);
      }

      this.logger.log(`Successfully synced employee data for offer ${offerId} to ${handoff.provider}`);
    } catch (error) {
      this.logger.error(`Failed to sync employee data for offer ${offerId}`, error);
      throw new BadRequestException('Failed to sync employee data to HRIS');
    }
  }

  async getEmployeeFromHRIS(offerId: string): Promise<any> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    const handoff = offer.customFields?.hrisHandoff;

    if (!handoff || handoff.status !== 'completed') {
      throw new BadRequestException('No successful HRIS handoff found for this offer');
    }

    try {
      let employeeData: any;

      switch (handoff.provider) {
        case HRISProvider.BAMBOOHR:
          employeeData = await this.bambooHRService.getEmployee(handoff.externalEmployeeId);
          break;

        case HRISProvider.WORKDAY:
          employeeData = await this.workdayService.getWorker(handoff.externalEmployeeId);
          break;

        case HRISProvider.RIPPLING:
          employeeData = await this.ripplingService.getEmployee(handoff.externalEmployeeId);
          break;

        default:
          throw new BadRequestException(`Unsupported HRIS provider: ${handoff.provider}`);
      }

      return employeeData;
    } catch (error) {
      this.logger.error(`Failed to get employee data for offer ${offerId}`, error);
      throw new BadRequestException('Failed to get employee data from HRIS');
    }
  }

  async getHandoffStatus(offerId: string): Promise<OnboardingHandoff | null> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    const handoff = offer.customFields?.hrisHandoff;

    if (!handoff) {
      return null;
    }

    return {
      offerId,
      provider: handoff.provider,
      externalEmployeeId: handoff.externalEmployeeId,
      status: handoff.status,
      handoffAt: new Date(handoff.handoffAt),
      error: handoff.error,
    };
  }
}
