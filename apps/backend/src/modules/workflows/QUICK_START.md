# Workflow Service Quick Start Guide

This guide will help you get started with the Workflow Automation Service in 5 minutes.

## Prerequisites

- Backend server running
- Valid JWT authentication token
- Organization ID

## Step 1: List Available Templates

First, see what pre-built templates are available:

```bash
curl -X GET http://localhost:3000/workflows/templates/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

You'll see templates like:
- Auto-Screen High Match Candidates
- Auto-Assign Recruiter by Department
- Auto Follow-Up After 3 Days
- Interview Reminder
- And more...

## Step 2: Create Your First Workflow from a Template

Let's create a workflow that automatically screens high-match candidates:

```bash
curl -X POST http://localhost:3000/workflows/templates/Auto-Screen%20High%20Match%20Candidates/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Auto-Screen Workflow",
    "active": true
  }'
```

Response:
```json
{
  "id": "workflow-123",
  "name": "My Auto-Screen Workflow",
  "triggerType": "application_created",
  "active": true,
  ...
}
```

## Step 3: Create a Custom Workflow

Create a workflow from scratch:

```bash
curl -X POST http://localhost:3000/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notify on High Match",
    "description": "Send notification when candidate with high match score applies",
    "triggerType": "application_created",
    "conditions": [
      {
        "field": "customFields.matchScore",
        "operator": "greater_than",
        "value": 85
      }
    ],
    "actions": [
      {
        "type": "send_notification",
        "config": {
          "userId": "recruiter-id",
          "message": "High-match candidate alert!"
        }
      },
      {
        "type": "add_tag",
        "config": {
          "tag": "high-priority"
        }
      }
    ],
    "active": true
  }'
```

## Step 4: View Your Workflows

List all workflows:

```bash
curl -X GET http://localhost:3000/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

List only active workflows:

```bash
curl -X GET http://localhost:3000/workflows?activeOnly=true \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 5: Monitor Workflow Executions

Check execution history:

```bash
curl -X GET http://localhost:3000/workflows/workflow-123/executions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Get workflow statistics:

```bash
curl -X GET http://localhost:3000/workflows/workflow-123/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "totalExecutions": 50,
  "successfulExecutions": 48,
  "failedExecutions": 2,
  "averageExecutionTime": 1.8
}
```

## Common Use Cases

### Use Case 1: Auto-Screen Candidates

Automatically move high-match candidates to phone screen:

```json
{
  "name": "Auto-Screen High Match",
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
    }
  ],
  "active": true
}
```

### Use Case 2: Send Follow-up Email

Send follow-up email 3 days after phone screen:

```json
{
  "name": "Follow-up After Phone Screen",
  "triggerType": "application_stage_changed",
  "triggerConfig": {
    "toStageType": "phone_screen"
  },
  "actions": [
    {
      "type": "send_email",
      "config": {
        "templateId": "follow-up-template-id",
        "recipientType": "candidate"
      },
      "delayMinutes": 4320
    }
  ],
  "active": true
}
```

### Use Case 3: Notify on Offer Acceptance

Notify team when candidate accepts offer:

```json
{
  "name": "Offer Acceptance Notification",
  "triggerType": "offer_accepted",
  "actions": [
    {
      "type": "send_notification",
      "config": {
        "userId": "hiring-manager-id",
        "message": "Candidate accepted offer!"
      }
    },
    {
      "type": "move_to_stage",
      "config": {
        "stageId": "hired-stage-id"
      }
    },
    {
      "type": "add_tag",
      "config": {
        "tag": "onboarding"
      }
    }
  ],
  "active": true
}
```

### Use Case 4: Complex Conditions

Alert on VIP candidates (high match + referral):

