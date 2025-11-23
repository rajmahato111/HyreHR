import { Injectable } from '@nestjs/common';
import { SkillTaxonomy } from './skill-taxonomy';

export enum SkillMatchType {
  EXACT = 'exact',
  SYNONYM = 'synonym',
  RELATED = 'related',
  NONE = 'none',
}

export interface SkillMatch {
  candidateSkill: string;
  requiredSkill: string;
  matchType: SkillMatchType;
  score: number;
}

export interface SkillMatchResult {
  score: number; // 0-100
  matches: SkillMatch[];
  missingRequired: string[];
  matchedPreferred: string[];
  totalRequired: number;
  totalPreferred: number;
}

@Injectable()
export class SkillMatchingService {
  private taxonomy: SkillTaxonomy;

  constructor() {
    this.taxonomy = new SkillTaxonomy();
  }

  /**
   * Calculate skill match score between candidate skills and job requirements
   * 
   * Scoring:
   * - Exact match: 100 points per required skill
   * - Synonym match: 90 points per required skill
   * - Related skill: 70 points per required skill
   * - Missing required skill: 0 points
   * - Matched preferred skill: +10 points bonus
   */
  calculateSkillMatch(
    candidateSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[] = [],
  ): SkillMatchResult {
    const matches: SkillMatch[] = [];
    const missingRequired: string[] = [];
    const matchedPreferred: string[] = [];

    let score = 0;
    const maxScore = requiredSkills.length * 100 + preferredSkills.length * 10;

    // Normalize candidate skills
    const normalizedCandidateSkills = candidateSkills.map(skill => 
      this.taxonomy.findCanonical(skill) || skill
    );

    // Match required skills
    for (const requiredSkill of requiredSkills) {
      const match = this.findBestSkillMatch(
        requiredSkill,
        candidateSkills,
        normalizedCandidateSkills,
      );

      if (match) {
        matches.push(match);
        score += match.score;
      } else {
        missingRequired.push(requiredSkill);
      }
    }

    // Match preferred skills (bonus points)
    for (const preferredSkill of preferredSkills) {
      const match = this.findBestSkillMatch(
        preferredSkill,
        candidateSkills,
        normalizedCandidateSkills,
      );

      if (match) {
        matchedPreferred.push(preferredSkill);
        score += 10;
      }
    }

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score: finalScore,
      matches,
      missingRequired,
      matchedPreferred,
      totalRequired: requiredSkills.length,
      totalPreferred: preferredSkills.length,
    };
  }

  /**
   * Find the best matching candidate skill for a required skill
   */
  private findBestSkillMatch(
    requiredSkill: string,
    candidateSkills: string[],
    normalizedCandidateSkills: string[],
  ): SkillMatch | null {
    const requiredCanonical = this.taxonomy.findCanonical(requiredSkill);

    // Try exact match first
    for (let i = 0; i < candidateSkills.length; i++) {
      const candidateSkill = candidateSkills[i];
      const candidateCanonical = normalizedCandidateSkills[i];

      // Exact match (case-insensitive)
      if (
        candidateSkill.toLowerCase() === requiredSkill.toLowerCase() ||
        (requiredCanonical && candidateCanonical === requiredCanonical)
      ) {
        return {
          candidateSkill,
          requiredSkill,
          matchType: SkillMatchType.EXACT,
          score: 100,
        };
      }
    }

    // Try synonym match
    if (requiredCanonical) {
      for (let i = 0; i < candidateSkills.length; i++) {
        const candidateSkill = candidateSkills[i];
        const candidateCanonical = normalizedCandidateSkills[i];

        if (candidateCanonical === requiredCanonical) {
          return {
            candidateSkill,
            requiredSkill,
            matchType: SkillMatchType.SYNONYM,
            score: 90,
          };
        }
      }
    }

    // Try related skill match
    if (requiredCanonical) {
      for (let i = 0; i < candidateSkills.length; i++) {
        const candidateSkill = candidateSkills[i];
        const candidateCanonical = normalizedCandidateSkills[i];

        if (
          candidateCanonical &&
          this.taxonomy.isRelated(requiredCanonical, candidateCanonical)
        ) {
          return {
            candidateSkill,
            requiredSkill,
            matchType: SkillMatchType.RELATED,
            score: 70,
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract skills from text (for resume parsing integration)
   */
  extractSkills(text: string): string[] {
    const skills: Set<string> = new Set();
    const words = text.split(/\s+/);

    // Check single words and bigrams
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const canonical = this.taxonomy.findCanonical(word);
      if (canonical) {
        skills.add(canonical);
      }

      // Check bigrams
      if (i < words.length - 1) {
        const bigram = `${word} ${words[i + 1]}`;
        const bigramCanonical = this.taxonomy.findCanonical(bigram);
        if (bigramCanonical) {
          skills.add(bigramCanonical);
        }
      }

      // Check trigrams
      if (i < words.length - 2) {
        const trigram = `${word} ${words[i + 1]} ${words[i + 2]}`;
        const trigramCanonical = this.taxonomy.findCanonical(trigram);
        if (trigramCanonical) {
          skills.add(trigramCanonical);
        }
      }
    }

    return Array.from(skills);
  }

  /**
   * Get skill suggestions based on existing skills
   */
  getSuggestedSkills(skills: string[], limit: number = 5): string[] {
    const suggestions = new Set<string>();

    for (const skill of skills) {
      const canonical = this.taxonomy.findCanonical(skill);
      if (canonical) {
        const node = this.taxonomy.getSkill(canonical);
        if (node) {
          for (const related of node.related) {
            if (!skills.includes(related)) {
              suggestions.add(related);
            }
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Normalize a list of skills to canonical forms
   */
  normalizeSkills(skills: string[]): string[] {
    const normalized = new Set<string>();

    for (const skill of skills) {
      const canonical = this.taxonomy.findCanonical(skill);
      if (canonical) {
        normalized.add(canonical);
      } else {
        // Keep original if not in taxonomy
        normalized.add(skill);
      }
    }

    return Array.from(normalized);
  }
}
