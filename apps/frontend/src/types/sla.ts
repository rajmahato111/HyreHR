export enum SlaRuleType {
  TIME_TO_FIRST_REVIEW = 'time_to_first_review',
  TIME_TO_SCHEDULE_INTERVIEW = 'time_to_schedule_interview',
  TIME_TO_PROVIDE_FEEDBACK = 'time_to_provide_feedback',
  TIME_TO_OFFER = 'time_to_offer',
  TIME_TO_HIRE = 'time_to_hire',
}

export interface SlaRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: SlaRuleType;
  thresholdHours: number;
  alertRecipients: string[];
  escalationRecipients: string[];
  escalationHours?: number;
  active: boolean;
  jobIds?: string[];
  departmentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlaRuleDto {
  name: string;
  description?: string;
  type: SlaRuleType;
  thresholdHours: number;
  alertRecipients: string[];
  escalationRecipients?: string[];
  escalationHours?: number;
  active?: boolean;
  jobIds?: string[];
  departmentIds?: string[];
}

export interface UpdateSlaRuleDto {
  name?: string;
  description?: string;
  type?: SlaRuleType;
  thresholdHours?: number;
  alertRecipients?: string[];
  escalationRecipients?: string[];
  escalationHours?: number;
  active?: boolean;
  jobIds?: string[];
  departmentIds?: string[];
}

export enum SlaViolationStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

export interface SlaViolation {
  id: string;
  ruleId: string;
  rule?: SlaRule;
  entityType: string;
  entityId: string;
  violatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  status: SlaViolationStatus;
  createdAt: string;
}

export interface SlaComplianceMetrics {
  totalActivities: number;
  compliantActivities: number;
  violatedActivities: number;
  complianceRate: number;
  averageCompletionTime: number;
  byRuleType: {
    [key in SlaRuleType]?: {
      total: number;
      compliant: number;
      violated: number;
      complianceRate: number;
    };
  };
}
