import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { Application } from '../../database/entities/application.entity';
import { BiasLanguageService } from './bias-language.service';
import { StatisticalAnalysisService } from './statistical-analysis.service';
import { BiasAlertService } from './bias-alert.service';
import { BiasAlertDto, BiasReportQueryDto } from './dto/bias-alert.dto';

@Injectable()
export class BiasDetectionService {
  constructor(
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private biasLanguageService: BiasLanguageService,
    private statisticalAnalysisService: StatisticalAnalysisService,
    private biasAlertService: BiasAlertService,
  ) {}

  /**
   * Analyze feedback for bias
   */
  async analyzeFeedback(feedbackId: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new Error('Feedback not found');
    }

    const combinedText = `${feedback.strengths || ''} ${feedback.concerns || ''} ${feedback.notes || ''}`;
    const biasedTerms = await this.biasLanguageService.analyzeBiasedLanguage(
      combinedText
    );
    const biasScore = this.biasLanguageService.calculateBiasScore(biasedTerms);
    const recommendations = this.biasLanguageService.getRecommendations(
      biasedTerms
    );

    return {
      feedbackId,
      biasScore,
      biasedTerms,
      recommendations,
      hasBias: biasedTerms.length > 0,
    };
  }

  /**
   * Generate comprehensive bias report for a job
   */
  async generateBiasReport(query: BiasReportQueryDto) {
    const { jobId, departmentId, startDate, endDate } = query;

    if (!jobId && !departmentId) {
      throw new Error('Either jobId or departmentId must be provided');
    }

    const alerts: BiasAlertDto[] = [];

    if (jobId) {
      const jobAlerts = await this.biasAlertService.generateJobAlerts(jobId);
      alerts.push(...jobAlerts);
    }

    // Get pass-through rates
    const passRates = jobId
      ? await this.statisticalAnalysisService.analyzePassThroughRates(jobId)
      : null;

    // Get demographic representation
    const representation = jobId
      ? await this.statisticalAnalysisService.analyzeDemographicRepresentation(
          jobId
        )
      : null;

    // Get time-to-hire disparities
    const timeToHire = jobId
      ? await this.statisticalAnalysisService.analyzeTimeToHireDisparities(
          jobId
        )
      : null;

    // Get all feedback for language analysis
    const feedbackQuery = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.interview', 'interview')
      .leftJoin('interview.application', 'application');

    if (jobId) {
      feedbackQuery.where('application.jobId = :jobId', { jobId });
    }

    if (startDate) {
      feedbackQuery.andWhere('feedback.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      feedbackQuery.andWhere('feedback.createdAt <= :endDate', { endDate });
    }

    const allFeedback = await feedbackQuery.getMany();

    // Analyze all feedback for biased language
    let totalBiasedTerms = 0;
    const biasedFeedbackIds: string[] = [];

    for (const feedback of allFeedback) {
      const combinedText = `${feedback.strengths || ''} ${feedback.concerns || ''} ${feedback.notes || ''}`;
      const terms = await this.biasLanguageService.analyzeBiasedLanguage(
        combinedText
      );
      if (terms.length > 0) {
        totalBiasedTerms += terms.length;
        biasedFeedbackIds.push(feedback.id);
      }
    }

    return {
      summary: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
        highAlerts: alerts.filter((a) => a.severity === 'high').length,
        totalFeedbackAnalyzed: allFeedback.length,
        feedbackWithBias: biasedFeedbackIds.length,
        totalBiasedTerms,
      },
      alerts,
      passRates,
      representation,
      timeToHire,
      recommendations: this.biasAlertService.getGeneralRecommendations(),
    };
  }

  /**
   * Get bias metrics for dashboard
   */
  async getBiasMetrics(organizationId: string, jobId?: string) {
    // Get applications
    const applicationsQuery = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.job', 'job')
      .where('job.organizationId = :organizationId', { organizationId });

    if (jobId) {
      applicationsQuery.andWhere('app.jobId = :jobId', { jobId });
    }

    const applications = await applicationsQuery.getMany();

    // Calculate diversity metrics
    const totalApplications = applications.length;
    const demographics: Record<string, number> = {};

    for (const app of applications) {
      const candidateDemographics =
        app.candidate?.customFields?.demographics || {};

      for (const [key, value] of Object.entries(candidateDemographics)) {
        const demographicKey = `${key}: ${value}`;
        demographics[demographicKey] = (demographics[demographicKey] || 0) + 1;
      }
    }

    // Convert to percentages
    const demographicPercentages: Record<string, number> = {};
    for (const [key, count] of Object.entries(demographics)) {
      demographicPercentages[key] =
        totalApplications > 0
          ? Math.round((count / totalApplications) * 100)
          : 0;
    }

    // Get recent alerts
    const recentAlerts = jobId
      ? await this.biasAlertService.generateJobAlerts(jobId)
      : [];

    return {
      totalApplications,
      demographics: demographicPercentages,
      recentAlerts: recentAlerts.slice(0, 5),
      alertCounts: {
        critical: recentAlerts.filter((a) => a.severity === 'critical').length,
        high: recentAlerts.filter((a) => a.severity === 'high').length,
        medium: recentAlerts.filter((a) => a.severity === 'medium').length,
        low: recentAlerts.filter((a) => a.severity === 'low').length,
      },
    };
  }

  /**
   * Check feedback in real-time before submission
   */
  async checkFeedbackBeforeSubmit(feedbackText: {
    strengths?: string;
    concerns?: string;
    notes?: string;
  }) {
    const combinedText = `${feedbackText.strengths || ''} ${feedbackText.concerns || ''} ${feedbackText.notes || ''}`;
    
    const biasedTerms = await this.biasLanguageService.analyzeBiasedLanguage(
      combinedText
    );
    const biasScore = this.biasLanguageService.calculateBiasScore(biasedTerms);
    const recommendations = this.biasLanguageService.getRecommendations(
      biasedTerms
    );

    return {
      hasBias: biasedTerms.length > 0,
      biasScore,
      biasedTerms,
      recommendations,
      shouldWarn: biasScore > 25,
      shouldBlock: biasScore > 75,
    };
  }
}
