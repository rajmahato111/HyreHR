import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import {
  BiasAlertDto,
  BiasAlertType,
  BiasAlertSeverity,
} from './dto/bias-alert.dto';
import { BiasLanguageService } from './bias-language.service';
import { StatisticalAnalysisService } from './statistical-analysis.service';

@Injectable()
export class BiasAlertService {
  constructor(
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
    private biasLanguageService: BiasLanguageService,
    private statisticalAnalysisService: StatisticalAnalysisService,
  ) {}

  /**
   * Generate bias alerts for interview feedback
   */
  async generateFeedbackAlerts(
    feedbackId: string
  ): Promise<BiasAlertDto[]> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['interview', 'interview.application'],
    });

    if (!feedback) {
      return [];
    }

    const alerts: BiasAlertDto[] = [];

    // Check for biased language
    const combinedText = `${feedback.strengths || ''} ${feedback.concerns || ''} ${feedback.notes || ''}`;
    const biasedTerms = await this.biasLanguageService.analyzeBiasedLanguage(
      combinedText
    );

    if (biasedTerms.length > 0) {
      const biasScore = this.biasLanguageService.calculateBiasScore(biasedTerms);
      const severity = this.calculateSeverity(biasScore);

      alerts.push({
        type: BiasAlertType.BIASED_LANGUAGE,
        severity,
        message: `Detected ${biasedTerms.length} potentially biased term(s) in feedback`,
        feedbackId: feedback.id,
        data: {
          terms: biasedTerms,
          biasScore,
        },
        recommendation: biasedTerms[0]?.suggestion,
      });
    }

    // Check rating consistency
    if (feedback.interview?.applicationId) {
      const consistency = await this.statisticalAnalysisService.analyzeRatingConsistency(
        feedback.interview.applicationId
      );

      if (!consistency.isConsistent) {
        alerts.push({
          type: BiasAlertType.RATING_INCONSISTENCY,
          severity: BiasAlertSeverity.MEDIUM,
          message: `High variance in ratings (${consistency.variance.toFixed(2)}) suggests inconsistent evaluation`,
          feedbackId: feedback.id,
          data: {
            variance: consistency.variance,
            averageRating: consistency.averageRating,
            ratings: consistency.ratings,
          },
          recommendation:
            'Review scorecard criteria and ensure all interviewers are using the same standards',
        });
      }
    }

    return alerts;
  }

  /**
   * Generate bias alerts for a job
   */
  async generateJobAlerts(jobId: string): Promise<BiasAlertDto[]> {
    const alerts: BiasAlertDto[] = [];

    // Analyze pass-through rates
    const disparityAnalysis = await this.statisticalAnalysisService.analyzePassThroughRates(
      jobId
    );

    if (disparityAnalysis.hasDisparity) {
      alerts.push({
        type: BiasAlertType.STATISTICAL_DISPARITY,
        severity: BiasAlertSeverity.HIGH,
        message: `Statistical disparity detected: ${disparityAnalysis.affectedGroups.join(', ')} have significantly lower pass rates`,
        jobId,
        data: {
          groups: disparityAnalysis.groups,
          overallPassRate: disparityAnalysis.overallPassRate,
          maxDifference: disparityAnalysis.maxDifference,
          affectedGroups: disparityAnalysis.affectedGroups,
        },
        recommendation:
          'Review hiring criteria and interview process for potential bias. Consider blind resume reviews and structured interviews.',
      });
    }

    // Analyze time-to-hire disparities
    const timeToHireAnalysis = await this.statisticalAnalysisService.analyzeTimeToHireDisparities(
      jobId
    );

    if (timeToHireAnalysis.hasDisparity) {
      alerts.push({
        type: BiasAlertType.DEMOGRAPHIC_PATTERN,
        severity: BiasAlertSeverity.MEDIUM,
        message: 'Significant differences in time-to-hire across demographic groups detected',
        jobId,
        data: {
          groups: timeToHireAnalysis.groups,
          overallAverage: timeToHireAnalysis.overallAverage,
        },
        recommendation:
          'Investigate potential delays in processing for certain groups. Ensure consistent scheduling and decision-making timelines.',
      });
    }

    // Analyze demographic representation
    const representation = await this.statisticalAnalysisService.analyzeDemographicRepresentation(
      jobId
    );

    // Check for significant drop-offs between stages
    for (let i = 1; i < representation.stages.length; i++) {
      const prevStage = representation.stages[i - 1];
      const currStage = representation.stages[i];

      for (const [group, prevPercent] of Object.entries(
        prevStage.demographics
      )) {
        const currPercent = currStage.demographics[group] || 0;
        const dropOff = prevPercent - currPercent;

        // Alert if drop-off is > 30%
        if (dropOff > 30) {
          alerts.push({
            type: BiasAlertType.DEMOGRAPHIC_PATTERN,
            severity: BiasAlertSeverity.HIGH,
            message: `Significant drop-off for ${group} between ${prevStage.stageName} and ${currStage.stageName}`,
            jobId,
            data: {
              group,
              fromStage: prevStage.stageName,
              toStage: currStage.stageName,
              dropOff,
              prevPercent,
              currPercent,
            },
            recommendation:
              'Review evaluation criteria and interviewer training for this stage',
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Get all active alerts for an organization
   */
  async getActiveAlerts(
    organizationId: string,
    filters?: {
      jobId?: string;
      severity?: BiasAlertSeverity;
      type?: BiasAlertType;
    }
  ): Promise<BiasAlertDto[]> {
    // In a real implementation, alerts would be stored in the database
    // For now, we'll generate them on-demand
    const alerts: BiasAlertDto[] = [];

    // This would query jobs for the organization and generate alerts
    // Implementation depends on having a jobs service injected

    return alerts;
  }

  /**
   * Calculate severity based on bias score
   */
  private calculateSeverity(biasScore: number): BiasAlertSeverity {
    if (biasScore >= 75) return BiasAlertSeverity.CRITICAL;
    if (biasScore >= 50) return BiasAlertSeverity.HIGH;
    if (biasScore >= 25) return BiasAlertSeverity.MEDIUM;
    return BiasAlertSeverity.LOW;
  }

  /**
   * Get recommendations for addressing bias
   */
  getGeneralRecommendations(): string[] {
    return [
      'Implement structured interviews with standardized questions',
      'Use blind resume reviews to reduce unconscious bias',
      'Provide regular bias training for all interviewers',
      'Use diverse interview panels',
      'Track and review diversity metrics regularly',
      'Establish clear, job-related evaluation criteria',
      'Document all hiring decisions with specific justifications',
      'Conduct regular audits of hiring practices',
    ];
  }
}
