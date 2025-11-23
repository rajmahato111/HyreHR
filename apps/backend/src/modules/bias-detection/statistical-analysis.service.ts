import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { InterviewFeedback } from '../../database/entities/interview-feedback.entity';

interface DemographicGroup {
  group: string;
  total: number;
  passed: number;
  passRate: number;
}

export interface DisparityAnalysis {
  hasDisparity: boolean;
  groups: DemographicGroup[];
  overallPassRate: number;
  maxDifference: number;
  affectedGroups: string[];
}

@Injectable()
export class StatisticalAnalysisService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
  ) { }

  /**
   * Analyze pass-through rates by demographic groups
   */
  async analyzePassThroughRates(
    jobId: string,
    stageId?: string
  ): Promise<DisparityAnalysis> {
    // Get applications with candidate demographics
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .where('app.jobId = :jobId', { jobId });

    if (stageId) {
      query.andWhere('app.stageId = :stageId', { stageId });
    }

    const applications = await query.getMany();

    // Group by demographics (using custom fields for EEOC data)
    const demographicGroups = this.groupByDemographics(applications);

    // Calculate pass rates
    const groups: DemographicGroup[] = [];
    let totalPassed = 0;
    let totalCandidates = 0;

    for (const [groupName, apps] of Object.entries(demographicGroups)) {
      const total = apps.length;
      const passed = apps.filter(
        (app) => app.status === 'active' || app.status === 'hired'
      ).length;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      groups.push({
        group: groupName,
        total,
        passed,
        passRate,
      });

      totalPassed += passed;
      totalCandidates += total;
    }

    const overallPassRate =
      totalCandidates > 0 ? (totalPassed / totalCandidates) * 100 : 0;

    // Calculate disparities (using 4/5ths rule - 80% threshold)
    const threshold = 0.8;
    const affectedGroups: string[] = [];
    let maxDifference = 0;

    for (const group of groups) {
      if (group.total >= 5) {
        // Only analyze groups with sufficient sample size
        const ratio = group.passRate / overallPassRate;
        const difference = Math.abs(group.passRate - overallPassRate);

        if (ratio < threshold) {
          affectedGroups.push(group.group);
        }

        maxDifference = Math.max(maxDifference, difference);
      }
    }

    return {
      hasDisparity: affectedGroups.length > 0,
      groups,
      overallPassRate,
      maxDifference,
      affectedGroups,
    };
  }

  /**
   * Analyze rating consistency across interviewers
   */
  async analyzeRatingConsistency(
    applicationId: string
  ): Promise<{
    isConsistent: boolean;
    variance: number;
    averageRating: number;
    ratings: number[];
  }> {
    const feedback = await this.feedbackRepository.find({
      where: { interview: { applicationId } },
    });

    if (feedback.length < 2) {
      return {
        isConsistent: true,
        variance: 0,
        averageRating: feedback[0]?.overallRating || 0,
        ratings: feedback.map((f) => f.overallRating),
      };
    }

    const ratings = feedback.map((f) => f.overallRating);
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // Calculate variance
    const variance =
      ratings.reduce((sum, r) => sum + Math.pow(r - average, 2), 0) /
      ratings.length;

    // High variance (> 1.5) indicates inconsistency
    const isConsistent = variance <= 1.5;

    return {
      isConsistent,
      variance,
      averageRating: average,
      ratings,
    };
  }

  /**
   * Analyze demographic representation at each stage
   */
  async analyzeDemographicRepresentation(
    jobId: string
  ): Promise<{
    stages: {
      stageId: string;
      stageName: string;
      demographics: Record<string, number>;
    }[];
  }> {
    const applications = await this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.stage', 'stage')
      .where('app.jobId = :jobId', { jobId })
      .getMany();

    // Group by stage
    const stageGroups = new Map<string, Application[]>();
    for (const app of applications) {
      const stageId = app.stageId;
      if (!stageGroups.has(stageId)) {
        stageGroups.set(stageId, []);
      }
      stageGroups.get(stageId).push(app);
    }

    const stages = [];
    for (const [stageId, apps] of stageGroups.entries()) {
      const demographics = this.calculateDemographicDistribution(apps);
      const stageName = apps[0]?.stage?.name || 'Unknown';

      stages.push({
        stageId,
        stageName,
        demographics,
      });
    }

    return { stages };
  }

  /**
   * Calculate time-to-hire disparities by demographic group
   */
  async analyzeTimeToHireDisparities(
    jobId: string
  ): Promise<{
    hasDisparity: boolean;
    groups: {
      group: string;
      averageDays: number;
      count: number;
    }[];
    overallAverage: number;
  }> {
    const applications = await this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .where('app.jobId = :jobId', { jobId })
      .andWhere('app.status = :status', { status: 'hired' })
      .getMany();

    const demographicGroups = this.groupByDemographics(applications);
    const groups = [];
    let totalDays = 0;
    let totalCount = 0;

    for (const [groupName, apps] of Object.entries(demographicGroups)) {
      const daysToHire = apps
        .filter((app) => app.hiredAt && app.appliedAt)
        .map((app) => {
          const days =
            (app.hiredAt.getTime() - app.appliedAt.getTime()) /
            (1000 * 60 * 60 * 24);
          return days;
        });

      if (daysToHire.length > 0) {
        const averageDays =
          daysToHire.reduce((sum, d) => sum + d, 0) / daysToHire.length;

        groups.push({
          group: groupName,
          averageDays: Math.round(averageDays),
          count: daysToHire.length,
        });

        totalDays += averageDays * daysToHire.length;
        totalCount += daysToHire.length;
      }
    }

    const overallAverage = totalCount > 0 ? totalDays / totalCount : 0;

    // Check for significant disparities (> 20% difference)
    const hasDisparity = groups.some(
      (g) =>
        g.count >= 3 &&
        Math.abs(g.averageDays - overallAverage) / overallAverage > 0.2
    );

    return {
      hasDisparity,
      groups,
      overallAverage: Math.round(overallAverage),
    };
  }

  /**
   * Group applications by demographic characteristics
   */
  private groupByDemographics(
    applications: Application[]
  ): Record<string, Application[]> {
    const groups: Record<string, Application[]> = {};

    for (const app of applications) {
      // Use EEOC demographic data from candidate custom fields
      const demographics = app.candidate?.customFields?.demographics || {};

      // Group by gender
      const gender = demographics.gender || 'Not Specified';
      const genderKey = `Gender: ${gender}`;
      if (!groups[genderKey]) groups[genderKey] = [];
      groups[genderKey].push(app);

      // Group by ethnicity
      const ethnicity = demographics.ethnicity || 'Not Specified';
      const ethnicityKey = `Ethnicity: ${ethnicity}`;
      if (!groups[ethnicityKey]) groups[ethnicityKey] = [];
      groups[ethnicityKey].push(app);

      // Group by veteran status
      const veteran = demographics.veteranStatus || 'Not Specified';
      const veteranKey = `Veteran: ${veteran}`;
      if (!groups[veteranKey]) groups[veteranKey] = [];
      groups[veteranKey].push(app);

      // Group by disability status
      const disability = demographics.disabilityStatus || 'Not Specified';
      const disabilityKey = `Disability: ${disability}`;
      if (!groups[disabilityKey]) groups[disabilityKey] = [];
      groups[disabilityKey].push(app);
    }

    return groups;
  }

  /**
   * Calculate demographic distribution
   */
  private calculateDemographicDistribution(
    applications: Application[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    const total = applications.length;

    if (total === 0) return distribution;

    const groups = this.groupByDemographics(applications);

    for (const [groupName, apps] of Object.entries(groups)) {
      distribution[groupName] = Math.round((apps.length / total) * 100);
    }

    return distribution;
  }
}
