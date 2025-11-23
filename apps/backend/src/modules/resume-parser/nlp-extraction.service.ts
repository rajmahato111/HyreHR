import { Injectable, Logger } from '@nestjs/common';
import { ParsedResumeDto } from './dto';

interface NamedEntity {
  text: string;
  type: string;
  start: number;
  end: number;
}

@Injectable()
export class NlpExtractionService {
  private readonly logger = new Logger(NlpExtractionService.name);

  // Common skills taxonomy for matching
  private readonly SKILLS_TAXONOMY = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash',
    
    // Web Technologies
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Next.js', 'Nuxt.js',
    'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind', 'Bootstrap',
    'REST API', 'GraphQL', 'WebSocket', 'HTTP', 'AJAX',
    
    // Backend & Databases
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Neo4j',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'Terraform', 'Ansible', 'CloudFormation',
    
    // Frameworks
    'Spring', 'Django', 'Flask', 'FastAPI', 'Rails', 'Laravel', 'NestJS',
    '.NET', 'ASP.NET', 'Entity Framework',
    
    // Tools & Methodologies
    'Git', 'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
    'TDD', 'BDD', 'CI/CD', 'Microservices', 'RESTful',
    
    // Data & AI
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Pandas', 'NumPy', 'Data Analysis', 'ETL', 'Big Data', 'Spark', 'Hadoop',
    
    // Mobile
    'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin',
    
