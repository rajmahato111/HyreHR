# Workflow Service API Documentation

## Base URL
```
/workflows
```

## Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

---

## Workflow Management

### Create Workflow
Create a new workflow.

**Endpoint:** `POST /workflows`

**Request Body:**
```json
{
  "name": "Auto-screen high match candidates",
  "description": "Automatically move candidates with match score >= 80 to phone screen",
  "triggerType": "application_created",
  "triggerConfig": {
    "jobId": "optional-specific-job-id"
  },
  "conditions": [
    {
      "field": "customFields.matchScore",
      "operator": "greater_than",
      "value": 79,
      "logicalOperator": "AND"
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
      },
      "delayMinutes": 0
    }
  ],
  "active": true
}
```

**Response:** `201 Created`
```json
{
  "id": "workflow-uuid",
  "organizationId": "org-uuid",
  "name": "Auto-screen high match candidates",
  "description": "Automatically move candidates with match score >= 80 to phone screen",
  "triggerType": "application_created",
  "triggerConfig": { "jobId": "optional-specific-job-id" },
  "conditions": [...],
  "actions": [...],
  "active": true,
  "createdBy": "user-uuid",
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

---

### List Workflows
Get all workflows for the organization.

**Endpoint:** `GET /workflows`

**Query Parameters:**
- `activeOnly` (optional): `true` to return only active workflows

**Response:** `200 OK`
```json
[
  {
    "id": "workflow-uuid",
    "organizationId": "org-uuid",
    "name": "Auto-screen high match candidates",
    "description": "...",
    "triggerType": "application_created",
    "active": true,
    "creator": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:00:00Z"
  }
]
```

---

### Get Workflow
Get a specific workflow by ID.

**Endpoint:** `GET /workflows/:id`

**Response:** `200 OK`
```json
{
  "id": "workflow-uuid",
  "organizationId": "org-uuid",
  "name": "Auto-screen high match candidates",
  "description": "...",
  "triggerType": "application_created",
  "triggerConfig": {},
  "conditions": [...],
  "actions": [...],
  "active": true,
  "createdBy": "user-uuid",
  "creator": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

---

### Update Workflow
Update an existing workflow.

**Endpoint:** `PUT /workflows/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated workflow name",
  "description": "Updated description",
  "conditions": [...],
  "actions": [...],
  "active": false
}
```

**Response:** `200 OK`
```json
{
  "id": "workflow-uuid",
  "name": "Updated workflow name",
  ...
}
```

---

### Delete Workflow
Delete a workflow.

**Endpoint:** `DELETE /workflows/:id`

**Response:** `200 OK`
```json
{
  "message": "Workflow deleted successfully"
}
```

**Error Response:** `400 Bad Request` (if workflow has active executions)
```json
{
  "statusCode": 400,
  "message": "Cannot delete workflow with 5 active executions"
}
```

---

### Activate Workflow
Activate a workflow to start processing triggers.

**Endpoint:** `POST /workflows/:id/activate`

**Response:** `200 OK`
```json
{
  "id": "workflow-uuid",
  "active": true,
  ...
}
```

---

### Deactivate Workflow
Deactivate a workflow to stop processing triggers.

**Endpoint:** `POST /workflows/:id/deactivate`

**Response:** `200 OK`
```json
{
  "id": "workflow-uuid",
  "active": false,
  ...
}
```

---

### Get Workflow Executions
Get execution history for a workflow.

**Endpoint:** `GET /workflows/:id/executions`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "execution-uuid",
      "workflowId": "workflow-uuid",
      "entityType": "application",
      "entityId": "application-uuid",
      "status": "completed",
      "triggerData": {
        "candidateId": "candidate-uuid",
        "jobId": "job-uuid",
        "customFields": {
          "matchScore": 85
        }
      },
      "steps": [
        {
          "actionType": "move_to_stage",
          "status": "completed",
          "startedAt": "2025-11-16T10:00:00Z",
          "completedAt": "2025-11-16T10:00:01Z",
          "result": {
            "action": "move_to_stage",
            "applicationId": "application-uuid",
            "stageId": "stage-uuid",
            "success": true
          }
        }
      ],
      "startedAt": "2025-11-16T10:00:00Z",
      "completedAt": "2025-11-16T10:00:02Z",
      "createdAt": "2025-11-16T10:00:00Z"
    }
  ],
  "total": 150
}
```

---

### Get Workflow Statistics
Get statistics for a workflow.

**Endpoint:** `GET /workflows/:id/statistics`

**Response:** `200 OK`
```json
{
  "totalExecutions": 150,
  "successfulExecutions": 145,
  "failedExecutions": 5,
  "averageExecutionTime": 2.5
}
```

---

### Get Execution Details
Get details of a specific workflow execution.

**Endpoint:** `GET /workflows/executions/:executionId`

**Response:** `200 OK`
```json
{
  "id": "execution-uuid",
  "workflowId": "workflow-uuid",
  "workflow": {
    "id": "workflow-uuid",
    "name": "Auto-screen high match candidates"
  },
  "entityType": "application",
  "entityId": "application-uuid",
  "status": "completed",
  "triggerData": {...},
  "steps": [...],
  "startedAt": "2025-11-16T10:00:00Z",
  "completedAt": "2025-11-16T10:00:02Z",
  "createdAt": "2025-11-16T10:00:00Z"
}
```

---

## Workflow Templates

### List Templates
Get all available workflow templates.

**Endpoint:** `GET /workflows/templates/list`

**Response:** `200 OK`
```json
[
  {
    "name": "Auto-Screen High Match Candidates",
    "description": "Automatically move candidates with match score >= 80 to phone screen stage",
    "category": "Screening",
    "triggerType": "application_created",
    "conditions": [...],
    "actions": [...]
  },
  {
    "name": "Auto-Assign Recruiter by Department",
    "description": "Automatically assign applications to recruiters based on job department",
    "category": "Assignment",
    "triggerType": "application_created",
    "actions": [...]
  }
]
```

---

### Get Template Categories
Get all template categories.

**Endpoint:** `GET /workflows/templates/categories`

**Response:** `200 OK`
```json
[
  "Assignment",
  "Communication",
  "Interviews",
  "Notifications",
  "Offers",
  "Rejection",
  "Screening"
]
```

---

### Get Template by Name
Get a specific template by name.

**Endpoint:** `GET /workflows/templates/:name`

**Example:** `GET /workflows/templates/Auto-Screen%20High%20Match%20Candidates`

**Response:** `200 OK`
```json
{
  "name": "Auto-Screen High Match Candidates",
  "description": "Automatically move candidates with match score >= 80 to phone screen stage",
  "category": "Screening",
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
        "stageId": "phone_screen_stage_id"
      }
    },
    {
      "type": "send_notification",
      "config": {
        "userId": "recruiter_id",
        "message": "High-match candidate automatically moved to phone screen"
      }
    }
  ]
}
```

---

### Create Workflow from Template
Create a new workflow based on a template.

**Endpoint:** `POST /workflows/templates/:name/create`

**Request Body:** (optional customizations)
```json
{
  "name": "Custom workflow name",
  "description": "Custom description",
  "active": true,
  "triggerConfig": {
    "jobId": "specific-job-id"
  },
  "conditions": [
    {
      "field": "customFields.matchScore",
      "operator": "greater_than",
      "value": 85
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "workflow-uuid",
  "name": "Custom workflow name",
  "description": "Custom description",
  ...
}
```

---

## Data Types

### Trigger Types
```typescript
enum WorkflowTriggerType {
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
```

### Action Types
```typescript
enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  MOVE_TO_STAGE = 'move_to_stage',
  SEND_NOTIFICATION = 'send_notification',
  CREATE_TASK = 'create_task',
  UPDATE_FIELD = 'update_field',
  ASSIGN_USER = 'assign_user',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
}
```

### Condition Operators
```typescript
enum WorkflowConditionOperator {
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
```

### Execution Status
```typescript
enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Workflow must have at least one action",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Workflow with ID workflow-uuid not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- Standard: 100 requests per minute
- Burst: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637064000
```
