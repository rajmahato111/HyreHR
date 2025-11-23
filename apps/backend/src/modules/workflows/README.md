# Workflow Automation Module

This module provides workflow automation capabilities for the recruiting platform, allowing organizations to automate repetitive tasks and ensure consistent process execution.

## Features

### Workflow Engine
- **Event-driven triggers**: Workflows are triggered by system events (application created, stage changed, interview completed, etc.)
- **Condition evaluation**: Support for complex conditions with multiple operators (equals, contains, greater than, etc.)
- **Action execution**: Execute multiple actions in sequence with optional delays
- **Execution logging**: Track all workflow executions with detailed step-by-step logs

### Supported Triggers
- `APPLICATION_CREATED`: When a new application is submitted
- `APPLICATION_STAGE_CHANGED`: When an application moves to a different stage
- `INTERVIEW_COMPLETED`: When an interview is marked as completed
- `INTERVIEW_FEEDBACK_SUBMITTED`: When interview feedback is submitted
- `OFFER_SENT`: When an offer is sent to a candidate
- `OFFER_ACCEPTED`: When a candidate accepts an offer
- `OFFER_DECLINED`: When a candidate declines an offer
- `CANDIDATE_CREATED`: When a new candidate is added
- `JOB_OPENED`: When a job is opened
- `JOB_CLOSED`: When a job is closed

### Supported Actions
- `SEND_EMAIL`: Send email using templates
- `MOVE_TO_STAGE`: Move application to a different pipeline stage
- `SEND_NOTIFICATION`: Send in-app notification to users
- `CREATE_TASK`: Create a task for a user
- `UPDATE_FIELD`: Update a field on an entity
- `ASSIGN_USER`: Assign a user to an entity
- `ADD_TAG`: Add a tag to an entity
- `REMOVE_TAG`: Remove a tag from an entity

### Workflow Templates
Pre-built workflow templates for common use cases:
- **Auto-Screen High Match Candidates**: Automatically move candidates with high match scores to phone screen
- **Auto-Assign Recruiter by Department**: Assign applications to recruiters based on job department
- **Auto Follow-Up After 3 Days**: Send follow-up emails to candidates
- **Interview Reminder**: Send reminder emails before interviews
- **Offer Acceptance Notification**: Notify team when offers are accepted
- **Application Rejection Workflow**: Send rejection emails automatically
- **Stage Move Notification**: Notify hiring managers of stage changes
- **High Match Score Alert**: Alert recruiters about exceptional candidates

## API Endpoints

### Workflows

#### Create Workflow
```
POST /workflows
```

Request body:
```json
{
  "name": "Auto-screen high match candidates",
  "description": "Automatically move candidates with match score >= 80 to phone screen",
  "triggerType": "application_created",
  "conditions": [
    {
      "field": "customFields.matchScore",
      "operator": "greater_than",
      "value": 79
    }
  ],
  "actions": [
    {
      "type": "move_to_stage",
      "config": {
        "stageId": "phone-screen-stage-id"
      }
    },
    {
      "type": "send_notification",
      "config": {
        "userId": "recruiter-id",
        "message": "High-match candidate automatically moved to phone screen"
      }
    }
  ],
  "active": true
}
```

#### List Workflows
```
GET /workflows?activeOnly=true
```

#### Get Workflow
```
GET /workflows/:id
```

#### Update Workflow
```
PUT /workflows/:id
```

#### Delete Workflow
```
DELETE /workflows/:id
```

#### Activate Workflow
```
POST /workflows/:id/activate
```

#### Deactivate Workflow
```
POST /workflows/:id/deactivate
```

#### Get Workflow Executions
```
GET /workflows/:id/executions?page=1&limit=20
```

#### Get Workflow Statistics
```
GET /workflows/:id/statistics
```

Response:
```json
{
  "totalExecutions": 150,
  "successfulExecutions": 145,
  "failedExecutions": 5,
  "averageExecutionTime": 2.5
}
```

### Templates

#### List Templates
```
GET /workflows/templates/list
```

#### Get Template Categories
```
GET /workflows/templates/categories
```

#### Get Template by Name
```
GET /workflows/templates/:name
```

#### Create Workflow from Template
```
POST /workflows/templates/:name/create
```

Request body (optional customizations):
```json
{
  "name": "Custom workflow name",
  "active": true,
  "triggerConfig": {
    "jobId": "specific-job-id"
  }
}
```

## Usage Examples

