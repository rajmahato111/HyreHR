import { Injectable } from '@nestjs/common';
import {
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowCondition,
  WorkflowAction,
} from '../../database/entities';

export interface WorkflowTemplate {
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  category: string;
}

@Injectable()
export class WorkflowTemplatesService {
  /**
   * Get all available workflow templates
   */
  getTemplates(): WorkflowTemplate[] {
    return [
      this.getAutoScreenTemplate(),
      this.getAutoAssignRecruiterTemplate(),
      this.getAutoFollowUpTemplate(),
      this.getInterviewReminderTemplate(),
      this.getOfferAcceptanceNotificationTemplate(),
      this.getApplicationRejectionTemplate(),
      this.getStageMoveNotificationTemplate(),
      this.getHighMatchScoreAlertTemplate(),
    ];
  }

  /**
   * Get template by name
   */
  getTemplateByName(name: string): WorkflowTemplate | undefined {
    return this.getTemplates().find((t) => t.name === name);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return this.getTemplates().filter((t) => t.category === category);
  }

  /**
   * Auto-screen template: Automatically move high-match candidates to phone screen
   */
  private getAutoScreenTemplate(): WorkflowTemplate {
    return {
      name: 'Auto-Screen High Match Candidates',
      description:
        'Automatically move candidates with match score >= 80 to phone screen stage',
      category: 'Screening',
      triggerType: WorkflowTriggerType.APPLICATION_CREATED,
      conditions: [
        {
          field: 'customFields.matchScore',
          operator: WorkflowConditionOperator.GREATER_THAN,
          value: 79,
        },
      ],
      actions: [
        {
          type: WorkflowActionType.MOVE_TO_STAGE,
          config: {
            stageId: 'phone_screen_stage_id', // This would be replaced with actual stage ID
          },
        },
        {
          type: WorkflowActionType.SEND_NOTIFICATION,
          config: {
            userId: 'recruiter_id', // This would be replaced with actual recruiter ID
            message: 'High-match candidate automatically moved to phone screen',
          },
        },
      ],
    };
  }

  /**
   * Auto-assign template: Automatically assign recruiter based on department
   */
  private getAutoAssignRecruiterTemplate(): WorkflowTemplate {
    return {
      name: 'Auto-Assign Recruiter by Department',
      description:
        'Automatically assign applications to recruiters based on job department',
      category: 'Assignment',
      triggerType: WorkflowTriggerType.APPLICATION_CREATED,
      actions: [
        {
          type: WorkflowActionType.ASSIGN_USER,
          config: {
            userId: 'recruiter_id', // This would be determined by department mapping
          },
        },
        {
          type: WorkflowActionType.SEND_NOTIFICATION,
          config: {
            userId: 'recruiter_id',
            message: 'New application assigned to you',
          },
        },
      ],
    };
  }

  /**
   * Auto-follow-up template: Send follow-up email after X days in stage
   */
  private getAutoFollowUpTemplate(): WorkflowTemplate {
    return {
      name: 'Auto Follow-Up After 3 Days',
      description:
        'Send follow-up email to candidates who have been in phone screen stage for 3 days',
      category: 'Communication',
      triggerType: WorkflowTriggerType.APPLICATION_STAGE_CHANGED,
      triggerConfig: {
        toStageType: 'phone_screen',
      },
      actions: [
        {
          type: WorkflowActionType.SEND_EMAIL,
          config: {
            templateId: 'follow_up_template_id',
            recipientType: 'candidate',
          },
          delayMinutes: 4320, // 3 days
        },
      ],
    };
  }

  /**
   * Interview reminder template: Send reminder 24 hours before interview
   */
  private getInterviewReminderTemplate(): WorkflowTemplate {
    return {
      name: 'Interview Reminder',
      description: 'Send reminder email to candidate 24 hours before interview',
      category: 'Interviews',
      triggerType: WorkflowTriggerType.APPLICATION_STAGE_CHANGED,
      triggerConfig: {
        toStageType: 'interview',
      },
      actions: [
        {
          type: WorkflowActionType.SEND_EMAIL,
          config: {
            templateId: 'interview_reminder_template_id',
            recipientType: 'candidate',
          },
          delayMinutes: 1440, // 24 hours before (would need to calculate based on interview time)
        },
      ],
    };
  }

