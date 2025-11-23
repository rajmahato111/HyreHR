import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BiasDetectionService } from './bias-detection.service';
import { BiasAlertService } from './bias-alert.service';
import { BiasReportQueryDto } from './dto/bias-alert.dto';

@Controller('bias-detection')
export class BiasDetectionController {
  constructor(
    private readonly biasDetectionService: BiasDetectionService,
    private readonly biasAlertService: BiasAlertService,
  ) {}

  /**
   * Analyze specific feedback for bias
   * GET /bias-detection/feedback/:id
   */
  @Get('feedback/:id')
  async analyzeFeedback(@Param('id') feedbackId: string) {
    return this.biasDetectionService.analyzeFeedback(feedbackId);
  }

  /**
   * Check feedback text before submission
   * POST /bias-detection/check-feedback
   */
  @Post('check-feedback')
  async checkFeedback(
    @Body()
    feedbackText: {
      strengths?: string;
      concerns?: string;
      notes?: string;
    }
  ) {
    return this.biasDetectionService.checkFeedbackBeforeSubmit(feedbackText);
  }

  /**
   * Generate bias report for a job or department
   * GET /bias-detection/report
   */
  @Get('report')
  async generateReport(@Query() query: BiasReportQueryDto) {
    return this.biasDetectionService.generateBiasReport(query);
  }

  /**
   * Get bias alerts for a job
   * GET /bias-detection/alerts/job/:jobId
   */
  @Get('alerts/job/:jobId')
  async getJobAlerts(@Param('jobId') jobId: string) {
    return this.biasAlertService.generateJobAlerts(jobId);
  }

  /**
   * Get bias alerts for feedback
   * GET /bias-detection/alerts/feedback/:feedbackId
   */
  @Get('alerts/feedback/:feedbackId')
  async getFeedbackAlerts(@Param('feedbackId') feedbackId: string) {
    return this.biasAlertService.generateFeedbackAlerts(feedbackId);
  }

  /**
   * Get bias metrics for dashboard
   * GET /bias-detection/metrics
   */
  @Get('metrics')
  async getBiasMetrics(
    @Query('organizationId') organizationId: string,
    @Query('jobId') jobId?: string
  ) {
    return this.biasDetectionService.getBiasMetrics(organizationId, jobId);
  }

  /**
   * Get general recommendations
   * GET /bias-detection/recommendations
   */
  @Get('recommendations')
  async getRecommendations() {
    return {
      recommendations: this.biasAlertService.getGeneralRecommendations(),
    };
  }
}
