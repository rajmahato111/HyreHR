import { Injectable } from '@nestjs/common';

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  ASSOCIATE = 'associate',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
}

export interface Education {
  level: EducationLevel;
  field?: string;
  institution?: string;
  graduationYear?: number;
}

export interface EducationMatchResult {
  score: number; // 0-100
  candidateLevel: EducationLevel;
  requiredLevel: EducationLevel;
  meetsRequirement: boolean;
  fieldMatch: boolean;
  explanation: string;
}

@Injectable()
export class EducationMatchingService {
  /**
   * Calculate education match score
   * 
   * Scoring:
   * - Exact level match: 100 points
   * - Higher level: 100 points (overqualified is good)
   * - One level below: 70 points
   * - Two levels below: 40 points
   * - More than two levels below: 20 points
   * - Field match bonus: +10 points (if applicable)
   */
  calculateEducationMatch(
    candidateEducation: Education[],
    requiredLevel: EducationLevel,
    requiredField?: string,
  ): EducationMatchResult {
    if (!candidateEducation || candidateEducation.length === 0) {
      return {
        score: 0,
        candidateLevel: EducationLevel.HIGH_SCHOOL,
        requiredLevel,
        meetsRequirement: false,
        fieldMatch: false,
        explanation: 'No education information provided.',
      };
    }

    // Find highest education level
    const highestEducation = this.getHighestEducation(candidateEducation);
    const levelDiff = this.getLevelDifference(highestEducation.level, requiredLevel);

    let score = 0;
    let meetsRequirement = false;
    let fieldMatch = false;
    let explanation = '';

    // Calculate base score from level match
    if (levelDiff >= 0) {
      // Meets or exceeds requirement
      score = 100;
      meetsRequirement = true;
      if (levelDiff === 0) {
        explanation = `Candidate has ${this.levelToString(highestEducation.level)}, matching the requirement.`;
      } else {
        explanation = `Candidate has ${this.levelToString(highestEducation.level)}, exceeding the ${this.levelToString(requiredLevel)} requirement.`;
      }
    } else if (levelDiff === -1) {
      score = 70;
      meetsRequirement = false;
      explanation = `Candidate has ${this.levelToString(highestEducation.level)}, one level below the ${this.levelToString(requiredLevel)} requirement.`;
    } else if (levelDiff === -2) {
      score = 40;
      meetsRequirement = false;
      explanation = `Candidate has ${this.levelToString(highestEducation.level)}, two levels below the ${this.levelToString(requiredLevel)} requirement.`;
    } else {
      score = 20;
      meetsRequirement = false;
      explanation = `Candidate has ${this.levelToString(highestEducation.level)}, significantly below the ${this.levelToString(requiredLevel)} requirement.`;
    }

    // Check field match if required field is specified
    if (requiredField && highestEducation.field) {
      fieldMatch = this.isFieldMatch(highestEducation.field, requiredField);
      if (fieldMatch) {
        score = Math.min(100, score + 10);
        explanation += ` Field of study matches (${highestEducation.field}).`;
      } else {
        explanation += ` Field of study (${highestEducation.field}) differs from required (${requiredField}).`;
      }
    }

    return {
      score,
      candidateLevel: highestEducation.level,
      requiredLevel,
      meetsRequirement,
      fieldMatch,
      explanation,
    };
  }

  /**
   * Get the highest education level from a list
   */
  private getHighestEducation(educations: Education[]): Education {
    const levels = [
      EducationLevel.HIGH_SCHOOL,
      EducationLevel.ASSOCIATE,
      EducationLevel.BACHELOR,
      EducationLevel.MASTER,
      EducationLevel.DOCTORATE,
    ];

    let highest = educations[0];
    let highestIndex = levels.indexOf(highest.level);

    for (const edu of educations) {
      const index = levels.indexOf(edu.level);
      if (index > highestIndex) {
        highest = edu;
        highestIndex = index;
      }
    }

    return highest;
  }

  /**
   * Get numeric difference between education levels
   * Positive means candidate has higher education
   * Negative means candidate has lower education
   */
  private getLevelDifference(
    candidateLevel: EducationLevel,
    requiredLevel: EducationLevel,
  ): number {
    const levels = [
      EducationLevel.HIGH_SCHOOL,
      EducationLevel.ASSOCIATE,
      EducationLevel.BACHELOR,
      EducationLevel.MASTER,
      EducationLevel.DOCTORATE,
    ];

    const candidateIndex = levels.indexOf(candidateLevel);
    const requiredIndex = levels.indexOf(requiredLevel);

    return candidateIndex - requiredIndex;
  }

  /**
   * Check if education fields match
   */
  private isFieldMatch(candidateField: string, requiredField: string): boolean {
    const normalize = (field: string) => field.toLowerCase().trim();
    const candidate = normalize(candidateField);
    const required = normalize(requiredField);

    // Exact match
    if (candidate === required) return true;

    // Related fields mapping
    const relatedFields: Record<string, string[]> = {
      'computer science': ['software engineering', 'information technology', 'computer engineering', 'cs'],
      'software engineering': ['computer science', 'information technology', 'computer engineering'],
      'information technology': ['computer science', 'software engineering', 'information systems'],
      'electrical engineering': ['computer engineering', 'electronics engineering'],
      'business administration': ['business management', 'management', 'mba'],
      'mathematics': ['applied mathematics', 'statistics', 'data science'],
      'data science': ['statistics', 'mathematics', 'computer science'],
      'mechanical engineering': ['engineering', 'industrial engineering'],
    };

    // Check if fields are related
    for (const [key, related] of Object.entries(relatedFields)) {
      if (candidate.includes(key) && related.some(r => required.includes(r))) {
        return true;
      }
      if (required.includes(key) && related.some(r => candidate.includes(r))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert education level enum to readable string
   */
  private levelToString(level: EducationLevel): string {
    const mapping: Record<EducationLevel, string> = {
      [EducationLevel.HIGH_SCHOOL]: 'High School Diploma',
      [EducationLevel.ASSOCIATE]: "Associate's Degree",
      [EducationLevel.BACHELOR]: "Bachelor's Degree",
      [EducationLevel.MASTER]: "Master's Degree",
      [EducationLevel.DOCTORATE]: 'Doctorate/PhD',
    };
    return mapping[level];
  }
}