### Example 1: Auto-screen High Match Candidates

```typescript
const workflow = {
  name: 'Auto-screen high match candidates',
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
      config: { stageId: 'phone-screen-stage-id' },
    },
  ],
  active: true,
};
```

### Example 2: Send Follow-up Email After Delay

```typescript
const workflow = {
  name: 'Follow-up after 3 days',
  triggerType: WorkflowTriggerType.APPLICATION_STAGE_CHANGED,
  triggerConfig: {
    toStageType: 'phone_screen',
  },
  actions: [
    {
      type: WorkflowActionType.SEND_EMAIL,
      config: {
        templateId: 'follow-up-template-id',
        recipientType: 'candidate',
      },
      delayMinutes: 4320, // 3 days
    },
  ],
  active: true,
};
```

### Example 3: Complex Conditions with Multiple Actions

```typescript
const workflow = {
  name: 'VIP candidate workflow',
  triggerType: WorkflowTriggerType.APPLICATION_CREATED,
  conditions: [
    {
      field: 'customFields.matchScore',
      operator: WorkflowConditionOperator.GREATER_THAN,
      value: 89,
      logicalOperator: 'AND',
    },
    {
      field: 'candidate.tags',
      operator: WorkflowConditionOperator.CONTAINS,
      value: 'referral',
    },
  ],
  actions: [
    {
      type: WorkflowActionType.ADD_TAG,
      config: { tag: 'vip' },
    },
    {
      type: WorkflowActionType.SEND_NOTIFICATION,
      config: {
        userId: 'hiring-manager-id',
        message: 'VIP candidate applied - immediate review required',
      },
    },
    {
      type: WorkflowActionType.SEND_EMAIL,
      config: {
        templateId: 'vip-acknowledgment-template-id',
        recipientType: 'candidate',
      },
    },
  ],
  active: true,
};
```

## Triggering Workflows Programmatically

To trigger workflows from other services:

```typescript
import { WorkflowEngineService } from './modules/workflows';

// Inject the service
constructor(private workflowEngineService: WorkflowEngineService) {}

// Trigger workflows
await this.workflowEngineService.triggerWorkflows(
  organizationId,
  WorkflowTriggerType.APPLICATION_CREATED,
  'application',
  applicationId,
  {
    candidateId: application.candidateId,
    jobId: application.jobId,
    customFields: application.customFields,
  },
);
```

## Condition Operators

- `equals`: Field value equals the specified value
- `not_equals`: Field value does not equal the specified value
- `contains`: String field contains the specified value
- `not_contains`: String field does not contain the specified value
- `greater_than`: Numeric field is greater than the specified value
- `less_than`: Numeric field is less than the specified value
- `in`: Field value is in the specified array
- `not_in`: Field value is not in the specified array
- `is_empty`: Field is null, undefined, empty string, or empty array
- `is_not_empty`: Field has a value

## Logical Operators

Conditions can be combined using logical operators:
- `AND`: Both conditions must be true (default)
- `OR`: At least one condition must be true

## Action Delays

Actions can be delayed by specifying `delayMinutes`:

```typescript
{
  type: WorkflowActionType.SEND_EMAIL,
  config: { templateId: 'reminder-template-id' },
  delayMinutes: 1440, // 24 hours
}
```

## Workflow Execution Logging

All workflow executions are logged with:
- Execution status (pending, running, completed, failed)
- Trigger data
- Step-by-step execution details
- Error messages for failed actions
- Execution timing (started at, completed at)

## Best Practices

1. **Test workflows thoroughly**: Use test data before activating workflows in production
2. **Use descriptive names**: Make workflow names clear and descriptive
3. **Add conditions carefully**: Ensure conditions are specific enough to avoid unintended triggers
4. **Monitor execution logs**: Regularly review execution logs to identify issues
5. **Use delays wisely**: Be mindful of delays to avoid overwhelming candidates with emails
6. **Deactivate unused workflows**: Deactivate workflows that are no longer needed
7. **Use templates**: Start with templates and customize as needed

## Error Handling

- Failed actions are logged but don't stop the workflow
- Workflows continue executing remaining actions even if one fails
- Execution status is set to "failed" if any action fails
- Error messages are captured in execution logs

## Performance Considerations

- Workflows execute asynchronously to avoid blocking the main request
- Delayed actions are queued for future execution
- Execution logs are stored for audit and debugging purposes
- Consider the impact of high-volume triggers on system resources