  /**
   * Offer acceptance notification template
   */
  private getOfferAcceptanceNotificationTemplate(): WorkflowTemplate {
    return {
      name: 'Offer Acceptance Notification',
      description:
        'Notify hiring team when candidate accepts offer and trigger onboarding',
      category: 'Offers',
      triggerType: WorkflowTriggerType.OFFER_ACCEPTED,
      actions: [
        {
          type: WorkflowActionType.SEND_NOTIFICATION,
          config: {
            userId: 'hiring_manager_id',
            message: 'Candidate accepted offer - start onboarding process',
          },
        },
        {
          type: WorkflowActionType.MOVE_TO_STAGE,
          config: {
            stageId: 'hired_stage_id',
          },
        },
        {
          type: WorkflowActionType.ADD_TAG,
          config: {
            tag: 'onboarding',
          },
        },
      ],
    };
  }

  /**
   * Application rejection template: Send rejection email and update status
   */
  private getApplicationRejectionTemplate(): WorkflowTemplate {
    return {
      name: 'Application Rejection Workflow',
      description:
        'Send rejection email and update candidate status when application is rejected',
      category: 'Rejection',
      triggerType: WorkflowTriggerType.APPLICATION_STAGE_CHANGED,
      triggerConfig: {
        toStageType: 'rejected',
      },
      actions: [
        {
          type: WorkflowActionType.SEND_EMAIL,
          config: {
            templateId: 'rejection_email_template_id',
            recipientType: 'candidate',
          },
        },
        {
          type: WorkflowActionType.ADD_TAG,
          config: {
            tag: 'rejected',
          },
        },
      ],
    };
  }

  /**
   * Stage move notification template
   */
  private getStageMoveNotificationTemplate(): WorkflowTemplate {
    return {
      name: 'Stage Move Notification',
      description: 'Notify hiring manager when candidate moves to final stage',
      category: 'Notifications',
      triggerType: WorkflowTriggerType.APPLICATION_STAGE_CHANGED,
      triggerConfig: {
        toStageType: 'final_interview',
      },
      actions: [
        {
          type: WorkflowActionType.SEND_NOTIFICATION,
          config: {
            userId: 'hiring_manager_id',
            message: 'Candidate moved to final interview stage - review required',
          },
        },
        {
          type: WorkflowActionType.SEND_EMAIL,
          config: {
            templateId: 'stage_update_template_id',
            recipientType: 'hiring_manager',
          },
        },
      ],
    };
  }

  /**
   * High match score alert template
   */
  private getHighMatchScoreAlertTemplate(): WorkflowTemplate {
    return {
      name: 'High Match Score Alert',
      description:
        'Alert recruiters when a candidate with exceptional match score (>= 90) applies',
      category: 'Screening',
      triggerType: WorkflowTriggerType.APPLICATION_CREATED,
      conditions: [
        {
          field: 'customFields.matchScore',
          operator: WorkflowConditionOperator.GREATER_THAN,
          value: 89,
        },
      ],
      actions: [
        {
          type: WorkflowActionType.SEND_NOTIFICATION,
          config: {
            userId: 'recruiter_id',
            message: 'Exceptional candidate alert - Match score >= 90%',
          },
        },
        {
          type: WorkflowActionType.ADD_TAG,
          config: {
            tag: 'high-priority',
          },
        },
        {
          type: WorkflowActionType.SEND_EMAIL,
          config: {
            templateId: 'high_match_alert_template_id',
            recipientType: 'recruiter',
          },
        },
      ],
    };
  }

  /**
   * Get template categories
   */
  getCategories(): string[] {
    const templates = this.getTemplates();
    const categories = new Set(templates.map((t) => t.category));
    return Array.from(categories).sort();
  }
}
