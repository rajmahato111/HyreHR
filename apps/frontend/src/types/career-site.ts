export interface CareerSite {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  published: boolean;
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    headerImage?: string;
  };
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    aboutCompany?: string;
    benefits?: string[];
    values?: string[];
    testimonials?: Testimonial[];
    customSections?: CustomSection[];
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  settings: {
    showJobCount?: boolean;
    enableFilters?: boolean;
    enableSearch?: boolean;
    jobsPerPage?: number;
    requireLogin?: boolean;
    enableApplicationTracking?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo?: string;
  quote: string;
  order: number;
}

export interface CustomSection {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
}

export interface ApplicationForm {
  id: string;
  organizationId: string;
  jobId?: string;
  name: string;
  isDefault: boolean;
  fields: FormField[];
  screeningQuestions: ScreeningQuestion[];
  includeResume: boolean;
  includeCoverLetter: boolean;
  includeEEO: boolean;
  eeoConfig: {
    voluntary: boolean;
    questions: EEOQuestion[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  disqualifyingAnswers?: string[];
  order: number;
}

export interface EEOQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  department: string;
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    remote: boolean;
  }>;
  employmentType: string;
  seniorityLevel: string;
  remoteOk: boolean;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: string;
}

export interface ApplicationSubmission {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  customFields: Record<string, any>;
  screeningAnswers?: Array<{
    questionId: string;
    answer: any;
  }>;
  eeoData?: Record<string, any>;
  source?: string;
}
