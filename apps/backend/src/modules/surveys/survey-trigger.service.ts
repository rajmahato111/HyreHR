import { Injectable, Logger } from '@nestjs/common';
import { SurveyTriggerType } from '../../database/entities';
import { SurveysService } from './surveys.service';
import { SurveyResponseService } from './survey-response.service';

@Injectable()
export class SurveyTriggerService {
  private readonly logger = new Logger(SurveyTriggerService.name);

  constructor(
    private surveysService: SurveysService,
    private surveyResponseService: SurveyResponseService,
  ) {}

  async triggerPostApplication(
    organizationId: string,
    candidateId: string,
    applicationId: string,
  ): Promise<void> {
    try {
      const surveys = await this.surveysService.findByTriggerType(
        organizationId,
        SurveyTriggerType.POST_APPLICATION,
      );

      for (const survey of surveys) {
        // Create survey response
        const response = await this.surveyResponseService.createResponse(
          survey.id,
          candidateId,
          applicationId,
        );

        // Schedule email sending based on delay
        if (survey.sendDelayHours > 0) {
          // In production, this would use a job queue like Bull
          this.logger.log(
            `Scheduled survey ${survey.id} to be sent in ${survey.sendDelayHours} hours`,
          );
        } else {
          // Send immediately
          await this.sendSurveyEmail(response.id, candidateId);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to trigger post-application survey: ${error.message}`,
      );
    }
  }

  async triggerPostInterview(
    organizationId: string,
    candidateId: string,
    applicationId: string,
    interviewId: string,
  ): Promise<void> {
    try {
      const surveys = await this.surveysService.findByTriggerType(
        organizationId,
        SurveyTriggerType.POST_INTERVIEW,
      );

      for (const survey of surveys) {
        const response = await this.surveyResponseService.createResponse(
          survey.id,
          candidateId,
          applicationId,
          interviewId,
        );

        if (survey.sendDelayHours > 0) {
          this.logger.log(
            `Scheduled survey ${survey.id} to be sent in ${survey.sendDelayHours} hours`,
          );
        } else {
          await this.sendSurveyEmail(response.id, candidateId);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to trigger post-interview survey: ${error.message}`,
      );
    }
  }

  async triggerPostRejection(
    organizationId: string,
    candidateId: string,
    applicationId: string,
  ): Promise<void> {
    try {
      const surveys = await this.surveysService.findByTriggerType(
        organizationId,
        SurveyTriggerType.POST_REJECTION,
      );

      for (const survey of surveys) {
        const response = await this.surveyResponseService.createResponse(
          survey.id,
          candidateId,
          applicationId,
        );

        if (survey.sendDelayHours > 0) {
          this.logger.log(
            `Scheduled survey ${survey.id} to be sent in ${survey.sendDelayHours} hours`,
          );
        } else {
          await this.sendSurveyEmail(response.id, candidateId);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to trigger post-rejection survey: ${error.message}`,
      );
    }
  }

  async triggerPostOffer(
    organizationId: string,
    candidateId: string,
    applicationId: string,
  ): Promise<void> {
    try {
      const surveys = await this.surveysService.findByTriggerType(
        organizationId,
        SurveyTriggerType.POST_OFFER,
      );

      for (const survey of surveys) {
        const response = await this.surveyResponseService.createResponse(
          survey.id,
          candidateId,
          applicationId,
        );

        if (survey.sendDelayHours > 0) {
          this.logger.log(
            `Scheduled survey ${survey.id} to be sent in ${survey.sendDelayHours} hours`,
          );
        } else {
          await this.sendSurveyEmail(response.id, candidateId);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to trigger post-offer survey: ${error.message}`);
    }
  }

  private async sendSurveyEmail(
    responseId: string,
    candidateId: string,
  ): Promise<void> {
    // In production, this would integrate with the communication service
    // to send actual emails with survey links
    this.logger.log(
      `Sending survey email for response ${responseId} to candidate ${candidateId}`,
    );

    await this.surveyResponseService.markAsSent(responseId);
  }
}
