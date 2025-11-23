# Integration Framework

The Integration Framework provides a unified system for managing third-party integrations, OAuth authentication, webhook management, and health monitoring.

## Features

- **Integration Configuration Management**: Store and manage integration configurations securely
- **OAuth 2.0 Flow**: Complete OAuth implementation for third-party services
- **Webhook Management**: Create, manage, and monitor webhooks with automatic retries
- **Health Monitoring**: Automated health checks for all integrations
- **Credential Encryption**: Secure storage of API keys and tokens

## Supported Integrations

### Calendar Integrations
- Google Calendar
- Microsoft Outlook/Office 365

### HRIS Integrations
- BambooHR
- Workday
- Rippling

### E-Signature
- DocuSign
- HelloSign

### Job Boards
- LinkedIn
- Indeed
- Glassdoor

### Communication
- Gmail
- Outlook
- Slack
- Microsoft Teams

## Architecture

### Components

1. **IntegrationConfigService**: Manages integration configurations and credentials
2. **OAuthService**: Handles OAuth 2.0 authentication flows
3. **WebhookService**: Manages webhook subscriptions and delivery
4. **IntegrationHealthService**: Monitors integration health and availability

### Database Schema

**integrations**
- Stores integration configurations
- Encrypted credentials
- Health status and error tracking

**webhooks**
- Webhook subscriptions
- Event filters
- Retry configuration

**webhook_logs**
- Webhook delivery logs
- Success/failure tracking
- Response data

## Usage

### Creating an Integration

```typescript
POST /integrations
{
  "name": "Google Calendar",
  "provider": "google_calendar",
  "authType": "oauth2",
  "config": {
    "calendarId": "primary"
  }
}
```

### OAuth Flow

1. Get authorization URL:
```typescript
GET /integrations/:id/oauth/authorize
```

2. User authorizes and is redirected back with code

3. Exchange code for tokens:
```typescript
POST /integrations/:id/oauth/callback
{
  "code": "authorization_code"
}
```

### Creating a Webhook

```typescript
POST /integrations/webhooks
{
  "name": "Application Created Webhook",
  "url": "https://example.com/webhooks/applications",
  "events": ["application.created", "application.stage_changed"],
  "secret": "webhook_secret",
  "retryAttempts": 3,
  "timeoutMs": 30000
}
```

### Triggering Webhooks

Webhooks are automatically triggered when events occur:

```typescript
await webhookService.trigger(
  organizationId,
  WebhookEvent.APPLICATION_CREATED,
  {
    applicationId: 'uuid',
    candidateId: 'uuid',
    jobId: 'uuid',
    timestamp: new Date().toISOString()
  }
);
```

### Health Monitoring

Health checks run automatically every 5 minutes. Manual checks:

```typescript
POST /integrations/:id/health/check
```

Get health status:

```typescript
GET /integrations/:id/health
```

## Webhook Events

Available webhook events:

- `application.created`
- `application.stage_changed`
- `application.rejected`
- `application.hired`
- `interview.scheduled`
- `interview.completed`
- `interview.cancelled`
- `offer.created`
- `offer.sent`
- `offer.accepted`
- `offer.declined`
- `candidate.created`
- `candidate.updated`
- `job.created`
- `job.opened`
- `job.closed`

## Webhook Payload Format

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

## Webhook Security

Webhooks include a signature header for verification:

```
X-Webhook-Signature: sha256_hmac_signature
X-Webhook-Event: application.created
X-Webhook-Id: webhook_uuid
```

Verify signature:

```typescript
const isValid = webhookService.verifySignature(
  payload,
  signature,
  secret
);
```

## Error Handling

### Integration Errors

Integrations track errors and automatically update status:

- `active`: Integration is working
- `error`: Integration has errors
- `inactive`: Integration is disabled
- `pending`: Integration is being set up

### Webhook Retries

Failed webhooks are automatically retried with exponential backoff:

1. Immediate attempt
2. Retry after 1 second
3. Retry after 2 seconds
4. Retry after 4 seconds (if retryAttempts = 3)

After all retries fail, webhook is marked as failed.

## Best Practices

1. **Secure Credentials**: Always use encrypted storage for API keys and tokens
2. **Token Refresh**: Implement automatic token refresh for OAuth integrations
3. **Webhook Idempotency**: Design webhook handlers to be idempotent
4. **Error Monitoring**: Monitor integration health and webhook failures
5. **Rate Limiting**: Respect third-party API rate limits
6. **Timeout Configuration**: Set appropriate timeouts for webhook delivery

## Configuration

Environment variables required:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=https://your-domain.com/oauth/microsoft/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://your-domain.com/oauth/linkedin/callback

# Encryption
ENCRYPTION_KEY=your_encryption_key
```

## Testing

Test webhook delivery:

```typescript
POST /integrations/webhooks/:id/test
```

View webhook logs:

```typescript
GET /integrations/webhooks/:id/logs?limit=100
```

View webhook statistics:

```typescript
GET /integrations/webhooks/:id/stats
```

## Monitoring

Monitor integration health:

- Check `lastHealthCheckAt` timestamp
- Review `healthStatus` field
- Monitor `lastError` and `lastErrorAt`
- Track webhook success/failure rates

## Troubleshooting

### OAuth Failures

1. Verify client ID and secret
2. Check redirect URI matches configuration
3. Ensure scopes are correct
4. Check token expiration

### Webhook Failures

1. Verify webhook URL is accessible
2. Check webhook signature verification
3. Review webhook logs for errors
4. Ensure timeout is sufficient
5. Check retry configuration

### Health Check Failures

1. Verify credentials are valid
2. Check API endpoint availability
3. Review rate limiting
4. Check network connectivity
