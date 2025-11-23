# Integration Framework Quick Start

This guide will help you quickly set up and use the Integration Framework.

## Setup

### 1. Environment Configuration

Add these environment variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/integrations/oauth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/v1/integrations/oauth/microsoft/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/v1/integrations/oauth/linkedin/callback

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_32_byte_hex_encryption_key
```

### 2. Run Database Migration

```bash
npm run migration:run
```

### 3. Import Module

The IntegrationsModule is already imported in your app.module.ts.

## Common Use Cases

### Setting Up Google Calendar Integration

#### Step 1: Create Integration

```bash
curl -X POST http://localhost:3000/api/v1/integrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google Calendar",
    "provider": "google_calendar",
    "authType": "oauth2",
    "config": {
      "calendarId": "primary"
    }
  }'
```

Response:
```json
{
  "id": "integration-uuid",
  "status": "pending"
}
```

#### Step 2: Get OAuth URL

```bash
curl -X GET "http://localhost:3000/api/v1/integrations/integration-uuid/oauth/authorize" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### Step 3: User Authorizes

Direct the user to the `authUrl`. After authorization, Google redirects back with a code.

#### Step 4: Complete OAuth Flow

```bash
curl -X POST http://localhost:3000/api/v1/integrations/integration-uuid/oauth/callback \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "authorization_code_from_google"
  }'
```

Response:
```json
{
  "success": true,
  "message": "OAuth authentication successful"
}
```

The integration status is now `active` and ready to use!

### Setting Up Webhooks

#### Create a Webhook

```bash
curl -X POST http://localhost:3000/api/v1/integrations/webhooks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Application Events",
    "url": "https://your-domain.com/webhooks/applications",
    "events": [
      "application.created",
      "application.stage_changed",
      "application.hired"
    ],
    "retryAttempts": 3,
    "timeoutMs": 30000
  }'
```

Response:
```json
{
  "id": "webhook-uuid",
  "secret": "generated_webhook_secret",
  "status": "active"
}
```

**Save the secret!** You'll need it to verify webhook signatures.

#### Test the Webhook

```bash
curl -X POST http://localhost:3000/api/v1/integrations/webhooks/webhook-uuid/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "Webhook test successful",
  "responseStatus": 200
}
```

### Receiving Webhooks

#### Webhook Payload Example

```json
{
  "event": "application.created",
  "timestamp": "2025-11-16T10:30:00Z",
  "organizationId": "org-uuid",
  "data": {
    "applicationId": "app-uuid",
    "candidateId": "candidate-uuid",
    "jobId": "job-uuid",
    "stageId": "stage-uuid"
  }
}
```

#### Verify Webhook Signature (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhooks/applications', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  const secret = 'your_webhook_secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  console.log('Received event:', payload.event);
  console.log('Data:', payload.data);
  
  res.status(200).json({ received: true });
});
```

### Triggering Webhooks from Your Code

```typescript
import { WebhookService } from './modules/integrations/webhook.service';
import { WebhookEvent } from './database/entities';

// In your service
async createApplication(data: CreateApplicationDto) {
  const application = await this.applicationRepository.save(data);
  
  // Trigger webhooks
  await this.webhookService.trigger(
    application.organizationId,
    WebhookEvent.APPLICATION_CREATED,
    {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      stageId: application.stageId,
      timestamp: new Date().toISOString(),
    }
  );
  
  return application;
}
```

### Monitoring Integration Health

#### Check Health Status

```bash
curl -X GET http://localhost:3000/api/v1/integrations/integration-uuid/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "status": "healthy",
  "lastCheckAt": "2025-11-16T10:25:00Z",
  "lastError": null
}
```

#### Perform Manual Health Check

```bash
curl -X POST http://localhost:3000/api/v1/integrations/integration-uuid/health/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "integrationId": "integration-uuid",
  "provider": "google_calendar",
  "status": "healthy",
  "responseTime": 245,
  "checkedAt": "2025-11-16T10:30:00Z"
}
```

### Viewing Webhook Logs

```bash
curl -X GET "http://localhost:3000/api/v1/integrations/webhooks/webhook-uuid/logs?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
[
  {
    "id": "log-uuid",
    "event": "application.created",
    "status": "success",
    "responseStatus": 200,
    "attemptCount": 1,
    "durationMs": 245,
    "createdAt": "2025-11-16T10:30:00Z"
  }
]
```

### Viewing Webhook Statistics

```bash
curl -X GET http://localhost:3000/api/v1/integrations/webhooks/webhook-uuid/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "total": 152,
  "success": 150,
  "failed": 2,
  "pending": 0,
  "successRate": 98.68
}
```

## Available Webhook Events

- `application.created` - New application submitted
- `application.stage_changed` - Application moved to different stage
- `application.rejected` - Application rejected
- `application.hired` - Candidate hired
- `interview.scheduled` - Interview scheduled
- `interview.completed` - Interview completed
- `interview.cancelled` - Interview cancelled
- `offer.created` - Offer created
- `offer.sent` - Offer sent to candidate
- `offer.accepted` - Offer accepted
- `offer.declined` - Offer declined
- `candidate.created` - New candidate added
- `candidate.updated` - Candidate information updated
- `job.created` - New job created
- `job.opened` - Job opened for applications
- `job.closed` - Job closed

## Supported Integration Providers

- `google_calendar` - Google Calendar
- `microsoft_calendar` - Microsoft Outlook Calendar
- `bamboohr` - BambooHR HRIS
- `workday` - Workday HRIS
- `rippling` - Rippling HRIS
- `docusign` - DocuSign E-Signature
- `hellosign` - HelloSign E-Signature
- `linkedin` - LinkedIn Job Posting
- `indeed` - Indeed Job Posting
- `glassdoor` - Glassdoor Job Posting
- `slack` - Slack Notifications
- `teams` - Microsoft Teams Notifications
- `gmail` - Gmail Email
- `outlook` - Outlook Email

## Troubleshooting

### OAuth Fails

1. Verify environment variables are set correctly
2. Check redirect URI matches exactly (including protocol and port)
3. Ensure OAuth app is configured in provider's console
4. Check browser console for errors

### Webhook Not Receiving Events

1. Verify webhook URL is publicly accessible
2. Check webhook status is `active`
3. Ensure events are configured correctly
4. Review webhook logs for errors

### Integration Shows as Unhealthy

1. Check credentials are valid
2. Verify API endpoints are accessible
3. Review last error message
4. Perform manual health check for details

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [API.md](./API.md) for complete API reference
- Review integration-specific documentation for advanced features
