import api from './api';

export interface ParsedResumeData {
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

export interface ParseResumeResponse {
  success: boolean;
  data: {
    parsedData: ParsedResumeData;
    fileUrl: string;
    qualityReport: {
      issues: string[];
      suggestions: string[];
      strengths: string[];
    };
  };
  message: string;
}

export interface ParseAndCreateResponse {
  success: boolean;
  data?: {
    candidate: any;
    parsedData: ParsedResumeData;
    fileUrl: string;
    qualityReport: {
      issues: string[];
      suggestions: string[];
      strengths: string[];
    };
    confidence: {
      overall: number;
      personalInfo: number;
      workExperience: number;
      education: number;
      skills: number;
    };
    needsManualReview: boolean;
    suggestedData?: any;
    duplicates?: any[];
  };
  error?: string;
  message: string;
}

export const resumeParserService = {
  // Parse resume only
  async parseResume(file: File, candidateId?: string): Promise<ParseResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }

    const response = await api.post('/resume-parser/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Parse resume and create candidate
  async parseAndCreateCandidate(
    file: File,
    options?: {
      sourceType?: string;
      sourceDetails?: Record<string, any>;
      gdprConsent?: boolean;
      customFields?: Record<string, any>;
    }
  ): Promise<ParseAndCreateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.sourceType) {
      formData.append('sourceType', options.sourceType);
    }
    if (options?.sourceDetails) {
      formData.append('sourceDetails', JSON.stringify(options.sourceDetails));
    }
    if (options?.gdprConsent !== undefined) {
      formData.append('gdprConsent', String(options.gdprConsent));
    }
    if (options?.customFields) {
      formData.append('customFields', JSON.stringify(options.customFields));
    }

    const response = await api.post('/resume-parser/parse-and-create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get supported file types
  async getSupportedTypes(): Promise<{
    extensions: string[];
    mimeTypes: string[];
  }> {
    const response = await api.post('/resume-parser/supported-types');
    return response.data.data;
  },
};

export default resumeParserService;
