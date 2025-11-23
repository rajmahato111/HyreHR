# Integration Framework API Documentation

## Base URL

```
/api/v1/integrations
```

## Authentication

All endpoints require JWT authentication and appropriate permissions.

## Endpoints

### Integration Configuration

#### Create Integration

```http
POST /integrations
```

**Request Body:**
```json
{
  "name": "Google Calendar",
  "provider": "google_calendar",
  "authType": "oauth2",
  "config": {
    "calendarId": "primary"
  },
  "settings": {
    "syncEnabled": true
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Google Calendar",
  "provider": "google_calendar",
  "status": "pending",
  "authType": "oauth2",
  "config": {},
  "settings": {},
  "createdAt": "2025-11-16T10:30:00Z",
  "updatedAt": "2025-11-16T10:30:00Z"
}
```

#### List Integrations

```http
GET /integrations
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Google Calendar",
    "provider": "google_calendar",
    "status": "active",
    "lastHealthCheckAt": "2025-11-16T10:25:00Z",
    "healthStatus": "healthy"
  }
]
```

#### Get Integration

```http
GET /integrations/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Google Calendar",
  "provider": "google_calendar",
  "status": "active",
  "authType": "oauth2",
  "config": {},
  "settings": {},
  "lastSyncAt": "2025-11-16T10:20:00Z",
  "lastHealthCheckAt": "2025-11-16T10:25:00Z",
  "healthStatus": "healthy",
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:25:00Z"
}
```

#### Get Integrations by Provider

```http
GET /integrations/provider/:provider
```

**Example:**
```http
GET /integrations/provider/google_calendar
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Google Calendar",
    "provider": "google_calendar",
    "status": "active"
  }
]
```

#### Update Integration

```http
PUT /integrations/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "active",
  "settings": {
    "syncEnabled": false
  }
}
```

**Response:** `200 OK`

#### Delete Integration

```http
DELETE /integrations/:id
```

**Response:** `204 No Content`

### OAuth Flow

#### Get OAuth Authorization URL

```http
GET /integrations/:id/oauth/authorize?state=optional_state
```

**Response:** `200 OK`
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

#### Handle OAuth Callback

```http
POST /integrations/:id/oauth/callback
```

**Request Body:**
```json
{
  "code": "authorization_code",
  "state": "optional_state"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OAuth authentication successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "access_denied",
  "errorDescription": "User denied access"
}
```

#### Refresh OAuth Token

```http
POST /integrations/:id/oauth/refresh
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

### Webhook Management

#### Create Webhook

```http
POST /integrations/webhooks
```

**Request Body:**
```json
{
  "name": "Application Events",
  "url": "https://example.com/webhooks/applications",
  "events": [
    "application.created",
    "application.stage_changed"
  ],
  "secret": "optional_secret",
  "headers": {
    "X-Custom-Header": "value"
  },
  "retryAttempts": 3,
  "timeoutMs": 30000,
  "integrationId": "optional_uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Application Events",
  "url": "https://example.com/webhooks/applications",
  "secret": "generated_or_provided_secret",
  "status": "active",
  "events": ["application.created", "application.stage_changed"],
  "retryAttempts": 3,
  "timeoutMs": 30000,
  "successCount": 0,
  "failureCount": 0,
  "createdAt": "2025-11-16T10:30:00Z"
}
```

#### List Webhooks

```http
GET /integrations/webhooks
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Application Events",
    "url": "https://example.com/webhooks/applications",
    "status": "active",
    "events": ["application.created"],
    "successCount": 150,
    "failureCount": 2,
    "lastSuccessAt": "2025-11-16T10:25:00Z"
  }
]
```

#### Get Webhook

```http
GET /integrations/webhooks/:id
```

**Response:** `200 OK`

#### Update Webhook

```http
PUT /integrations/webhooks/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "inactive",
  "events": ["application.created", "application.hired"]
}
```

**Response:** `200 OK`

#### Delete Webhook

```http
DELETE /integrations/webhooks/:id
```

**Response:** `204 No Content`

#### Test Webhook

```http
POST /integrations/webhooks/:id/test
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook test successful",
  "responseStatus": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Connection timeout",
  "responseStatus": null
}
```

#### Get Webhook Logs

```http
GET /integrations/webhooks/:id/logs?limit=100
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "webhookId": "uuid",
    "event": "application.created",
    "status": "success",
    "responseStatus": 200,
    "attemptCount": 1,
    "durationMs": 245,
    "createdAt": "2025-11-16T10:30:00Z",
    "completedAt": "2025-11-16T10:30:00Z"
  },
  {
    "id": "uuid",
    "webhookId": "uuid",
    "event": "application.stage_changed",
    "status": "failed",
    "responseStatus": 500,
    "attemptCount": 3,
    "error": "Internal Server Error",
    "durationMs": 1500,
    "createdAt": "2025-11-16T10:25:00Z",
    "completedAt": "2025-11-16T10:25:05Z"
  }
]
```

#### Get Webhook Statistics

```http
GET /integrations/webhooks/:id/stats
```

**Response:** `200 OK`
```json
{
  "total": 152,
  "success": 150,
  "failed": 2,
  "pending": 0,
  "successRate": 98.68
}
```

### Health Monitoring

#### Get Health Status

```http
GET /integrations/:id/health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "lastCheckAt": "2025-11-16T10:25:00Z",
  "lastError": null
}
```

**Degraded Status:**
```json
{
  "status": "degraded",
  "lastCheckAt": "2025-11-16T10:25:00Z",
  "lastError": "Rate limit exceeded"
}
```

**Unhealthy Status:**
```json
{
  "status": "unhealthy",
  "lastCheckAt": "2025-11-16T10:25:00Z",
  "lastError": "Authentication failed: Invalid credentials"
}
```

#### Perform Health Check

```http
POST /integrations/:id/health/check
```

**Response:** `200 OK`
```json
{
  "integrationId": "uuid",
  "provider": "google_calendar",
  "status": "healthy",
  "responseTime": 245,
  "checkedAt": "2025-11-16T10:30:00Z"
}
```

### Webhook Trigger (Internal)

```http
POST /integrations/webhooks/trigger
```

**Request Body:**
```json
{
  "event": "application.created",
  "payload": {
    "applicationId": "uuid",
    "candidateId": "uuid",
    "jobId": "uuid",
    "timestamp": "2025-11-16T10:30:00Z"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook triggered successfully"
}
```

## Webhook Payload Format

All webhook deliveries follow this format:

```json
{
  "event": "application.created",
  "timestamp": "2025-11-16T10:30:00Z",
  "organizationId": "uuid",
  "data": {
    "applicationId": "uuid",
    "candidateId": "uuid",
    "jobId": "uuid",
    "stageId": "uuid"
  }
}
```

## Webhook Headers

Webhooks include these headers:

```
Content-Type: application/json
X-Webhook-Signature: sha256_hmac_signature
X-Webhook-Event: application.created
X-Webhook-Id: webhook_uuid
X-Webhook-Attempt: 1
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Integration not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limits

- Standard: 100 requests per minute
- Burst: 200 requests per minute

## Permissions

Required permissions for each endpoint:

- `integrations:create` - Create integrations and webhooks
- `integrations:read` - View integrations and webhooks
- `integrations:update` - Update integrations and webhooks
- `integrations:delete` - Delete integrations and webhooks
