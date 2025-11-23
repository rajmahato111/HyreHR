export enum WorkflowTriggerType {
  APPLICATION_CREATED = 'application_created',
  APPLICATION_STAGE_CHANGED = 'application_stage_changed',
  INTERVIEW_COMPLETED = 'interview_completed',
  INTERVIEW_FEEDBACK_SUBMITTED = 'interview_feedback_submitted',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  CANDIDATE_CREATED = 'candidate_created',
  JOB_OPENED = 'job_opened',
  JOB_CLOSED = 'job_closed',
}

export enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  MOVE_TO_STAGE = 'move_to_stage',
  SEND_NOTIFICATION = 'send_notification',
  CREATE_TASK = 'create_task',
  UPDATE_FIELD = 'update_field',
  ASSIGN_USER = 'assign_user',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
}

export enum WorkflowConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, any>;
  delayMinutes?: number;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  active?: boolean;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  triggerType?: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  active?: boolean;
}

export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface WorkflowExecutionStep {
  actionType: string;
  status: 'pending' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflow?: Workflow;
  entityType: string;
  entityId: string;
  status: WorkflowExecutionStatus;
  triggerData: Record<string, any>;
  steps: WorkflowExecutionStep[];
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WorkflowTemplate {
  name: string;
  displayName: string;
  description: string;
  category: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionAt?: string;
}
