import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadResumeDto {
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class ParsedResumeDto {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  
  workExperience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    location?: string;
  }>;
  
  education: Array<{
    institution: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  
  skills: string[];
  
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  
  summary?: string;
  
  rawText: string;
  
  confidence: {
    overall: number;
    personalInfo: number;
    workExperience: number;
    education: number;
    skills: number;
  };
  
  needsManualReview: boolean;
}
