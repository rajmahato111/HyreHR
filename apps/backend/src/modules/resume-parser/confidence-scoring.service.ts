import { Injectable, Logger } from '@nestjs/common';
import { ParsedResumeDto } from './dto';

@Injectable()
export class ConfidenceScoringService {
  private readonly logger = new Logger(ConfidenceScoringService.name);

  // Thresholds for manual review
  private readonly MANUAL_REVIEW_THRESHOLD = 0.6;
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.3;

  /**
   * Calculate confidence scores for parsed resume data
   */
  calculateConfidence(parsedData: Partial<ParsedResumeDto>): ParsedResumeDto['confidence'] {
    const personalInfoScore = this.scorePersonalInfo(parsedData.personalInfo);
    const workExperienceScore = this.scoreWorkExperience(parsedData.workExperience);
    const educationScore = this.scoreEducation(parsedData.education);
    const skillsScore = this.scoreSkills(parsedData.skills);

    // Weighted average for overall score
    const weights = {
      personalInfo: 0.3,
      workExperience: 0.35,
      education: 0.2,
      skills: 0.15,
    };

    const overall = 
      personalInfoScore * weights.personalInfo +
      workExperienceScore * weights.workExperience +
      educationScore * weights.education +
      skillsScore * weights.skills;

    this.logger.log(`Confidence scores - Overall: ${overall.toFixed(2)}, Personal: ${personalInfoScore.toFixed(2)}, Experience: ${workExperienceScore.toFixed(2)}, Education: ${educationScore.toFixed(2)}, Skills: ${skillsScore.toFixed(2)}`);

    return {
      overall: Math.round(overall * 100) / 100,
      personalInfo: Math.round(personalInfoScore * 100) / 100,
      workExperience: Math.round(workExperienceScore * 100) / 100,
      education: Math.round(educationScore * 100) / 100,
      skills: Math.round(skillsScore * 100) / 100,
    };
  }

  /**
   * Determine if manual review is needed
   */
  needsManualReview(confidence: ParsedResumeDto['confidence']): boolean {
    // Flag for manual review if overall confidence is low
    if (confidence.overall < this.MANUAL_REVIEW_THRESHOLD) {
      this.logger.warn(`Low confidence score (${confidence.overall}), flagging for manual review`);
      return true;
    }

    // Flag if any critical section has very low confidence
    if (
      confidence.personalInfo < this.MIN_CONFIDENCE_THRESHOLD ||
      confidence.workExperience < this.MIN_CONFIDENCE_THRESHOLD
    ) {
      this.logger.warn('Critical section has very low confidence, flagging for manual review');
      return true;
    }

    return false;
  }