```json
{
  "name": "VIP Candidate Alert",
  "triggerType": "application_created",
  "conditions": [
    {
      "field": "customFields.matchScore",
      "operator": "greater_than",
      "value": 89,
      "logicalOperator": "AND"
    },
    {
      "field": "candidate.tags",
      "operator": "contains",
      "value": "referral"
    }
  ],
  "actions": [
    {
      "type": "add_tag",
      "config": {
        "tag": "vip"
      }
    },
    {
      "type": "send_notification",
      "config": {
        "userId": "hiring-manager-id",
        "message": "VIP candidate - immediate review required"
      }
    }
  ],
  "active": true
}
```

## Managing Workflows

### Deactivate a Workflow

Temporarily stop a workflow:

```bash
curl -X POST http://localhost:3000/workflows/workflow-123/deactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reactivate a Workflow

Turn it back on:

```bash
curl -X POST http://localhost:3000/workflows/workflow-123/activate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Workflow

Modify an existing workflow:

```bash
curl -X PUT http://localhost:3000/workflows/workflow-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workflow Name",
    "conditions": [
      {
        "field": "customFields.matchScore",
        "operator": "greater_than",
        "value": 90
      }
    ]
  }'
```

### Delete a Workflow

Remove a workflow:

```bash
curl -X DELETE http://localhost:3000/workflows/workflow-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Triggering Workflows Programmatically

From your code, trigger workflows when events occur:

```typescript
import { WorkflowEngineService, WorkflowTriggerType } from './modules/workflows';

// Inject the service
constructor(private workflowEngineService: WorkflowEngineService) {}

// Trigger workflows when application is created
async createApplication(data: CreateApplicationDto) {
  const application = await this.applicationRepository.save(data);
  
  // Trigger workflows
  await this.workflowEngineService.triggerWorkflows(
    organizationId,
    WorkflowTriggerType.APPLICATION_CREATED,
    'application',
    application.id,
    {
      candidateId: application.candidateId,
      jobId: application.jobId,
      customFields: application.customFields,
    },
  );
  
  return application;
}
```

## Debugging Workflows

### View Execution Details

Get detailed execution information:

```bash
curl -X GET http://localhost:3000/workflows/executions/execution-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response shows each step:
```json
{
  "id": "execution-123",
  "status": "completed",
  "steps": [
    {
      "actionType": "move_to_stage",
      "status": "completed",
      "startedAt": "2025-11-16T10:00:00Z",
      "completedAt": "2025-11-16T10:00:01Z",
      "result": {
        "success": true
      }
    },
    {
      "actionType": "send_notification",
      "status": "failed",
      "startedAt": "2025-11-16T10:00:01Z",
      "completedAt": "2025-11-16T10:00:02Z",
      "error": "User not found"
    }
  ]
}
```

### Check Workflow Statistics

Monitor success rates:

```bash
curl -X GET http://localhost:3000/workflows/workflow-123/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

1. **Start with Templates**: Use pre-built templates and customize them
2. **Test First**: Create workflows as inactive, test them, then activate
3. **Use Descriptive Names**: Make workflow names clear and specific
4. **Monitor Regularly**: Check execution logs and statistics
5. **Be Specific with Conditions**: Avoid overly broad conditions
6. **Use Delays Wisely**: Don't overwhelm candidates with emails
7. **Handle Errors**: Review failed executions and adjust workflows

## Troubleshooting

### Workflow Not Triggering

1. Check if workflow is active: `GET /workflows/:id`
2. Verify trigger type matches the event
3. Check if conditions are too restrictive
4. Review trigger configuration

### Actions Failing

1. Check execution logs: `GET /workflows/executions/:executionId`
2. Verify action configuration (IDs, templates, etc.)
3. Ensure required services are running
4. Check permissions

### Performance Issues

1. Review workflow statistics
2. Check for workflows with too many executions
3. Consider adding more specific conditions
4. Use delays to spread out actions

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [API.md](./API.md) for complete API reference
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Build a UI for workflow management
- Integrate with other services (email, notifications, etc.)

## Support

For issues or questions:
1. Check execution logs for error details
2. Review workflow configuration
3. Verify trigger data matches conditions
4. Check service integrations

Happy automating! 🚀
