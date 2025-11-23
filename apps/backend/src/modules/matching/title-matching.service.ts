import { Injectable } from '@nestjs/common';

export interface TitleMatchResult {
  score: number; // 0-100
  candidateTitle: string;
  jobTitle: string;
  matchType: 'exact' | 'similar' | 'related' | 'different';
  explanation: string;
}

@Injectable()
export class TitleMatchingService {
  private titleSynonyms: Map<string, string[]>;
  private seniorityKeywords: Map<string, number>;

  constructor() {
    this.initializeTitleSynonyms();
    this.initializeSeniorityKeywords();
  }

  /**
   * Calculate title similarity score
   * 
   * Scoring:
   * - Exact match: 100 points
   * - Synonym match: 90 points
   * - Same role, different seniority: 70-85 points
   * - Related role: 60 points
   * - Different role: 30 points
   */
  calculateTitleMatch(candidateTitle: string, jobTitle: string): TitleMatchResult {
    const normalizedCandidate = this.normalize(candidateTitle);
    const normalizedJob = this.normalize(jobTitle);

    // Exact match
    if (normalizedCandidate === normalizedJob) {
      return {
        score: 100,
        candidateTitle,
        jobTitle,
        matchType: 'exact',
        explanation: 'Candidate title exactly matches the job title.',
      };
    }

    // Extract role and seniority
    const candidateRole = this.extractRole(normalizedCandidate);
    const jobRole = this.extractRole(normalizedJob);
    const candidateSeniority = this.extractSeniority(normalizedCandidate);
    const jobSeniority = this.extractSeniority(normalizedJob);

    // Check for synonym match
    if (this.areSynonyms(candidateRole, jobRole)) {
      const seniorityDiff = Math.abs(candidateSeniority - jobSeniority);
      let score = 90;
      let matchType: 'similar' | 'related' = 'similar';

      if (seniorityDiff === 0) {
        score = 90;
        matchType = 'similar';
      } else if (seniorityDiff === 1) {
        score = 85;
        matchType = 'similar';
      } else if (seniorityDiff === 2) {
        score = 75;
        matchType = 'similar';
      } else {
        score = 70;
        matchType = 'related';
      }

      return {
        score,
        candidateTitle,
        jobTitle,
        matchType,
        explanation: `Candidate title (${candidateTitle}) is similar to job title (${jobTitle}).`,
      };
    }

    // Check for related roles
    if (this.areRelated(candidateRole, jobRole)) {
      return {
        score: 60,
        candidateTitle,
        jobTitle,
        matchType: 'related',
        explanation: `Candidate title (${candidateTitle}) is related to job title (${jobTitle}).`,
      };
    }

    // Different roles
    return {
      score: 30,
      candidateTitle,
      jobTitle,
      matchType: 'different',
      explanation: `Candidate title (${candidateTitle}) differs from job title (${jobTitle}).`,
    };
  }

  /**
   * Initialize title synonyms
   */
  private initializeTitleSynonyms(): void {
    this.titleSynonyms = new Map([
      ['software engineer', ['software developer', 'programmer', 'developer', 'engineer']],
      ['frontend developer', ['frontend engineer', 'front end developer', 'ui developer']],
      ['backend developer', ['backend engineer', 'back end developer', 'server developer']],
      ['fullstack developer', ['full stack developer', 'fullstack engineer', 'full stack engineer']],
      ['devops engineer', ['devops', 'site reliability engineer', 'sre', 'platform engineer']],
      ['data scientist', ['data analyst', 'ml engineer', 'machine learning engineer']],
      ['product manager', ['pm', 'product owner', 'product lead']],
      ['engineering manager', ['engineering lead', 'development manager', 'tech lead manager']],
      ['qa engineer', ['quality assurance engineer', 'test engineer', 'sdet', 'qa']],
      ['ui designer', ['user interface designer', 'visual designer', 'product designer']],
      ['ux designer', ['user experience designer', 'ux researcher', 'interaction designer']],
      ['technical writer', ['documentation engineer', 'content developer', 'technical author']],
      ['recruiter', ['technical recruiter', 'talent acquisition specialist', 'hiring manager']],
    ]);
  }

