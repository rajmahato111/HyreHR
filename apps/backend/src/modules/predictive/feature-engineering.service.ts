import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { Interview } from '../../database/entities/interview.entity';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { Offer } from '../../database/entities/offer.entity';
import { SurveyResponse } from '../../database/entities/survey-response.entity';

export interface TimeToFillFeatures {
  historicalAverage: number;
  applicantVolume: number;
  compensationCompetitiveness: number;
  locationCompetitiveness: number;
  hiringManagerResponsiveness: number;
  interviewerAvailability: number;
  seasonality: number;
  departmentAverage: number;
  seniorityLevel: number;
}

export interface OfferAcceptanceFeatures {
  compensationVsMarket: number;
  candidateEngagement: number;
  timeInProcess: number;
  interviewFeedbackAvg: number;
  candidateSurveyScore: number;
  counterOfferRisk: number;
  responseTime: number;
}

@Injectable()
export class FeatureEngineeringService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(SurveyResponse)
    private surveyResponseRepository: Repository<SurveyResponse>,
  ) { }

  async extractTimeToFillFeatures(job: Job): Promise<TimeToFillFeatures> {
    const [
      historicalAverage,
      applicantVolume,
      departmentAverage,
      hiringManagerResponsiveness,
      interviewerAvailability,
    ] = await Promise.all([
      this.getHistoricalTimeToFill(job.organizationId),
      this.getExpectedApplicantVolume(job),
      this.getDepartmentTimeToFill(job.departmentId),
      this.getHiringManagerResponsiveness(job.ownerId),
      this.getInterviewerAvailability(job.organizationId),
    ]);

    return {
      historicalAverage,
      applicantVolume,
      compensationCompetitiveness: this.calculateCompensationCompetitiveness(job),
      locationCompetitiveness: this.calculateLocationCompetitiveness(job),
      hiringManagerResponsiveness,
      interviewerAvailability,
      seasonality: this.getSeasonalityFactor(new Date()),
      departmentAverage,
      seniorityLevel: this.getSeniorityScore(job),
    };
  }

  async extractOfferAcceptanceFeatures(
    offer: Offer,
    application: Application,
  ): Promise<OfferAcceptanceFeatures> {
    const [
      candidateEngagement,
      interviewFeedbackAvg,
      candidateSurveyScore,
      counterOfferRisk,
    ] = await Promise.all([
      this.getCandidateEngagementScore(application),
      this.getAverageFeedbackScore(application.id),
      this.getCandidateSurveyScore(application.candidateId),
      this.assessCounterOfferRisk(application),
    ]);

    return {
      compensationVsMarket: this.calculateCompensationRatio(offer),
      candidateEngagement,
      timeInProcess: this.calculateDaysInProcess(application),
      interviewFeedbackAvg,
      candidateSurveyScore,
      counterOfferRisk,
      responseTime: await this.calculateAverageResponseTime(application),
    };
  }

  private async getHistoricalTimeToFill(organizationId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('app')
      .select('AVG(EXTRACT(EPOCH FROM (app.hired_at - app.applied_at))/86400)', 'avg_days')
      .innerJoin('app.job', 'job')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere('app.status = :status', { status: 'hired' })
      .andWhere('app.hired_at IS NOT NULL')
      .andWhere('app.applied_at > :cutoff', {
        cutoff: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
      })
      .getRawOne();

    return result?.avg_days ? parseFloat(result.avg_days) : 45; // Default 45 days
  }

  private async getDepartmentTimeToFill(departmentId: string): Promise<number> {
    if (!departmentId) return 45;

    const result = await this.applicationRepository
      .createQueryBuilder('app')
      .select('AVG(EXTRACT(EPOCH FROM (app.hired_at - app.applied_at))/86400)', 'avg_days')
      .innerJoin('app.job', 'job')
      .where('job.department_id = :departmentId', { departmentId })
      .andWhere('app.status = :status', { status: 'hired' })
      .andWhere('app.hired_at IS NOT NULL')
      .andWhere('app.applied_at > :cutoff', {
        cutoff: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    return result?.avg_days ? parseFloat(result.avg_days) : 45;
  }

  private async getExpectedApplicantVolume(job: Job): Promise<number> {
    // Get average applications for similar jobs in the last 6 months
    const result = await this.applicationRepository
      .createQueryBuilder('app')
      .select('COUNT(app.id) / COUNT(DISTINCT job.id)', 'avg_applications')
      .innerJoin('app.job', 'job')
      .where('job.organization_id = :organizationId', { organizationId: job.organizationId })
      .andWhere('job.employment_type = :employmentType', { employmentType: job.employmentType })
      .andWhere('app.applied_at > :cutoff', {
        cutoff: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    return result?.avg_applications ? parseFloat(result.avg_applications) : 20;
  }

  private calculateCompensationCompetitiveness(job: Job): number {
    if (!job.salaryMin || !job.salaryMax) return 0.5; // Neutral if no salary data

    // Simple heuristic: higher salary range = more competitive
    // In production, this would compare against market data
    const avgSalary = (job.salaryMin + job.salaryMax) / 2;

    // Normalize to 0-1 scale (assuming 50k-200k range)
    const normalized = Math.min(Math.max((avgSalary - 50000) / 150000, 0), 1);

    return normalized;
  }

  private calculateLocationCompetitiveness(job: Job): number {
    // Remote jobs are generally more competitive
    if (job.remoteOk) return 0.8;

    // In production, this would use location-specific market data
    return 0.5; // Neutral for now
  }

  private async getHiringManagerResponsiveness(ownerId: string): Promise<number> {
    if (!ownerId) return 0.5;

    // Calculate average time to provide feedback
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(EXTRACT(EPOCH FROM (feedback.submitted_at - interview.scheduled_at))/3600)', 'avg_hours')
      .innerJoin('feedback.interview', 'interview')
      .where('feedback.interviewer_id = :ownerId', { ownerId })
      .andWhere('feedback.submitted_at IS NOT NULL')
      .andWhere('interview.scheduled_at > :cutoff', {
        cutoff: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    const avgHours = result?.avg_hours ? parseFloat(result.avg_hours) : 48;

    // Convert to 0-1 score (faster = better)
    // 24 hours = 1.0, 72+ hours = 0.0
    return Math.max(0, Math.min(1, 1 - (avgHours - 24) / 48));
  }

  private async getInterviewerAvailability(organizationId: string): Promise<number> {
    // Calculate average interviews per week
    const result = await this.interviewRepository
      .createQueryBuilder('interview')
      .select('COUNT(interview.id) / COUNT(DISTINCT DATE_TRUNC(\'week\', interview.scheduled_at))', 'avg_per_week')
      .innerJoin('interview.application', 'app')
      .innerJoin('app.job', 'job')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere('interview.scheduled_at > :cutoff', {
        cutoff: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    const avgPerWeek = result?.avg_per_week ? parseFloat(result.avg_per_week) : 10;

    // Normalize: 20+ interviews/week = high availability (1.0)
    return Math.min(avgPerWeek / 20, 1);
  }

  private getSeasonalityFactor(date: Date): number {
    const month = date.getMonth();

    // Hiring typically slower in summer (June-Aug) and holidays (Nov-Dec)
    const slowMonths = [5, 6, 7, 10, 11]; // 0-indexed

    if (slowMonths.includes(month)) {
      return 0.7; // 30% slower
    }

    // Q1 and early Q2 typically busier
    if (month >= 0 && month <= 4) {
      return 1.2; // 20% faster
    }

    return 1.0; // Normal
  }

  private getSeniorityScore(job: Job): number {
    const title = job.title.toLowerCase();

    if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
      return 0.8; // Senior roles take longer
    }

    if (title.includes('junior') || title.includes('entry')) {
      return 0.3; // Junior roles faster
    }

    if (title.includes('director') || title.includes('vp') || title.includes('executive')) {
      return 1.0; // Executive roles take longest
    }

    return 0.5; // Mid-level
  }

  private async getCandidateEngagementScore(application: Application): Promise<number> {
    // Count interactions: emails, interviews, responses
    const interviewCount = await this.interviewRepository.count({
      where: { applicationId: application.id },
    });

    // More interviews = higher engagement
    return Math.min(interviewCount / 5, 1); // Cap at 5 interviews
  }

  private async getAverageFeedbackScore(applicationId: string): Promise<number> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.overall_rating)', 'avg_rating')
      .innerJoin('feedback.interview', 'interview')
      .where('interview.application_id = :applicationId', { applicationId })
      .andWhere('feedback.overall_rating IS NOT NULL')
      .getRawOne();

    const avgRating = result?.avg_rating ? parseFloat(result.avg_rating) : 3;

    // Normalize to 0-1 (rating is 1-5)
    return (avgRating - 1) / 4;
  }

  private async getCandidateSurveyScore(candidateId: string): Promise<number> {
    const result = await this.surveyResponseRepository
      .createQueryBuilder('response')
      .select('AVG(response.nps_score)', 'avg_nps')
      .where('response.candidate_id = :candidateId', { candidateId })
      .andWhere('response.nps_score IS NOT NULL')
      .getRawOne();

    const avgNps = result?.avg_nps ? parseFloat(result.avg_nps) : 7;

    // NPS is 0-10, normalize to 0-1
    return avgNps / 10;
  }

  private calculateDaysInProcess(application: Application): number {
    const now = new Date();
    const appliedAt = new Date(application.appliedAt);
    const diffMs = now.getTime() - appliedAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private calculateCompensationRatio(offer: Offer): number {
    if (!offer.salary) return 0.5;

    // In production, compare against market data
    // For now, use a simple heuristic
    // Assuming market average is around 100k
    const marketAverage = 100000;
    const ratio = offer.salary / marketAverage;

    // Normalize: 0.8-1.2 range maps to 0-1
    return Math.min(Math.max((ratio - 0.8) / 0.4, 0), 1);
  }

  private async assessCounterOfferRisk(application: Application): Promise<number> {
    // Factors that increase counter-offer risk:
    // - Currently employed
    // - Long time in process
    // - High engagement

    const daysInProcess = this.calculateDaysInProcess(application);

    // Longer process = higher risk
    const timeRisk = Math.min(daysInProcess / 60, 1); // Cap at 60 days

    return timeRisk;
  }

  private async calculateAverageResponseTime(application: Application): Promise<number> {
    // Calculate average time between stage changes
    const history = await this.applicationRepository
      .createQueryBuilder('app')
      .select('app.history')
      .where('app.id = :id', { id: application.id })
      .getOne();

    if (!history || !Array.isArray(history.history) || history.history.length < 2) {
      return 3; // Default 3 days
    }

    let totalDays = 0;
    for (let i = 1; i < history.history.length; i++) {
      const prev = new Date(history.history[i - 1].movedAt);
      const curr = new Date(history.history[i].movedAt);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      totalDays += diffDays;
    }

    return totalDays / (history.history.length - 1);
  }
}
