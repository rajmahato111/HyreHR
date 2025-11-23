# SLA Management API Documentation

## Base URL
```
/sla
```

All endpoints require authentication via JWT token in the Authorization header.

## SLA Rules

### Create SLA Rule

Creates a new SLA rule for the organization.

**Endpoint:** `POST /sla/rules`

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "type": "enum (required)",
  "thresholdHours": "number (required, min: 1)",
  "alertRecipients": "string[] (required)",
  "escalationRecipients": "string[] (optional)",
  "escalationHours": "number (optional, min: 1)",
  "active": "boolean (optional, default: true)",
  "jobIds": "string[] (optional)",
  "departmentIds": "string[] (optional)"
}
```

**SLA Types:**
- `time_to_first_review`
- `time_to_schedule_interview`
- `time_to_provide_feedback`
- `time_to_offer`
- `time_to_hire`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "24-Hour Application Review",
  "description": "All applications must be reviewed within 24 hours",
  "type": "time_to_first_review",
  "thresholdHours": 24,
  "alertRecipients": ["recruiter@company.com"],
  "escalationRecipients": ["manager@company.com"],
  "escalationHours": 48,
  "active": true,
  "jobIds": null,
  "departmentIds": null,
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

---

### Get All SLA Rules

Retrieves all SLA rules for the organization with optional filters.

**Endpoint:** `GET /sla/rules`

**Query Parameters:**
- `type` (optional): Filter by SLA type
- `active` (optional): Filter by active status (true/false)
- `jobId` (optional): Filter rules applicable to specific job
- `departmentId` (optional): Filter rules applicable to specific department

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "24-Hour Application Review",
    "type": "time_to_first_review",
    "thresholdHours": 24,
    "alertRecipients": ["recruiter@company.com"],
    "active": true,
    "createdAt": "2025-11-16T10:00:00Z"
  }
]
```

---

### Get SLA Rule by ID

Retrieves a specific SLA rule.

**Endpoint:** `GET /sla/rules/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "24-Hour Application Review",
  "description": "All applications must be reviewed within 24 hours",
  "type": "time_to_first_review",
  "thresholdHours": 24,
  "alertRecipients": ["recruiter@company.com"],
  "escalationRecipients": ["manager@company.com"],
  "escalationHours": 48,
  "active": true,
  "jobIds": null,
  "departmentIds": null,
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "SLA rule with ID {id} not found"
}
```

---

### Update SLA Rule

Updates an existing SLA rule.

**Endpoint:** `PUT /sla/rules/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "string",
  "description": "string",
  "thresholdHours": "number",
  "alertRecipients": "string[]",
  "escalationRecipients": "string[]",
  "escalationHours": "number",
  "active": "boolean",
  "jobIds": "string[]",
  "departmentIds": "string[]"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Updated Rule Name",
  "thresholdHours": 48,
  "active": true,
  "updatedAt": "2025-11-16T11:00:00Z"
}
```

---

### Delete SLA Rule

Deletes an SLA rule. This will also delete all associated violations.

**Endpoint:** `DELETE /sla/rules/:id`

**Response:** `200 OK`
```json
{
  "message": "SLA rule deleted successfully"
}
```

---

## SLA Violations

### Get All Violations

Retrieves all SLA violations for the organization with optional filters.

**Endpoint:** `GET /sla/violations`

**Query Parameters:**
- `slaRuleId` (optional): Filter by SLA rule
- `entityType` (optional): Filter by entity type (application, interview, offer)
- `entityId` (optional): Filter by specific entity
- `status` (optional): Filter by status (open, acknowledged, resolved)
- `escalated` (optional): Filter by escalation status (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "slaRuleId": "uuid",
    "entityType": "application",
    "entityId": "uuid",
    "violatedAt": "2025-11-16T10:00:00Z",
    "expectedAt": "2025-11-15T10:00:00Z",
    "actualHours": 48.5,
    "status": "open",
    "escalated": false,
    "slaRule": {
      "id": "uuid",
      "name": "24-Hour Application Review",
      "type": "time_to_first_review"
    },
    "createdAt": "2025-11-16T10:00:00Z"
  }
]
```

---

### Get Violation by ID

Retrieves a specific SLA violation.

**Endpoint:** `GET /sla/violations/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "slaRuleId": "uuid",
  "entityType": "application",
  "entityId": "uuid",
  "violatedAt": "2025-11-16T10:00:00Z",
  "expectedAt": "2025-11-15T10:00:00Z",
  "actualHours": 48.5,
  "status": "open",
  "acknowledgedAt": null,
  "acknowledgedBy": null,
  "resolvedAt": null,
  "resolvedBy": null,
  "escalated": false,
  "escalatedAt": null,
  "notes": null,
  "slaRule": {
    "id": "uuid",
    "name": "24-Hour Application Review",
    "type": "time_to_first_review",
    "thresholdHours": 24
  },
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