  /**
   * Initialize seniority keywords and their weights
   */
  private initializeSeniorityKeywords(): void {
    this.seniorityKeywords = new Map([
      ['intern', 0],
      ['junior', 1],
      ['associate', 1],
      ['mid', 2],
      ['intermediate', 2],
      ['senior', 3],
      ['sr', 3],
      ['lead', 4],
      ['principal', 5],
      ['staff', 5],
      ['architect', 5],
      ['director', 6],
      ['vp', 7],
      ['vice president', 7],
      ['chief', 8],
      ['cto', 8],
      ['ceo', 8],
    ]);
  }

  /**
   * Normalize title for comparison
   */
  private normalize(title: string): string {
    return title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  }

  /**
   * Extract role from title (remove seniority keywords)
   */
  private extractRole(normalizedTitle: string): string {
    let role = normalizedTitle;
    
    for (const keyword of this.seniorityKeywords.keys()) {
      role = role.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '').trim();
    }
    
    return role.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract seniority level from title
   */
  private extractSeniority(normalizedTitle: string): number {
    let maxSeniority = 2; // Default to mid-level
    
    for (const [keyword, level] of this.seniorityKeywords.entries()) {
      if (normalizedTitle.includes(keyword)) {
        maxSeniority = Math.max(maxSeniority, level);
      }
    }
    
    return maxSeniority;
  }

  /**
   * Check if two roles are synonyms
   */
  private areSynonyms(role1: string, role2: string): boolean {
    // Direct match
    if (role1 === role2) return true;

    // Check in synonym map
    for (const [canonical, synonyms] of this.titleSynonyms.entries()) {
      const allVariants = [canonical, ...synonyms];
      const hasRole1 = allVariants.some(v => role1.includes(v) || v.includes(role1));
      const hasRole2 = allVariants.some(v => role2.includes(v) || v.includes(role2));
      
      if (hasRole1 && hasRole2) return true;
    }

    return false;
  }

  /**
   * Check if two roles are related
   */
  private areRelated(role1: string, role2: string): boolean {
    const relatedRoles: Record<string, string[]> = {
      'software engineer': ['frontend developer', 'backend developer', 'fullstack developer', 'devops engineer'],
      'frontend developer': ['software engineer', 'fullstack developer', 'ui designer'],
      'backend developer': ['software engineer', 'fullstack developer', 'devops engineer'],
      'fullstack developer': ['software engineer', 'frontend developer', 'backend developer'],
      'devops engineer': ['software engineer', 'backend developer', 'platform engineer'],
      'data scientist': ['data engineer', 'ml engineer', 'data analyst'],
      'product manager': ['project manager', 'program manager', 'product owner'],
      'ui designer': ['ux designer', 'product designer', 'graphic designer'],
      'ux designer': ['ui designer', 'product designer', 'ux researcher'],
    };

    for (const [key, related] of Object.entries(relatedRoles)) {
      if (role1.includes(key) && related.some(r => role2.includes(r))) {
        return true;
      }
      if (role2.includes(key) && related.some(r => role1.includes(r))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get suggested titles based on a given title
   */
  getSuggestedTitles(title: string, limit: number = 5): string[] {
    const normalized = this.normalize(title);
    const role = this.extractRole(normalized);
    const suggestions = new Set<string>();

    // Find synonyms
    for (const [canonical, synonyms] of this.titleSynonyms.entries()) {
      if (role.includes(canonical) || synonyms.some(s => role.includes(s))) {
        suggestions.add(canonical);
        synonyms.forEach(s => suggestions.add(s));
      }
    }

    // Remove the original title
    suggestions.delete(role);

    return Array.from(suggestions).slice(0, limit);
  }
}
