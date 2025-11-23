import { Injectable } from '@nestjs/common';

export enum ExperienceLevel {
  ENTRY = 'entry', // 0-2 years
  JUNIOR = 'junior', // 2-4 years
  MID = 'mid', // 4-7 years
  SENIOR = 'senior', // 7-10 years
  LEAD = 'lead', // 10-15 years
  PRINCIPAL = 'principal', // 15+ years
  EXECUTIVE = 'executive', // C-level
}

export interface ExperienceMatchResult {
  score: number; // 0-100
  candidateYears: number;
  requiredYears: number;
  candidateLevel: ExperienceLevel;
  requiredLevel: ExperienceLevel;
  meetsRequirement: boolean;
  explanation: string;
}

@Injectable()
export class ExperienceMatchingService {
  /**
   * Calculate experience match score
   * 
   * Scoring:
   * - Exact level match: 100 points
   * - One level above: 90 points
   * - Two levels above: 80 points
   * - One level below: 70 points
   * - Two levels below: 50 points
   * - More than two levels off: 30 points
   */
  calculateExperienceMatch(
    candidateYears: number,
    requiredYears: number,
    requiredLevel?: ExperienceLevel,
  ): ExperienceMatchResult {
    const candidateLevel = this.yearsToLevel(candidateYears);
    const targetLevel = requiredLevel || this.yearsToLevel(requiredYears);

    const levelDiff = this.getLevelDifference(candidateLevel, targetLevel);
    let score = 0;
    let meetsRequirement = false;
    let explanation = '';

    if (levelDiff === 0) {
      score = 100;
      meetsRequirement = true;
      explanation = `Candidate has ${candidateYears} years of experience, matching the ${targetLevel} level requirement.`;
    } else if (levelDiff === 1) {
      // One level above
      score = 90;
      meetsRequirement = true;
      explanation = `Candidate is overqualified with ${candidateYears} years of experience (${candidateLevel} level) for ${targetLevel} level position.`;
    } else if (levelDiff === 2) {
      // Two levels above
      score = 80;
      meetsRequirement = true;
      explanation = `Candidate is significantly overqualified with ${candidateYears} years of experience (${candidateLevel} level) for ${targetLevel} level position.`;
    } else if (levelDiff === -1) {
      // One level below
      score = 70;
      meetsRequirement = false;
      explanation = `Candidate has ${candidateYears} years of experience (${candidateLevel} level), slightly below the ${targetLevel} level requirement.`;
    } else if (levelDiff === -2) {
      // Two levels below
      score = 50;
      meetsRequirement = false;
      explanation = `Candidate has ${candidateYears} years of experience (${candidateLevel} level), below the ${targetLevel} level requirement.`;
    } else if (levelDiff > 2) {
      // More than two levels above
      score = 70;
      meetsRequirement = true;
      explanation = `Candidate is highly overqualified with ${candidateYears} years of experience (${candidateLevel} level) for ${targetLevel} level position.`;
    } else {
      // More than two levels below
      score = 30;
      meetsRequirement = false;
      explanation = `Candidate has ${candidateYears} years of experience (${candidateLevel} level), significantly below the ${targetLevel} level requirement.`;
    }

    return {
      score,
      candidateYears,
      requiredYears,
      candidateLevel,
      requiredLevel: targetLevel,
      meetsRequirement,
      explanation,
    };
  }

  /**
   * Convert years of experience to experience level
   */
  private yearsToLevel(years: number): ExperienceLevel {
    if (years < 2) return ExperienceLevel.ENTRY;
    if (years < 4) return ExperienceLevel.JUNIOR;
    if (years < 7) return ExperienceLevel.MID;
    if (years < 10) return ExperienceLevel.SENIOR;
    if (years < 15) return ExperienceLevel.LEAD;
    return ExperienceLevel.PRINCIPAL;
  }

  /**
   * Get numeric difference between experience levels
   * Positive means candidate is more experienced
   * Negative means candidate is less experienced
   */
  private getLevelDifference(
    candidateLevel: ExperienceLevel,
    requiredLevel: ExperienceLevel,
  ): number {
    const levels = [
      ExperienceLevel.ENTRY,
      ExperienceLevel.JUNIOR,
      ExperienceLevel.MID,
      ExperienceLevel.SENIOR,
      ExperienceLevel.LEAD,
      ExperienceLevel.PRINCIPAL,
      ExperienceLevel.EXECUTIVE,
    ];

    const candidateIndex = levels.indexOf(candidateLevel);
    const requiredIndex = levels.indexOf(requiredLevel);

    return candidateIndex - requiredIndex;
  }

  /**
   * Extract years of experience from work history
   */
  calculateTotalExperience(workHistory: Array<{ startDate: Date; endDate?: Date }>): number {
    let totalMonths = 0;

    for (const job of workHistory) {
      const start = new Date(job.startDate);
      const end = job.endDate ? new Date(job.endDate) : new Date();
      
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      
      totalMonths += Math.max(0, months);
    }

    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
  }
}
