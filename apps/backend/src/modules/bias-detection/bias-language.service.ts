import { Injectable } from '@nestjs/common';
import { BiasedTermDto } from './dto/bias-alert.dto';

interface BiasedPattern {
  pattern: RegExp;
  category: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

@Injectable()
export class BiasLanguageService {
  private biasedPatterns: BiasedPattern[] = [
    // Age bias
    {
      pattern: /\b(young|old|elderly|senior|mature|junior|seasoned|fresh|new grad)\b/gi,
      category: 'age',
      suggestion: 'Focus on skills and experience rather than age-related terms',
      severity: 'high',
    },
    // Gender bias
    {
      pattern: /\b(he|she|him|her|his|hers|guys|girls|ladies|gentlemen)\b/gi,
      category: 'gender',
      suggestion: 'Use gender-neutral pronouns (they/them) or refer to the candidate by name',
      severity: 'high',
    },
    {
      pattern: /\b(aggressive|assertive|bossy|emotional|nurturing|motherly|fatherly)\b/gi,
      category: 'gender_stereotype',
      suggestion: 'Use objective, behavior-based descriptions',
      severity: 'medium',
    },
    // Cultural/ethnic bias
    {
      pattern: /\b(articulate|well-spoken|exotic|foreign|native|ethnic)\b/gi,
      category: 'cultural',
      suggestion: 'Avoid terms that may carry cultural assumptions',
      severity: 'high',
    },
    // Appearance bias
    {
      pattern: /\b(attractive|unattractive|professional appearance|well-groomed|presentable)\b/gi,
      category: 'appearance',
      suggestion: 'Focus on qualifications and performance, not appearance',
      severity: 'medium',
    },
    // Family status bias
    {
      pattern: /\b(married|single|children|kids|family|pregnant|maternity|paternity)\b/gi,
      category: 'family_status',
      suggestion: 'Avoid references to family or marital status',
      severity: 'high',
    },
    // Disability bias
    {
      pattern: /\b(handicapped|disabled|crippled|wheelchair-bound|suffers from|victim of)\b/gi,
      category: 'disability',
      suggestion: 'Use person-first language and focus on abilities',
      severity: 'high',
    },
    // Personality bias (subjective)
    {
      pattern: /\b(culture fit|not a fit|doesn't fit|personality|likeable|friendly|nice)\b/gi,
      category: 'subjective',
      suggestion: 'Use specific, job-related criteria instead of vague personality assessments',
      severity: 'medium',
    },
    // Educational bias
    {
      pattern: /\b(ivy league|prestigious|elite school|top-tier)\b/gi,
      category: 'educational',
      suggestion: 'Focus on skills and knowledge rather than institution prestige',
      severity: 'low',
    },
  ];

  /**
   * Analyze text for biased language
   */
  async analyzeBiasedLanguage(text: string): Promise<BiasedTermDto[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const detectedTerms: BiasedTermDto[] = [];
    const lowerText = text.toLowerCase();

    for (const pattern of this.biasedPatterns) {
      const matches = text.match(pattern.pattern);
      
      if (matches && matches.length > 0) {
        // Get unique matches
        const uniqueMatches = [...new Set(matches)];
        
        for (const match of uniqueMatches) {
          // Find context (surrounding words)
          const matchIndex = lowerText.indexOf(match.toLowerCase());
          const contextStart = Math.max(0, matchIndex - 30);
          const contextEnd = Math.min(text.length, matchIndex + match.length + 30);
          const context = text.substring(contextStart, contextEnd).trim();

          detectedTerms.push({
            term: match,
            category: pattern.category,
            context: `...${context}...`,
            suggestion: pattern.suggestion,
          });
        }
      }
    }

    return detectedTerms;
  }

  /**
   * Calculate bias score based on detected terms
   */
  calculateBiasScore(biasedTerms: BiasedTermDto[]): number {
    if (biasedTerms.length === 0) return 0;

    const severityWeights = {
      low: 1,
      medium: 2,
      high: 3,
    };

    let totalScore = 0;
    for (const term of biasedTerms) {
      const pattern = this.biasedPatterns.find(
        (p) => p.category === term.category
      );
      if (pattern) {
        totalScore += severityWeights[pattern.severity];
      }
    }

    // Normalize to 0-100 scale (cap at 10 high-severity terms)
    return Math.min(100, (totalScore / 30) * 100);
  }

  /**
   * Get recommendations for reducing bias
   */
  getRecommendations(biasedTerms: BiasedTermDto[]): string[] {
    const recommendations = new Set<string>();

    for (const term of biasedTerms) {
      recommendations.add(term.suggestion);
    }

    // Add general recommendations
    if (biasedTerms.length > 0) {
      recommendations.add(
        'Use structured interview scorecards with specific, job-related criteria'
      );
      recommendations.add(
        'Focus on observable behaviors and measurable skills'
      );
      recommendations.add(
        'Review feedback with a colleague before submitting'
      );
    }

    return Array.from(recommendations);
  }
}
