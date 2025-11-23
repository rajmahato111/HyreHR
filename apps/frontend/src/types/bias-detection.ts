export enum BiasAlertType {
  BIASED_LANGUAGE = 'biased_language',
  STATISTICAL_DISPARITY = 'statistical_disparity',
  RATING_INCONSISTENCY = 'rating_inconsistency',
  DEMOGRAPHIC_PATTERN = 'demographic_pattern',
}

export enum BiasAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface BiasedTerm {
  term: string;
  category: string;
  context: string;
  suggestion: string;
}

export interface BiasAlert {
  type: BiasAlertType;
  severity: BiasAlertSeverity;
  message: string;
  feedbackId?: string;
  jobId?: string;
  data?: any;
  recommendation?: string;
}

export interface DemographicGroup {
  group: string;
  total: number;
  passed: number;
  passRate: number;
}

export interface DisparityAnalysis {
  hasDisparity: boolean;
  groups: DemographicGroup[];
  overallPassRate: number;
  maxDifference: number;
  affectedGroups: string[];
}

export interface BiasReport {
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    totalFeedbackAnalyzed: number;
    feedbackWithBias: number;
    totalBiasedTerms: number;
  };
  alerts: BiasAlert[];
  passRates: DisparityAnalysis | null;
  representation: {
    stages: {
      stageId: string;
      stageName: string;
      demographics: Record<string, number>;
    }[];
  } | null;
  timeToHire: {
    hasDisparity: boolean;
    groups: {
      group: string;
      averageDays: number;
      count: number;
    }[];
    overallAverage: number;
  } | null;
  recommendations: string[];
}

export interface BiasMetrics {
  totalApplications: number;
  demographics: Record<string, number>;
  recentAlerts: BiasAlert[];
  alertCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface FeedbackBiasCheck {
  hasBias: boolean;
  biasScore: number;
  biasedTerms: BiasedTerm[];
  recommendations: string[];
  shouldWarn: boolean;
  shouldBlock: boolean;
}