  /**
   * Score personal information completeness and quality
   */
  private scorePersonalInfo(personalInfo?: ParsedResumeDto['personalInfo']): number {
    if (!personalInfo) return 0;

    let score = 0;
    let maxScore = 0;

    // Email (critical) - 30 points
    maxScore += 30;
    if (personalInfo.email) {
      score += 30;
      // Bonus for valid email format
      if (this.isValidEmail(personalInfo.email)) {
        score += 5;
        maxScore += 5;
      }
    }

    // Name (critical) - 30 points
    maxScore += 30;
    if (personalInfo.firstName && personalInfo.lastName) {
      score += 30;
    } else if (personalInfo.firstName || personalInfo.lastName) {
      score += 15;
    }

    // Phone (important) - 20 points
    maxScore += 20;
    if (personalInfo.phone) {
      score += 20;
    }

    // Location (helpful) - 10 points
    maxScore += 10;
    if (personalInfo.location?.city || personalInfo.location?.state) {
      score += 10;
    }

    // LinkedIn (helpful) - 10 points
    maxScore += 10;
    if (personalInfo.linkedinUrl) {
      score += 10;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Score work experience completeness and quality
   */
  private scoreWorkExperience(workExperience?: ParsedResumeDto['workExperience']): number {
    if (!workExperience || workExperience.length === 0) {
      return 0.3; // Some candidates may be entry-level
    }

    let totalScore = 0;
    let count = 0;

    for (const exp of workExperience) {
      let expScore = 0;
      let maxExpScore = 0;

      // Company name (critical) - 30 points
      maxExpScore += 30;
      if (exp.company && exp.company !== 'Unknown') {
        expScore += 30;
      }

      // Title (critical) - 30 points
      maxExpScore += 30;
      if (exp.title && exp.title !== 'Unknown') {
        expScore += 30;
      }

      // Dates (important) - 25 points
      maxExpScore += 25;
      if (exp.startDate) {
        expScore += 15;
      }
      if (exp.endDate || exp.current) {
        expScore += 10;
      }

      // Description (helpful) - 15 points
      maxExpScore += 15;
      if (exp.description && exp.description.length > 50) {
        expScore += 15;
      } else if (exp.description) {
        expScore += 7;
      }

      totalScore += maxExpScore > 0 ? expScore / maxExpScore : 0;
      count++;
    }

    // Average score across all experiences
    const avgScore = count > 0 ? totalScore / count : 0;

    // Bonus for having multiple experiences
    const experienceBonus = Math.min(workExperience.length * 0.05, 0.15);

    return Math.min(avgScore + experienceBonus, 1.0);
  }

  /**
   * Score education completeness and quality
   */
  private scoreEducation(education?: ParsedResumeDto['education']): number {
    if (!education || education.length === 0) {
      return 0.5; // Not all positions require formal education
    }

    let totalScore = 0;
    let count = 0;

    for (const edu of education) {
      let eduScore = 0;
      let maxEduScore = 0;

      // Institution (critical) - 40 points
      maxEduScore += 40;
      if (edu.institution) {
        eduScore += 40;
      }

      // Degree (important) - 30 points
      maxEduScore += 30;
      if (edu.degree) {
        eduScore += 30;
      }

      // Field of study (important) - 20 points
      maxEduScore += 20;
      if (edu.field) {
        eduScore += 20;
      }

      // Dates (helpful) - 10 points
      maxEduScore += 10;
      if (edu.startDate || edu.endDate) {
        eduScore += 10;
      }

      totalScore += maxEduScore > 0 ? eduScore / maxEduScore : 0;
      count++;
    }

    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Score skills extraction quality
   */
  private scoreSkills(skills?: string[]): number {
    if (!skills || skills.length === 0) {
      return 0.2; // Low but not zero - some resumes may not have explicit skills section
    }

    // Score based on number of skills found
    // 1-3 skills: low confidence
    // 4-8 skills: medium confidence
    // 9+ skills: high confidence

    if (skills.length >= 9) {
      return 1.0;
    } else if (skills.length >= 4) {
      return 0.6 + (skills.length - 4) * 0.08;
    } else {
      return 0.2 + skills.length * 0.13;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate quality report for parsed resume
   */
  generateQualityReport(
    parsedData: Partial<ParsedResumeDto>,
    confidence: ParsedResumeDto['confidence']
  ): {
    issues: string[];
    suggestions: string[];
    strengths: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const strengths: string[] = [];

    // Check personal info
    if (!parsedData.personalInfo?.email) {
      issues.push('Email address not found');
      suggestions.push('Verify email address is present in the resume');
    } else {
      strengths.push('Email address extracted successfully');
    }

    if (!parsedData.personalInfo?.firstName || !parsedData.personalInfo?.lastName) {
      issues.push('Full name not clearly identified');
      suggestions.push('Ensure name is prominently displayed at the top of resume');
    } else {
      strengths.push('Full name extracted successfully');
    }

    if (!parsedData.personalInfo?.phone) {
      suggestions.push('Phone number not found - consider adding if available');
    }

    // Check work experience
    if (!parsedData.workExperience || parsedData.workExperience.length === 0) {
      issues.push('No work experience found');
      suggestions.push('Verify work experience section is present and properly formatted');
    } else {
      strengths.push(`${parsedData.workExperience.length} work experience entries found`);
      
      const incompleteExperiences = parsedData.workExperience.filter(
        exp => !exp.startDate || (!exp.endDate && !exp.current)
      );
      
      if (incompleteExperiences.length > 0) {
        suggestions.push(`${incompleteExperiences.length} work experiences missing dates`);
      }
    }

    // Check education
    if (!parsedData.education || parsedData.education.length === 0) {
      suggestions.push('No education information found');
    } else {
      strengths.push(`${parsedData.education.length} education entries found`);
    }

    // Check skills
    if (!parsedData.skills || parsedData.skills.length === 0) {
      issues.push('No skills identified');
      suggestions.push('Add a skills section or mention technologies used in experience descriptions');
    } else if (parsedData.skills.length < 5) {
      suggestions.push('Limited skills found - consider adding more technical skills');
    } else {
      strengths.push(`${parsedData.skills.length} skills identified`);
    }

    // Overall confidence assessment
    if (confidence.overall < 0.5) {
      issues.push('Overall parsing confidence is low');
      suggestions.push('Manual review recommended to verify extracted data');
    }

    return { issues, suggestions, strengths };
  }
}
