import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { SkillMatchingService, SkillMatchResult } from './skill-matching.service';
import { ExperienceMatchingService, ExperienceMatchResult } from './experience-matching.service';
import { EducationMatchingService, EducationMatchResult, Education } from './education-matching.service';
import { LocationMatchingService, LocationMatchResult, Location } from './location-matching.service';
import { TitleMatchingService, TitleMatchResult } from './title-matching.service';

export interface MatchWeights {
  skills: number;
  experience: number;
  education: number;
  location: number;
  title: number;
}

export interface MatchBreakdown {
  skills: SkillMatchResult;
  experience: ExperienceMatchResult;
  education: EducationMatchResult;
  location: LocationMatchResult;
  title: TitleMatchResult;
}

export interface MatchScore {
  overall: number; // 0-100
  breakdown: MatchBreakdown;
  skillGaps: string[];
  matchReasons: string[];
  weights: MatchWeights;
}

export interface CandidateMatchResult {
  candidateId: string;
  jobId: string;
  matchScore: MatchScore;
  candidate: Candidate;
  job: Job;
}

@Injectable()
export class CandidateMatchingService {
  private defaultWeights: MatchWeights = {
    skills: 0.40,
    experience: 0.25,
    education: 0.15,
    location: 0.10,
    title: 0.10,
  };

  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private skillMatchingService: SkillMatchingService,
    private experienceMatchingService: ExperienceMatchingService,
    private educationMatchingService: EducationMatchingService,
    private locationMatchingService: LocationMatchingService,
    private titleMatchingService: TitleMatchingService,
  ) { }

  /**
   * Calculate match score between a candidate and a job
   */
  async calculateMatch(
    candidateId: string,
    jobId: string,
    customWeights?: Partial<MatchWeights>,
  ): Promise<MatchScore> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['locations'],
    });

    if (!candidate || !job) {
      throw new Error('Candidate or Job not found');
    }

    return this.calculateMatchFromEntities(candidate, job, customWeights);
  }

  /**
   * Calculate match score from candidate and job entities
   */
  calculateMatchFromEntities(
    candidate: Candidate,
    job: Job,
    customWeights?: Partial<MatchWeights>,
  ): MatchScore {
    const weights = { ...this.defaultWeights, ...customWeights };

    // Extract data from custom fields
    const candidateSkills = this.extractSkills(candidate);
    const requiredSkills = this.extractRequiredSkills(job);
    const preferredSkills = this.extractPreferredSkills(job);
    const candidateYears = this.extractExperience(candidate);
    const requiredYears = this.extractRequiredExperience(job);
    const candidateEducation = this.extractEducation(candidate);
    const requiredEducation = this.extractRequiredEducation(job);
    const requiredField = this.extractRequiredField(job);

    // Calculate individual scores
    const skillMatch = this.skillMatchingService.calculateSkillMatch(
      candidateSkills,
      requiredSkills,
      preferredSkills,
    );

    // Map SeniorityLevel to ExperienceLevel if needed
    const experienceLevel = job.seniorityLevel ? this.mapSeniorityToExperience(job.seniorityLevel) : undefined;

    const experienceMatch = this.experienceMatchingService.calculateExperienceMatch(
      candidateYears,
      requiredYears,
      experienceLevel,
    );

    const educationMatch = this.educationMatchingService.calculateEducationMatch(
      candidateEducation,
      requiredEducation,
      requiredField,
    );

    const candidateLocation: Location = {
      city: candidate.locationCity,
      state: candidate.locationState,
      country: candidate.locationCountry,
    };

    const jobLocations: Location[] = job.locations?.map(loc => ({
      city: loc.city,
      state: loc.state,
      country: loc.country,
    })) || [];

    const locationMatch = this.locationMatchingService.calculateLocationMatch(
      candidateLocation,
      jobLocations,
      job.remoteOk,
    );

    const titleMatch = this.titleMatchingService.calculateTitleMatch(
      candidate.currentTitle || '',
      job.title,
    );

    // Calculate weighted overall score
    const overall = Math.round(
      skillMatch.score * weights.skills +
      experienceMatch.score * weights.experience +
      educationMatch.score * weights.education +
      locationMatch.score * weights.location +
      titleMatch.score * weights.title,
    );

    // Generate match reasons
    const matchReasons = this.generateMatchReasons({
      skills: skillMatch,
      experience: experienceMatch,
      education: educationMatch,
      location: locationMatch,
      title: titleMatch,
    });

    return {
      overall,
      breakdown: {
        skills: skillMatch,
        experience: experienceMatch,
        education: educationMatch,
        location: locationMatch,
        title: titleMatch,
      },
      skillGaps: skillMatch.missingRequired,
      matchReasons,
      weights,
    };
  }

  /**
   * Calculate match scores for multiple candidates against a job
   */
  async calculateMatchesForJob(
    jobId: string,
    candidateIds?: string[],
    customWeights?: Partial<MatchWeights>,
  ): Promise<CandidateMatchResult[]> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['locations'],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    let candidates: Candidate[];

    if (candidateIds && candidateIds.length > 0) {
      candidates = await this.candidateRepository.findByIds(candidateIds);
    } else {
      // Get all candidates with applications for this job
      const applications = await this.applicationRepository.find({
        where: { jobId },
        relations: ['candidate'],
      });
      candidates = applications.map(app => app.candidate);
    }

    const results: CandidateMatchResult[] = [];

    for (const candidate of candidates) {
      const matchScore = this.calculateMatchFromEntities(candidate, job, customWeights);
      results.push({
        candidateId: candidate.id,
        jobId: job.id,
        matchScore,
        candidate,
        job,
      });
    }

    // Sort by overall score descending
    results.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

    return results;
  }

  /**
   * Update application with match score
   */
  async updateApplicationMatchScore(applicationId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'job', 'job.locations'],
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const matchScore = this.calculateMatchFromEntities(
      application.candidate,
      application.job,
    );

    // Store match score in custom fields
    application.customFields = {
      ...application.customFields,
      matchScore: matchScore.overall,
      matchBreakdown: {
        skills: matchScore.breakdown.skills.score,
        experience: matchScore.breakdown.experience.score,
        education: matchScore.breakdown.education.score,
        location: matchScore.breakdown.location.score,
        title: matchScore.breakdown.title.score,
      },
      skillGaps: matchScore.skillGaps,
      matchReasons: matchScore.matchReasons,
      lastMatchCalculated: new Date().toISOString(),
    };

    await this.applicationRepository.save(application);
  }

  /**
   * Generate human-readable match reasons
   */
  private generateMatchReasons(breakdown: MatchBreakdown): string[] {
    const reasons: string[] = [];

    // Skills
    if (breakdown.skills.score >= 80) {
      reasons.push(`Strong skill match with ${breakdown.skills.matches.length} matching skills`);
    } else if (breakdown.skills.score >= 60) {
      reasons.push(`Good skill match with some gaps`);
    } else if (breakdown.skills.missingRequired.length > 0) {
      reasons.push(`Missing ${breakdown.skills.missingRequired.length} required skills`);
    }

    // Experience
    if (breakdown.experience.meetsRequirement) {
      if (breakdown.experience.candidateYears > breakdown.experience.requiredYears * 1.5) {
        reasons.push(`Highly experienced (${breakdown.experience.candidateYears} years)`);
      } else {
        reasons.push(`Meets experience requirement (${breakdown.experience.candidateYears} years)`);
      }
    } else {
      reasons.push(`Below experience requirement (${breakdown.experience.candidateYears} vs ${breakdown.experience.requiredYears} years)`);
    }

    // Education
    if (breakdown.education.meetsRequirement) {
      reasons.push(`Meets education requirement (${breakdown.education.candidateLevel})`);
      if (breakdown.education.fieldMatch) {
        reasons.push(`Relevant field of study`);
      }
    } else {
      reasons.push(`Below education requirement`);
    }

    // Location
    if (breakdown.location.matchType === 'exact') {
      reasons.push(`Located in job location`);
    } else if (breakdown.location.matchType === 'remote') {
      reasons.push(`Remote position - location flexible`);
    } else if (breakdown.location.matchType === 'no_match') {
      reasons.push(`Relocation required`);
    }

    // Title
    if (breakdown.title.matchType === 'exact' || breakdown.title.matchType === 'similar') {
      reasons.push(`Similar role experience`);
    }

    return reasons;
  }

  // Helper methods to extract data from custom fields

  private extractSkills(candidate: Candidate): string[] {
    return candidate.customFields?.skills || candidate.tags || [];
  }

  private extractRequiredSkills(job: Job): string[] {
    return []; // job.customFields?.requiredSkills || [];
  }

  private extractPreferredSkills(job: Job): string[] {
    return []; // job.customFields?.preferredSkills || [];
  }

  private extractExperience(candidate: Candidate): number {
    if (candidate.customFields?.yearsOfExperience) {
      return candidate.customFields.yearsOfExperience;
    }

    // Try to calculate from work history
    if (candidate.customFields?.workHistory) {
      return this.experienceMatchingService.calculateTotalExperience(
        candidate.customFields.workHistory,
      );
    }

    return 0;
  }

  private extractRequiredExperience(job: Job): number {
    return 0; // job.customFields?.requiredYearsOfExperience || 0;
  }

  private extractEducation(candidate: Candidate): Education[] {
    return candidate.customFields?.education || [];
  }

  private extractRequiredEducation(job: Job): any {
    return 'bachelor'; // job.customFields?.requiredEducation || 'bachelor';
  }

  private extractRequiredField(job: Job): string | undefined {
    return undefined; // job.customFields?.requiredField;
  }

  /**
   * Map Job SeniorityLevel to Experience ExperienceLevel
   */
  private mapSeniorityToExperience(seniorityLevel: any): any {
    // Import the enums at runtime to avoid circular dependencies
    const mapping: Record<string, string> = {
      'entry': 'entry',
      'junior': 'junior',
      'mid': 'mid',
      'senior': 'senior',
      'lead': 'lead',
      'principal': 'principal',
      'executive': 'executive',
    };
    return mapping[seniorityLevel] || seniorityLevel;
  }
}
