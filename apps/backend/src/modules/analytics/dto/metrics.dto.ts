import { IsOptional, IsString, IsDateString, IsEnum, IsArray } from 'class-validator';

export enum MetricType {
  FUNNEL = 'funnel',
  EFFICIENCY = 'efficiency',
  QUALITY = 'quality',
  DIVERSITY = 'diversity',
}

export enum TimeRange {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export class GetMetricsDto {
  @IsOptional()
  @IsEnum(MetricType)
  type?: MetricType;

  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange = TimeRange.LAST_30_DAYS;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locationIds?: string[];
}

export interface FunnelMetrics {
  totalApplications: number;
  screeningPassed: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offersExtended: number;
  offersAccepted: number;
  conversionRates: {
    applicationToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerToAcceptance: number;
    overallConversion: number;
  };
  dropOffAnalysis: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export interface EfficiencyMetrics {
  averageTimeToFill: number;
  averageTimeToHire: number;
  averageTimeInStage: {
    stage: string;
    averageDays: number;
  }[];
  interviewsPerHire: number;
  applicationResponseTime: number;
}

export interface QualityMetrics {
  offerAcceptanceRate: number;
  candidateQualityScore: number;
  sourceEffectiveness: {
    source: string;
    applications: number;
    hires: number;
    conversionRate: number;
  }[];
  interviewFeedbackAverage: number;
}

export interface DiversityMetrics {
  demographicBreakdown: {
    category: string;
    value: string;
    count: number;
    percentage: number;
  }[];
  stagePassRates: {
    stage: string;
    demographics: {
      category: string;
      value: string;
      passRate: number;
    }[];
  }[];
  hiringDiversity: {
    category: string;
    value: string;
    hireCount: number;
    percentage: number;
  }[];
}

export interface MetricsResponse {
  funnel?: FunnelMetrics;
  efficiency?: EfficiencyMetrics;
  quality?: QualityMetrics;
  diversity?: DiversityMetrics;
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
}
