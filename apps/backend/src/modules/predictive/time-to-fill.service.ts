import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../database/entities/job.entity';
import { FeatureEngineeringService, TimeToFillFeatures } from './feature-engineering.service';
import { TimeToFillPredictionResponse } from './dto';

@Injectable()
export class TimeToFillService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private featureEngineeringService: FeatureEngineeringService,
  ) {}

  async predictTimeToFill(jobId: string): Promise<TimeToFillPredictionResponse> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['department', 'owner'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Extract features
    const features = await this.featureEngineeringService.extractTimeToFillFeatures(job);

    // Calculate prediction using weighted model
    const prediction = this.calculatePrediction(features);

    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(prediction, features);

    // Identify key factors
    const factors = this.identifyKeyFactors(features, prediction);

    return {
      predictedDays: Math.round(prediction),
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower),
        upper: Math.round(confidenceInterval.upper),
      },
      factors,
    };
  }

  private calculatePrediction(features: TimeToFillFeatures): number {
    // Weighted linear model
    // In production, this would be a trained ML model (e.g., Random Forest, XGBoost)
    
    const weights = {
      historicalAverage: 0.30,
      departmentAverage: 0.20,
      applicantVolume: -0.15, // More applicants = faster
      compensationCompetitiveness: -0.10, // Better comp = faster
      locationCompetitiveness: -0.05,
      hiringManagerResponsiveness: -0.10, // Better responsiveness = faster
      interviewerAvailability: -0.05,
      seasonality: -0.05,
      seniorityLevel: 0.10, // Higher seniority = longer
    };

    // Base prediction from historical average
    let prediction = features.historicalAverage * weights.historicalAverage;
    prediction += features.departmentAverage * weights.departmentAverage;

    // Adjust based on other factors
    // Applicant volume: more applicants means faster hiring (inverse relationship)
    const normalizedVolume = Math.min(features.applicantVolume / 50, 1);
    prediction += (1 - normalizedVolume) * 10 * Math.abs(weights.applicantVolume);

    // Compensation competitiveness
    prediction += (1 - features.compensationCompetitiveness) * 15 * Math.abs(weights.compensationCompetitiveness);

    // Location competitiveness
    prediction += (1 - features.locationCompetitiveness) * 10 * Math.abs(weights.locationCompetitiveness);

    // Hiring manager responsiveness
    prediction += (1 - features.hiringManagerResponsiveness) * 12 * Math.abs(weights.hiringManagerResponsiveness);

    // Interviewer availability
    prediction += (1 - features.interviewerAvailability) * 8 * Math.abs(weights.interviewerAvailability);

    // Seasonality adjustment
    prediction = prediction / features.seasonality;

    // Seniority level
    prediction += features.seniorityLevel * 20 * weights.seniorityLevel;

    // Ensure reasonable bounds (7-120 days)
    return Math.max(7, Math.min(120, prediction));
  }

  private calculateConfidenceInterval(
    prediction: number,
    features: TimeToFillFeatures,
  ): { lower: number; upper: number } {
    // Calculate uncertainty based on data quality and variance
    // In production, this would come from the ML model's prediction intervals
    
    // Base uncertainty: ±20%
    let uncertainty = 0.20;

    // Increase uncertainty if we have less data
    if (features.applicantVolume < 10) {
      uncertainty += 0.10;
    }

    // Increase uncertainty for extreme seniority levels
    if (features.seniorityLevel > 0.8 || features.seniorityLevel < 0.2) {
      uncertainty += 0.05;
    }

    // Increase uncertainty during seasonal periods
    if (features.seasonality !== 1.0) {
      uncertainty += 0.05;
    }

    const margin = prediction * uncertainty;

    return {
      lower: Math.max(7, prediction - margin),
      upper: Math.min(120, prediction + margin),
    };
  }

  private identifyKeyFactors(
    features: TimeToFillFeatures,
    prediction: number,
  ): Array<{ name: string; impact: number; value: any }> {
    const factors = [
      {
        name: 'Historical Average',
        impact: this.calculateImpact(features.historicalAverage, 45, 0.30),
        value: `${Math.round(features.historicalAverage)} days`,
      },
      {
        name: 'Department Average',
        impact: this.calculateImpact(features.departmentAverage, 45, 0.20),
        value: `${Math.round(features.departmentAverage)} days`,
      },
      {
        name: 'Expected Applicant Volume',
        impact: this.calculateImpact(features.applicantVolume, 20, -0.15),
        value: `${Math.round(features.applicantVolume)} applicants`,
      },
      {
        name: 'Compensation Competitiveness',
        impact: this.calculateImpact(features.compensationCompetitiveness, 0.5, -0.10),
        value: this.formatCompetitiveness(features.compensationCompetitiveness),
      },
      {
        name: 'Location Competitiveness',
        impact: this.calculateImpact(features.locationCompetitiveness, 0.5, -0.05),
        value: this.formatCompetitiveness(features.locationCompetitiveness),
      },
      {
        name: 'Hiring Manager Responsiveness',
        impact: this.calculateImpact(features.hiringManagerResponsiveness, 0.5, -0.10),
        value: this.formatScore(features.hiringManagerResponsiveness),
      },
      {
        name: 'Interviewer Availability',
        impact: this.calculateImpact(features.interviewerAvailability, 0.5, -0.05),
        value: this.formatScore(features.interviewerAvailability),
      },
      {
        name: 'Seasonality',
        impact: this.calculateImpact(features.seasonality, 1.0, -0.05),
        value: this.formatSeasonality(features.seasonality),
      },
      {
        name: 'Seniority Level',
        impact: this.calculateImpact(features.seniorityLevel, 0.5, 0.10),
        value: this.formatSeniority(features.seniorityLevel),
      },
    ];

    // Sort by absolute impact
    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private calculateImpact(value: number, baseline: number, weight: number): number {
    // Calculate how much this feature impacts the prediction
    const deviation = value - baseline;
    return deviation * weight;
  }

  private formatCompetitiveness(score: number): string {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  }

  private formatScore(score: number): string {
    if (score >= 0.7) return 'Excellent';
    if (score >= 0.5) return 'Good';
    if (score >= 0.3) return 'Fair';
    return 'Poor';
  }

  private formatSeasonality(factor: number): string {
    if (factor > 1.1) return 'Peak hiring season';
    if (factor < 0.9) return 'Slow hiring season';
    return 'Normal season';
  }

  private formatSeniority(score: number): string {
    if (score >= 0.8) return 'Executive/Director';
    if (score >= 0.6) return 'Senior';
    if (score >= 0.4) return 'Mid-level';
    if (score >= 0.2) return 'Junior';
    return 'Entry-level';
  }
}