    // Other
    'Linux', 'Unix', 'Windows', 'MacOS', 'Networking', 'Security',
    'Testing', 'Jest', 'Mocha', 'Pytest', 'JUnit', 'Selenium',
  ];

  /**
   * Extract structured data from resume text using NLP
   */
  async extractStructuredData(text: string): Promise<Partial<ParsedResumeDto>> {
    this.logger.log('Starting NLP extraction');

    const personalInfo = this.extractPersonalInfo(text);
    const workExperience = this.extractWorkExperience(text);
    const education = this.extractEducation(text);
    const skills = this.extractSkills(text);
    const certifications = this.extractCertifications(text);
    const summary = this.extractSummary(text);

    return {
      personalInfo,
      workExperience,
      education,
      skills,
      certifications,
      summary,
      rawText: text,
    };
  }

  /**
   * Extract personal information (name, email, phone, location, URLs)
   */
  private extractPersonalInfo(text: string): ParsedResumeDto['personalInfo'] {
    const info: ParsedResumeDto['personalInfo'] = {};

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      info.email = emailMatch[0];
    }

    // Extract phone number (various formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      info.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
    }

    // Extract LinkedIn URL
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      info.linkedinUrl = linkedinMatch[0];
    }

    // Extract GitHub URL
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      info.githubUrl = githubMatch[0];
    }

    // Extract portfolio/website URL
    const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|net|org|io|dev)(?:\/[\w-]*)?/gi;
    const portfolioMatches = text.match(portfolioRegex);
    if (portfolioMatches) {
      // Filter out common sites and take the first remaining one
      const filtered = portfolioMatches.filter(url => 
        !url.includes('linkedin.com') && 
        !url.includes('github.com') &&
        !url.includes('google.com') &&
        !url.includes('facebook.com')
      );
      if (filtered.length > 0) {
        info.portfolioUrl = filtered[0];
      }
    }

    // Extract name (typically at the beginning of the resume)
    const nameMatch = this.extractName(text);
    if (nameMatch) {
      info.firstName = nameMatch.firstName;
      info.lastName = nameMatch.lastName;
    }

    // Extract location
    const location = this.extractLocation(text);
    if (location) {
      info.location = location;
    }

    return info;
  }

  /**
   * Extract name from resume text
   */
  private extractName(text: string): { firstName: string; lastName: string } | null {
    // Get first few lines where name is typically located
    const lines = text.split('\n').slice(0, 5);
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip lines with email, phone, or URLs
      if (trimmed.includes('@') || trimmed.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || trimmed.includes('http')) {
        continue;
      }
      
      // Look for a line with 2-4 capitalized words (likely a name)
      const words = trimmed.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const capitalizedWords = words.filter(word => 
          word.length > 1 && word[0] === word[0].toUpperCase()
        );
        
        if (capitalizedWords.length >= 2) {
          return {
            firstName: capitalizedWords[0],
            lastName: capitalizedWords[capitalizedWords.length - 1],
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Extract location information
   */
  private extractLocation(text: string): { city?: string; state?: string; country?: string } | null {
    // Common US states
    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    
    // Look for "City, State" pattern
    const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/;
    const match = text.match(locationRegex);
    
    if (match) {
      return {
        city: match[1],
        state: match[2],
        country: 'USA',
      };
    }
    
    return null;
  }

  /**
   * Extract work experience
   */
  private extractWorkExperience(text: string): ParsedResumeDto['workExperience'] {
    const experiences: ParsedResumeDto['workExperience'] = [];
    
    // Find experience section
    const experienceSection = this.extractSection(text, ['experience', 'work history', 'employment', 'professional experience']);
    
    if (!experienceSection) {
      return experiences;
    }
    
    // Split into individual job entries (typically separated by dates or company names)
    const entries = this.splitIntoEntries(experienceSection);
    
    for (const entry of entries) {
      const experience = this.parseWorkEntry(entry);
      if (experience) {
        experiences.push(experience);
      }
    }
    
    return experiences;
  }

  /**
   * Parse a single work experience entry
   */
  private parseWorkEntry(entry: string): ParsedResumeDto['workExperience'][0] | null {
    // Extract dates
    const dates = this.extractDates(entry);
    
    // Extract company name (often in all caps or bold, near dates)
    const lines = entry.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;
    
    // First line often contains title and/or company
    const firstLine = lines[0];
    const secondLine = lines.length > 1 ? lines[1] : '';
    
    // Try to identify company and title
    let company = '';
    let title = '';
    
    // Look for patterns like "Company Name" or "Title at Company"
    if (firstLine.includes(' at ')) {
      const parts = firstLine.split(' at ');
      title = parts[0].trim();
      company = parts[1].trim();
    } else if (firstLine.includes(' - ')) {
      const parts = firstLine.split(' - ');
      title = parts[0].trim();
      company = parts[1].trim();
    } else {
      // Assume first line is title, second is company
      title = firstLine.trim();
      company = secondLine.trim();
    }
    
    if (!company && !title) return null;
    
    return {
      company: company || 'Unknown',
      title: title || 'Unknown',
      startDate: dates.start,
      endDate: dates.end,
      current: dates.current,
      description: entry,
    };
  }

  /**
   * Extract education information
   */
  private extractEducation(text: string): ParsedResumeDto['education'] {
    const education: ParsedResumeDto['education'] = [];
    
    // Find education section
    const educationSection = this.extractSection(text, ['education', 'academic', 'qualifications']);
    
    if (!educationSection) {
      return education;
    }
    
    // Common degree patterns
    const degreePatterns = [
      /(?:Bachelor|B\.?S\.?|B\.?A\.?|BA|BS)(?:\s+of\s+(?:Science|Arts))?\s+in\s+([\w\s]+)/i,
      /(?:Master|M\.?S\.?|M\.?A\.?|MBA|MS|MA)(?:\s+of\s+(?:Science|Arts|Business Administration))?\s+in\s+([\w\s]+)/i,
      /(?:Ph\.?D\.?|PhD|Doctorate)\s+in\s+([\w\s]+)/i,
      /(?:Associate|A\.?S\.?|A\.?A\.?)(?:\s+of\s+(?:Science|Arts))?\s+in\s+([\w\s]+)/i,
    ];
    
    const entries = this.splitIntoEntries(educationSection);
    
    for (const entry of entries) {
      const edu = this.parseEducationEntry(entry, degreePatterns);
      if (edu) {
        education.push(edu);
      }
    }
    
    return education;
  }

  /**
   * Parse a single education entry
   */
  private parseEducationEntry(entry: string, degreePatterns: RegExp[]): ParsedResumeDto['education'][0] | null {
    let degree = '';
    let field = '';
    
    // Try to match degree patterns
    for (const pattern of degreePatterns) {
      const match = entry.match(pattern);
      if (match) {
        degree = match[0];
        field = match[1];
        break;
      }
    }
    
    // Extract institution name (often the first line or contains "University", "College", "Institute")
    const lines = entry.split('\n').filter(l => l.trim());
    let institution = '';
    
    for (const line of lines) {
      if (line.match(/University|College|Institute|School/i)) {
        institution = line.trim();
        break;
      }
    }
    
    if (!institution && lines.length > 0) {
      institution = lines[0].trim();
    }
    
    // Extract dates
    const dates = this.extractDates(entry);
    
    // Extract GPA if present
    const gpaMatch = entry.match(/GPA:?\s*([\d.]+)/i);
    const gpa = gpaMatch ? gpaMatch[1] : undefined;
    
    if (!institution) return null;
    
    return {
      institution,
      degree: degree || undefined,
      field: field || undefined,
      startDate: dates.start,
      endDate: dates.end,
      gpa,
    };
  }

  /**
   * Extract skills from resume text
   */
  private extractSkills(text: string): string[] {
    const skills = new Set<string>();
    
    // Find skills section if it exists
    const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'core competencies', 'technologies']);
    const searchText = skillsSection || text;
    
    // Match against skills taxonomy
    for (const skill of this.SKILLS_TAXONOMY) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(searchText)) {
        skills.add(skill);
      }
    }
    
    return Array.from(skills);
  }

  /**
   * Extract certifications
   */
  private extractCertifications(text: string): ParsedResumeDto['certifications'] {
    const certifications: ParsedResumeDto['certifications'] = [];
    
    // Find certifications section
    const certsSection = this.extractSection(text, ['certifications', 'certificates', 'licenses']);
    
    if (!certsSection) {
      return certifications;
    }
    
    // Common certification patterns
    const certPatterns = [
      /AWS Certified[\w\s-]+/i,
      /Microsoft Certified[\w\s-]+/i,
      /Google Cloud[\w\s-]+/i,
      /PMP/i,
      /CISSP/i,
      /CompTIA[\w\s+]+/i,
    ];
    
    for (const pattern of certPatterns) {
      const match = certsSection.match(pattern);
      if (match) {
        certifications.push({
          name: match[0],
        });
      }
    }
    
    return certifications;
  }

  /**
   * Extract professional summary
   */
  private extractSummary(text: string): string | undefined {
    const summarySection = this.extractSection(text, ['summary', 'profile', 'objective', 'about']);
    
    if (summarySection) {
      // Take first 500 characters
      return summarySection.substring(0, 500).trim();
    }
    
    return undefined;
  }

  /**
   * Extract a specific section from resume text
   */
  private extractSection(text: string, sectionNames: string[]): string | null {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      
      // Check if this line is a section header
      for (const sectionName of sectionNames) {
        if (line === sectionName || line.startsWith(sectionName)) {
          // Extract content until next section or end
          const sectionContent: string[] = [];
          
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            
            // Stop if we hit another section header (all caps or ends with colon)
            if (nextLine.length > 0 && (
              nextLine === nextLine.toUpperCase() ||
              nextLine.endsWith(':')
            )) {
              break;
            }
            
            sectionContent.push(lines[j]);
          }
          
          return sectionContent.join('\n').trim();
        }
      }
    }
    
    return null;
  }

  /**
   * Split section text into individual entries
   */
  private splitIntoEntries(text: string): string[] {
    // Split by double newlines or date patterns
    const entries = text.split(/\n\n+/);
    return entries.filter(e => e.trim().length > 20); // Filter out very short entries
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): { start?: string; end?: string; current: boolean } {
    const result: { start?: string; end?: string; current: boolean } = { current: false };
    
    // Look for "Present", "Current", "Now"
    if (/present|current|now/i.test(text)) {
      result.current = true;
    }
    
    // Match date patterns like "Jan 2020", "January 2020", "2020", "01/2020"
    const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}|\d{1,2}\/\d{4}/gi;
    const dates = text.match(datePattern);
    
    if (dates && dates.length > 0) {
      result.start = dates[0];
      if (dates.length > 1 && !result.current) {
        result.end = dates[dates.length - 1];
      }
    }
    
    return result;
  }
}
