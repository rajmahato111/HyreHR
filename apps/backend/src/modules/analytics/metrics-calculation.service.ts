import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Application, ApplicationStatus } from '../../database/entities/application.entity';
import { Interview, InterviewStatus } from '../../database/entities/interview.entity';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import {
  FunnelMetrics,
  EfficiencyMetrics,
  QualityMetrics,
  DiversityMetrics,
  GetMetricsDto,
  TimeRange,
} from './dto/metrics.dto';

@Injectable()
export class MetricsCalculationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  private getDateRange(timeRange: TimeRange, startDate?: string, endDate?: string): { start: Date; end: Date } {
    const end = endDate ? new Date(endDate) : new Date();
    let start: Date;

    switch (timeRange) {
      case TimeRange.LAST_7_DAYS:
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_30_DAYS:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_90_DAYS:
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_6_MONTHS:
        start = new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_YEAR:
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.CUSTOM:
        start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { start, end };
  }

  async calculateFunnelMetrics(
    organizationId: string,
    filters: GetMetricsDto,
  ): Promise<FunnelMetrics> {
    const { start, end } = this.getDateRange(filters.timeRange, filters.startDate, filters.endDate);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('app.stage', 'stage')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('app.appliedAt BETWEEN :start AND :end', { start, end });

    if (filters.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('job.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    const applications = await queryBuilder.getMany();

    const totalApplications = applications.length;
    
    // Count applications by stage type
    const screeningPassed = applications.filter(
      app => app.stage?.type !== 'applied' && app.status === ApplicationStatus.ACTIVE
    ).length;

    // Get interviews for these applications
    const applicationIds = applications.map(app => app.id);
    const interviews = await this.interviewRepository.find({
      where: {
        applicationId: In(applicationIds),
      },
    });

    const interviewsScheduled = new Set(interviews.map(i => i.applicationId)).size;
    const interviewsCompleted = new Set(
      interviews.filter(i => i.status === InterviewStatus.COMPLETED).map(i => i.applicationId)
    ).size;

    // Count offers and acceptances
    const offersExtended = applications.filter(
      app => app.stage?.type === 'offer' || app.status === ApplicationStatus.HIRED
    ).length;
    const offersAccepted = applications.filter(app => app.status === ApplicationStatus.HIRED).length;

    // Calculate conversion rates
    const conversionRates = {
      applicationToScreening: totalApplications > 0 ? (screeningPassed / totalApplications) * 100 : 0,
      screeningToInterview: screeningPassed > 0 ? (interviewsScheduled / screeningPassed) * 100 : 0,
      interviewToOffer: interviewsCompleted > 0 ? (offersExtended / interviewsCompleted) * 100 : 0,
      offerToAcceptance: offersExtended > 0 ? (offersAccepted / offersExtended) * 100 : 0,
      overallConversion: totalApplications > 0 ? (offersAccepted / totalApplications) * 100 : 0,
    };

    // Calculate drop-off analysis
    const dropOffAnalysis = [
      {
        stage: 'Application to Screening',
        count: totalApplications - screeningPassed,
        percentage: totalApplications > 0 ? ((totalApplications - screeningPassed) / totalApplications) * 100 : 0,
      },
      {
        stage: 'Screening to Interview',
        count: screeningPassed - interviewsScheduled,
        percentage: screeningPassed > 0 ? ((screeningPassed - interviewsScheduled) / screeningPassed) * 100 : 0,
      },
      {
        stage: 'Interview to Offer',
        count: interviewsCompleted - offersExtended,
        percentage: interviewsCompleted > 0 ? ((interviewsCompleted - offersExtended) / interviewsCompleted) * 100 : 0,
      },
      {
        stage: 'Offer to Acceptance',
        count: offersExtended - offersAccepted,
        percentage: offersExtended > 0 ? ((offersExtended - offersAccepted) / offersExtended) * 100 : 0,
      },
    ];

    return {
      totalApplications,
      screeningPassed,
      interviewsScheduled,
      interviewsCompleted,
      offersExtended,
      offersAccepted,
      conversionRates,
      dropOffAnalysis,
    };
  }

  async calculateEfficiencyMetrics(
    organizationId: string,
    filters: GetMetricsDto,
  ): Promise<EfficiencyMetrics> {
    const { start, end } = this.getDateRange(filters.timeRange, filters.startDate, filters.endDate);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('app.history', 'history')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('app.appliedAt BETWEEN :start AND :end', { start, end });

    if (filters.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('job.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    const applications = await queryBuilder.getMany();

    // Calculate time to fill (job opening to offer acceptance)
    const hiredApplications = applications.filter(app => app.status === ApplicationStatus.HIRED && app.hiredAt);
    const timeToFillDays = hiredApplications.map(app => {
      const days = (app.hiredAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
      return days;
    });
    const averageTimeToFill = timeToFillDays.length > 0
      ? timeToFillDays.reduce((sum, days) => sum + days, 0) / timeToFillDays.length
      : 0;

    // Calculate time to hire (application to offer acceptance)
    const averageTimeToHire = averageTimeToFill; // Same as time to fill for now

    // Calculate average time in each stage
    const stageTimeMap = new Map<string, number[]>();
    
    for (const app of applications) {
      if (app.history && app.history.length > 0) {
        for (let i = 0; i < app.history.length; i++) {
          const historyEntry = app.history[i];
          const nextEntry = app.history[i + 1];
          const stageName = historyEntry.toStage?.name || 'Unknown';
          
          const entryTime = historyEntry.timestamp.getTime();
          const exitTime = nextEntry ? nextEntry.timestamp.getTime() : Date.now();
          const daysInStage = (exitTime - entryTime) / (1000 * 60 * 60 * 24);
          
          if (!stageTimeMap.has(stageName)) {
            stageTimeMap.set(stageName, []);
          }
          stageTimeMap.get(stageName).push(daysInStage);
        }
      }
    }

    const averageTimeInStage = Array.from(stageTimeMap.entries()).map(([stage, times]) => ({
      stage,
      averageDays: times.reduce((sum, time) => sum + time, 0) / times.length,
    }));

    // Calculate interviews per hire
    const applicationIds = hiredApplications.map(app => app.id);
    const interviewCount = await this.interviewRepository.count({
      where: {
        applicationId: In(applicationIds),
      },
    });
    const interviewsPerHire = hiredApplications.length > 0 ? interviewCount / hiredApplications.length : 0;

    // Calculate application response time (time from application to first stage change)
    const responseTimeDays = applications
      .filter(app => app.history && app.history.length > 0)
      .map(app => {
        const firstChange = app.history[0];
        return (firstChange.timestamp.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
      });
    const applicationResponseTime = responseTimeDays.length > 0
      ? responseTimeDays.reduce((sum, days) => sum + days, 0) / responseTimeDays.length
      : 0;

    return {
      averageTimeToFill: Math.round(averageTimeToFill * 10) / 10,
      averageTimeToHire: Math.round(averageTimeToHire * 10) / 10,
      averageTimeInStage,
      interviewsPerHire: Math.round(interviewsPerHire * 10) / 10,
      applicationResponseTime: Math.round(applicationResponseTime * 10) / 10,
    };
  }

  async calculateQualityMetrics(
    organizationId: string,
    filters: GetMetricsDto,
  ): Promise<QualityMetrics> {
    const { start, end } = this.getDateRange(filters.timeRange, filters.startDate, filters.endDate);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('app.appliedAt BETWEEN :start AND :end', { start, end });

    if (filters.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('job.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    const applications = await queryBuilder.getMany();

    // Calculate offer acceptance rate
    const offersExtended = applications.filter(
      app => app.stage?.type === 'offer' || app.status === ApplicationStatus.HIRED
    ).length;
    const offersAccepted = applications.filter(app => app.status === ApplicationStatus.HIRED).length;
    const offerAcceptanceRate = offersExtended > 0 ? (offersAccepted / offersExtended) * 100 : 0;

    // Calculate candidate quality score (based on ratings)
    const ratedApplications = applications.filter(app => app.rating);
    const candidateQualityScore = ratedApplications.length > 0
      ? (ratedApplications.reduce((sum, app) => sum + app.rating, 0) / ratedApplications.length) * 20 // Convert 1-5 to 0-100
      : 0;

    // Calculate source effectiveness
    const sourceMap = new Map<string, { applications: number; hires: number }>();
    
    for (const app of applications) {
      const source = app.sourceType || 'Unknown';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { applications: 0, hires: 0 });
      }
      const stats = sourceMap.get(source);
      stats.applications++;
      if (app.status === ApplicationStatus.HIRED) {
        stats.hires++;
      }
    }

    const sourceEffectiveness = Array.from(sourceMap.entries()).map(([source, stats]) => ({
      source,
      applications: stats.applications,
      hires: stats.hires,
      conversionRate: stats.applications > 0 ? (stats.hires / stats.applications) * 100 : 0,
    }));

    // Calculate average interview feedback
    const applicationIds = applications.map(app => app.id);
    const interviews = await this.interviewRepository.find({
      where: {
        applicationId: In(applicationIds),
      },
      relations: ['feedback'],
    });

    const allFeedback = interviews.flatMap(i => i.feedback || []);
    const interviewFeedbackAverage = allFeedback.length > 0
      ? (allFeedback.reduce((sum, fb) => sum + (fb.overallRating || 0), 0) / allFeedback.length) * 20 // Convert 1-5 to 0-100
      : 0;

    return {
      offerAcceptanceRate: Math.round(offerAcceptanceRate * 10) / 10,
      candidateQualityScore: Math.round(candidateQualityScore * 10) / 10,
      sourceEffectiveness,
      interviewFeedbackAverage: Math.round(interviewFeedbackAverage * 10) / 10,
    };
  }

  async calculateDiversityMetrics(
    organizationId: string,
    filters: GetMetricsDto,
  ): Promise<DiversityMetrics> {
    const { start, end } = this.getDateRange(filters.timeRange, filters.startDate, filters.endDate);

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.stage', 'stage')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('app.appliedAt BETWEEN :start AND :end', { start, end });

    if (filters.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('job.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    const applications = await queryBuilder.getMany();

    // Note: This is a simplified implementation. In production, you would need to:
    // 1. Store demographic data in compliance with EEOC regulations
    // 2. Ensure voluntary collection with proper disclosures
    // 3. Implement proper anonymization and aggregation

    // Demographic breakdown (placeholder - would need actual demographic data)
    const demographicBreakdown = [
      {
        category: 'Gender',
        value: 'Not Collected',
        count: applications.length,
        percentage: 100,
      },
    ];

    // Stage pass rates by demographics (placeholder)
    const stagePassRates = [
      {
        stage: 'All Stages',
        demographics: [
          {
            category: 'Overall',
            value: 'All Candidates',
            passRate: applications.filter(app => app.status === ApplicationStatus.HIRED).length / applications.length * 100,
          },
        ],
      },
    ];

    // Hiring diversity (placeholder)
    const hiredApplications = applications.filter(app => app.status === ApplicationStatus.HIRED);
    const hiringDiversity = [
      {
        category: 'Total',
        value: 'All Hires',
        hireCount: hiredApplications.length,
        percentage: 100,
      },
    ];

    return {
      demographicBreakdown,
      stagePassRates,
      hiringDiversity,
    };
  }
}
