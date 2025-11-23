import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../database/entities/offer.entity';
import { Application } from '../../database/entities/application.entity';
import { FeatureEngineeringService, OfferAcceptanceFeatures } from './feature-engineering.service';
import { OfferAcceptancePredictionResponse } from './dto';

@Injectable()
export class OfferAcceptanceService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private featureEngineeringService: FeatureEngineeringService,
  ) {}

  async predictOfferAcceptance(offerId: string): Promise<OfferAcceptancePredictionResponse> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['application', 'application.candidate', 'application.job'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Extract features
    const features = await this.featureEngineeringService.extractOfferAcceptanceFeatures(
      offer,
      offer.application,
    );

    // Calculate prediction
    const probability = this.calculateAcceptanceProbability(features);

    // Identify key factors
    const factors = this.identifyKeyFactors(features);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(probability);

    // Generate recommendations
    const recommendations = this.generateRecommendations(features, probability);

    return {
      acceptanceProbability: Math.round(probability),
      factors,
      riskLevel,
      recommendations,
    };
  }

  private calculateAcceptanceProbability(features: OfferAcceptanceFeatures): number {
    // Logistic regression model
    // In production, this would be a trained ML model (e.g., Logistic Regression, Neural Network)
    
    const weights = {
      compensationVsMarket: 0.35,
      candidateEngagement: 0.20,
      interviewFeedbackAvg: 0.15,
      candidateSurveyScore: 0.10,
      timeInProcess: -0.10, // Longer process = lower acceptance
      counterOfferRisk: -0.05,
      responseTime: -0.05,
    };

    // Calculate weighted score
    let score = 0;
    
    // Compensation is the biggest factor
    score += features.compensationVsMarket * weights.compensationVsMarket;
    
    // Candidate engagement
    score += features.candidateEngagement * weights.candidateEngagement;
    
    // Interview feedback
    score += features.interviewFeedbackAvg * weights.interviewFeedbackAvg;
    
    // Survey score
    score += features.candidateSurveyScore * weights.candidateSurveyScore;
    
    // Time in process (negative impact if too long)
    const normalizedTime = Math.min(features.timeInProcess / 60, 1); // Cap at 60 days
    score += (1 - normalizedTime) * Math.abs(weights.timeInProcess);
    
    // Counter-offer risk
    score += (1 - features.counterOfferRisk) * Math.abs(weights.counterOfferRisk);
    
    // Response time (faster = better)
    const normalizedResponseTime = Math.min(features.responseTime / 7, 1); // Cap at 7 days
    score += (1 - normalizedResponseTime) * Math.abs(weights.responseTime);

    // Convert to probability (0-100%)
    // Apply sigmoid function for realistic probability distribution
    const probability = this.sigmoid(score * 10 - 5) * 100;

    return Math.max(0, Math.min(100, probability));
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private identifyKeyFactors(
    features: OfferAcceptanceFeatures,
  ): Array<{ name: string; impact: number; value: any }> {
    const factors = [
      {
        name: 'Compensation vs Market',
        impact: this.calculateFactorImpact(features.compensationVsMarket, 0.5, 0.35),
        value: this.formatCompensation(features.compensationVsMarket),
      },
      {
        name: 'Candidate Engagement',
        impact: this.calculateFactorImpact(features.candidateEngagement, 0.5, 0.20),
        value: this.formatEngagement(features.candidateEngagement),
      },
      {
        name: 'Interview Feedback',
        impact: this.calculateFactorImpact(features.interviewFeedbackAvg, 0.5, 0.15),
        value: this.formatFeedback(features.interviewFeedbackAvg),
      },
      {
        name: 'Candidate Experience Score',
        impact: this.calculateFactorImpact(features.candidateSurveyScore, 0.5, 0.10),
        value: this.formatScore(features.candidateSurveyScore),
      },
      {
        name: 'Time in Process',
        impact: this.calculateFactorImpact(features.timeInProcess, 30, -0.10),
        value: `${features.timeInProcess} days`,
      },
      {
        name: 'Counter-Offer Risk',
        impact: this.calculateFactorImpact(features.counterOfferRisk, 0.5, -0.05),
        value: this.formatRisk(features.counterOfferRisk),
      },
      {
        name: 'Average Response Time',
        impact: this.calculateFactorImpact(features.responseTime, 3, -0.05),
        value: `${Math.round(features.responseTime)} days`,
      },
    ];

    // Sort by absolute impact
    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private calculateFactorImpact(value: number, baseline: number, weight: number): number {
    const deviation = value - baseline;
    return deviation * weight * 100; // Scale to percentage points
  }

  private determineRiskLevel(probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 70) return 'low';
    if (probability >= 50) return 'medium';
    return 'high';
  }

  private generateRecommendations(
    features: OfferAcceptanceFeatures,
    probability: number,
  ): string[] {
    const recommendations: string[] = [];

    // Compensation recommendations
    if (features.compensationVsMarket < 0.4) {
      recommendations.push(
        'Consider increasing compensation - current offer is below market rate',
      );
    } else if (features.compensationVsMarket < 0.6) {
      recommendations.push(
        'Compensation is competitive but could be improved to increase acceptance likelihood',
      );
    }

    // Engagement recommendations
    if (features.candidateEngagement < 0.3) {
      recommendations.push(
        'Low candidate engagement detected - consider additional touchpoints or sell calls',
      );
    }

    // Interview feedback recommendations
    if (features.interviewFeedbackAvg < 0.5) {
      recommendations.push(
        'Interview feedback is mixed - address any concerns raised during the process',
      );
    }

    // Survey score recommendations
    if (features.candidateSurveyScore < 0.6) {
      recommendations.push(
        'Candidate experience score is below target - follow up to address any concerns',
      );
    }

    // Time in process recommendations
    if (features.timeInProcess > 45) {
      recommendations.push(
        'Extended time in process may reduce acceptance - expedite offer decision',
      );
    }

    // Counter-offer risk recommendations
    if (features.counterOfferRisk > 0.6) {
      recommendations.push(
        'High counter-offer risk - be prepared to negotiate and highlight non-monetary benefits',
      );
    }

    // Response time recommendations
    if (features.responseTime > 5) {
      recommendations.push(
        'Slow response times detected - ensure timely communication to maintain candidate interest',
      );
    }

    // Overall probability recommendations
    if (probability < 50) {
      recommendations.push(
        'Overall acceptance probability is low - consider scheduling a call to address concerns',
      );
    } else if (probability >= 70) {
      recommendations.push(
        'Strong acceptance indicators - maintain momentum and close quickly',
      );
    }

    // If no specific recommendations, provide general guidance
    if (recommendations.length === 0) {
      recommendations.push(
        'Offer is well-positioned - maintain regular communication until acceptance',
      );
    }

    return recommendations;
  }

  private formatCompensation(score: number): string {
    if (score >= 0.8) return 'Well above market';
    if (score >= 0.6) return 'Above market';
    if (score >= 0.4) return 'At market';
    if (score >= 0.2) return 'Below market';
    return 'Well below market';
  }

  private formatEngagement(score: number): string {
    if (score >= 0.7) return 'Highly engaged';
    if (score >= 0.5) return 'Engaged';
    if (score >= 0.3) return 'Moderately engaged';
    return 'Low engagement';
  }

  private formatFeedback(score: number): string {
    if (score >= 0.8) return 'Excellent (4.2-5.0)';
    if (score >= 0.6) return 'Good (3.4-4.2)';
    if (score >= 0.4) return 'Fair (2.6-3.4)';
    return 'Poor (1.0-2.6)';
  }

  private formatScore(score: number): string {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  }

  private formatRisk(score: number): string {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  }
}
