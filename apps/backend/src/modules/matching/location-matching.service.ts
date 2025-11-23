import { Injectable } from '@nestjs/common';

export interface Location {
  city?: string;
  state?: string;
  country: string;
}

export interface LocationMatchResult {
  score: number; // 0-100
  candidateLocation: Location;
  jobLocations: Location[];
  remoteOk: boolean;
  matchType: 'exact' | 'same_state' | 'same_country' | 'remote' | 'no_match';
  explanation: string;
}

@Injectable()
export class LocationMatchingService {
  /**
   * Calculate location match score
   * 
   * Scoring:
   * - Exact location match (city + state + country): 100 points
   * - Same state/region: 80 points
   * - Same country: 60 points
   * - Remote position: 100 points (location doesn't matter)
   * - No match: 30 points
   */
  calculateLocationMatch(
    candidateLocation: Location,
    jobLocations: Location[],
    remoteOk: boolean,
  ): LocationMatchResult {
    // If remote is OK, location doesn't matter
    if (remoteOk) {
      return {
        score: 100,
        candidateLocation,
        jobLocations,
        remoteOk,
        matchType: 'remote',
        explanation: 'Position allows remote work, location is not a constraint.',
      };
    }

    // Check for exact match
    for (const jobLocation of jobLocations) {
      if (this.isExactMatch(candidateLocation, jobLocation)) {
        return {
          score: 100,
          candidateLocation,
          jobLocations,
          remoteOk,
          matchType: 'exact',
          explanation: `Candidate is located in ${this.formatLocation(candidateLocation)}, matching the job location.`,
        };
      }
    }

    // Check for same state/region match
    for (const jobLocation of jobLocations) {
      if (this.isSameState(candidateLocation, jobLocation)) {
        return {
          score: 80,
          candidateLocation,
          jobLocations,
          remoteOk,
          matchType: 'same_state',
          explanation: `Candidate is in the same state/region (${candidateLocation.state}) as the job location.`,
        };
      }
    }

    // Check for same country match
    for (const jobLocation of jobLocations) {
      if (this.isSameCountry(candidateLocation, jobLocation)) {
        return {
          score: 60,
          candidateLocation,
          jobLocations,
          remoteOk,
          matchType: 'same_country',
          explanation: `Candidate is in the same country (${candidateLocation.country}) as the job location.`,
        };
      }
    }

    // No match
    return {
      score: 30,
      candidateLocation,
      jobLocations,
      remoteOk,
      matchType: 'no_match',
      explanation: `Candidate location (${this.formatLocation(candidateLocation)}) does not match job locations. Relocation may be required.`,
    };
  }

  /**
   * Check if two locations are an exact match
   */
  private isExactMatch(loc1: Location, loc2: Location): boolean {
    return (
      this.normalize(loc1.city) === this.normalize(loc2.city) &&
      this.normalize(loc1.state) === this.normalize(loc2.state) &&
      this.normalize(loc1.country) === this.normalize(loc2.country)
    );
  }

  /**
   * Check if two locations are in the same state/region
   */
  private isSameState(loc1: Location, loc2: Location): boolean {
    return (
      this.normalize(loc1.state) === this.normalize(loc2.state) &&
      this.normalize(loc1.country) === this.normalize(loc2.country) &&
      loc1.state !== undefined &&
      loc2.state !== undefined
    );
  }

  /**
   * Check if two locations are in the same country
   */
  private isSameCountry(loc1: Location, loc2: Location): boolean {
    return this.normalize(loc1.country) === this.normalize(loc2.country);
  }

  /**
   * Normalize location string for comparison
   */
  private normalize(value?: string): string {
    if (!value) return '';
    return value.toLowerCase().trim();
  }

  /**
   * Format location for display
   */
  private formatLocation(location: Location): string {
    const parts: string[] = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  }

  /**
   * Calculate distance between two locations (simplified)
   * This is a placeholder - in production, you'd use a geocoding service
   */
  calculateDistance(loc1: Location, loc2: Location): number {
    // Placeholder: return 0 for same city, 100 for same state, 500 for same country, 5000 for different countries
    if (this.isExactMatch(loc1, loc2)) return 0;
    if (this.isSameState(loc1, loc2)) return 100;
    if (this.isSameCountry(loc1, loc2)) return 500;
    return 5000;
  }
}