---

### Acknowledge Violation

Marks a violation as acknowledged by the current user.

**Endpoint:** `PUT /sla/violations/:id/acknowledge`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "acknowledged",
  "acknowledgedAt": "2025-11-16T11:00:00Z",
  "acknowledgedBy": "user-uuid",
  "updatedAt": "2025-11-16T11:00:00Z"
}
```

---

### Resolve Violation

Marks a violation as resolved with optional notes.

**Endpoint:** `PUT /sla/violations/:id/resolve`

**Request Body:**
```json
{
  "notes": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "resolved",
  "resolvedAt": "2025-11-16T12:00:00Z",
  "resolvedBy": "user-uuid",
  "notes": "Application reviewed and moved to phone screen stage",
  "updatedAt": "2025-11-16T12:00:00Z"
}
```

---

## Metrics

### Get Compliance Metrics

Retrieves SLA compliance metrics for the organization.

**Endpoint:** `GET /sla/metrics/compliance`

**Query Parameters:**
- `startDate` (optional): Start date for metrics (ISO 8601 format)
- `endDate` (optional): End date for metrics (ISO 8601 format)

**Response:** `200 OK`
```json
{
  "summary": {
    "totalViolations": 45,
    "openViolations": 12,
    "resolvedViolations": 30,
    "escalatedViolations": 3
  },
  "byType": [
    {
      "type": "time_to_first_review",
      "totalViolations": 20,
      "openViolations": 5,
      "escalatedViolations": 1,
      "averageDelayHours": 36.5
    },
    {
      "type": "time_to_schedule_interview",
      "totalViolations": 15,
      "openViolations": 4,
      "escalatedViolations": 2,
      "averageDelayHours": 52.3
    },
    {
      "type": "time_to_provide_feedback",
      "totalViolations": 10,
      "openViolations": 3,
      "escalatedViolations": 0,
      "averageDelayHours": 18.7
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "thresholdHours",
      "message": "thresholdHours must be at least 1"
    }
  ]
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
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Rate Limiting

All API endpoints are subject to rate limiting:
- Standard: 100 requests per minute
- Burst: 200 requests per minute

When rate limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "Too many requests"
}
```

---

## Webhooks (Future Enhancement)

SLA violations can trigger webhooks to external systems:

**Webhook Payload:**
```json
{
  "event": "sla.violation.created",
  "timestamp": "2025-11-16T10:00:00Z",
  "data": {
    "violationId": "uuid",
    "ruleId": "uuid",
    "ruleName": "24-Hour Application Review",
    "entityType": "application",
    "entityId": "uuid",
    "actualHours": 48.5,
    "thresholdHours": 24
  }
}
```

---

## Examples

### Create a Complete SLA Rule
```bash
curl -X POST http://localhost:3000/sla/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Fast Track",
    "description": "Engineering applications reviewed within 12 hours",
    "type": "time_to_first_review",
    "thresholdHours": 12,
    "alertRecipients": ["eng-recruiting@company.com", "eng-manager@company.com"],
    "escalationRecipients": ["vp-engineering@company.com"],
    "escalationHours": 24,
    "active": true,
    "departmentIds": ["engineering-dept-uuid"]
  }'
```

### Get Open Violations for an Application
```bash
curl -X GET "http://localhost:3000/sla/violations?entityType=application&entityId=app-uuid&status=open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Compliance Metrics for Last Month
```bash
curl -X GET "http://localhost:3000/sla/metrics/compliance?startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
