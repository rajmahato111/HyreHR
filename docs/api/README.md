# API Documentation

Welcome to the Recruiting Platform API documentation. This comprehensive guide will help you integrate with our platform and build powerful recruiting solutions.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [SDKs and Libraries](#sdks-and-libraries)
- [Examples](#examples)
- [Support](#support)

## Getting Started

### Base URLs

- **Production**: `https://api.platform.com/v1`
- **Staging**: `https://api-staging.platform.com/v1`
- **Local Development**: `http://localhost:3000/v1`

### Interactive Documentation

Access our interactive Swagger/OpenAPI documentation:
- Production: `https://api.platform.com/api/docs`
- Local: `http://localhost:3000/api/docs`

### Quick Start

1. **Create an account** at [platform.com](https://platform.com)
2. **Generate API credentials** in Settings → API Keys
3. **Make your first request**:

```bash
curl -X GET "https://api.platform.com/v1/jobs" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Authentication

The API supports multiple authentication methods:

### JWT Bearer Token (Recommended)

Include your JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtaining a token:**

```bash
curl -X POST "https://api.platform.com/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "your_password"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "role": "recruiter"
  }
}
```

### OAuth 2.0

For third-party integrations, use OAuth 2.0 authorization code flow:

1. **Redirect users to authorization URL:**
```
https://api.platform.com/auth/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code&
  scope=read:jobs write:applications
```

2. **Exchange authorization code for access token:**
```bash
curl -X POST "https://api.platform.com/auth/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "YOUR_REDIRECT_URI"
  }'
```

### API Keys

For server-to-server integrations:

```http
X-API-Key: your_api_key_here
```

## API Reference

### Core Resources

#### Jobs

Manage job requisitions and postings.

**List Jobs**
```http
GET /v1/jobs
```

Query Parameters:
- `status` (string): Filter by status (draft, open, on_hold, closed, cancelled)
- `departmentId` (uuid): Filter by department
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Create Job**
```http
POST /v1/jobs
```

Request Body:
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "departmentId": "uuid",
  "locationIds": ["uuid"],
  "employmentType": "full_time",
  "remoteOk": true,
  "salaryRange": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  }
}
```

#### Candidates

Manage candidate profiles and information.

**Search Candidates**
```http
GET /v1/candidates/search
```

Query Parameters:
- `q` (string): Search query with boolean operators
- `skills` (string[]): Filter by skills
- `location` (string): Filter by location
- `experience` (number): Minimum years of experience
- `page` (number): Page number
- `limit` (number): Items per page

**Create Candidate**
```http
POST /v1/candidates
```

Request Body:
```json
{
  "email": "candidate@email.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "currentTitle": "Software Engineer",
  "currentCompany": "Tech Corp",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "tags": ["javascript", "react", "node.js"]
}
```

#### Applications

Manage candidate applications and pipeline stages.

**Move Application to Stage**
```http
POST /v1/applications/:id/move
```

Request Body:
```json
{
  "stageId": "uuid",
  "notes": "Moving to technical interview"
}
```

**Bulk Operations**
```http
POST /v1/applications/bulk
```

Request Body:
```json
{
  "action": "move",
  "applicationIds": ["uuid1", "uuid2"],
  "stageId": "uuid"
}
```

#### Interviews

Schedule and manage interviews.

**Schedule Interview**
```http
POST /v1/interviews
```

Request Body:
```json
{
  "applicationId": "uuid",
  "scheduledAt": "2025-11-20T14:00:00Z",
  "durationMinutes": 60,
  "locationType": "video",
  "meetingLink": "https://zoom.us/j/123456",
  "participants": [
    {
      "userId": "uuid",
      "role": "interviewer"
    }
  ]
}
```

**Submit Feedback**
```http
POST /v1/interviews/:id/feedback
```

Request Body:
```json
{
  "overallRating": 4,
  "decision": "yes",
  "strengths": "Strong technical skills...",
  "concerns": "Limited experience with...",
  "attributeRatings": [
    {
      "attributeId": "uuid",
      "rating": 5
    }
  ]
}
```

### AI-Powered Features

#### Resume Parsing

**Parse Resume**
```http
POST /v1/ai/parse-resume
```

Request: Multipart form data with file upload

Response:
```json
{
  "parsedData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@email.com",
    "phone": "+1234567890",
    "experience": [
      {
        "company": "Tech Corp",
        "title": "Software Engineer",
        "startDate": "2020-01",
        "endDate": "2023-12",
        "description": "..."
      }
    ],
    "education": [...],
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "confidence": {
    "overall": 0.92,
    "fields": {
      "name": 0.98,
      "email": 0.99,
      "experience": 0.89
    }
  }
}
```

#### Candidate Matching

**Calculate Match Score**
```http
POST /v1/ai/match
```

Request Body:
```json
{
  "candidateId": "uuid",
  "jobId": "uuid"
}
```

Response:
```json
{
  "overall": 85,
  "breakdown": {
    "skills": 90,
    "experience": 85,
    "education": 80,
    "location": 100,
    "title": 75
  },
  "skillGaps": ["Kubernetes", "AWS"],
  "matchReasons": [
    "Strong match on required skills: React, Node.js, TypeScript",
    "5 years experience meets requirement",
    "Located in target market"
  ]
}
```

#### AI Email Generation

**Generate Email**
```http
POST /v1/ai/generate-email
```

Request Body:
```json
{
  "type": "outreach",
  "candidateId": "uuid",
  "jobId": "uuid",
  "tone": "professional",
  "context": "Initial outreach for senior role"
}
```

Response:
```json
{
  "subject": "Exciting Senior Software Engineer Opportunity at TechCorp",
  "body": "Hi John,\n\nI came across your profile...",
  "personalizationTokens": {
    "candidateName": "John",
    "jobTitle": "Senior Software Engineer",
    "companyName": "TechCorp"
  }
}
```

## Rate Limiting

API requests are rate limited to ensure fair usage:

- **Standard tier**: 100 requests per minute
- **Burst allowance**: 200 requests per minute (short bursts)
- **Enterprise tier**: Custom limits

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637251200
```

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 60 seconds.",
    "retryAfter": 60
  }
}
```

## Webhooks

Subscribe to real-time events via webhooks.

### Creating a Webhook

```http
POST /v1/integrations/webhooks
```

Request Body:
```json
{
  "url": "https://your-app.com/webhooks",
  "events": [
    "application.created",
    "application.stage_changed",
    "interview.scheduled",
    "offer.accepted"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

Available events:
- `application.created`
- `application.stage_changed`
- `application.rejected`
- `application.hired`
- `interview.scheduled`
- `interview.completed`
- `interview.cancelled`
- `feedback.submitted`
- `offer.sent`
- `offer.accepted`
- `offer.declined`
- `candidate.created`
- `candidate.updated`
- `job.opened`
- `job.closed`

### Webhook Payload

```json
{
  "id": "evt_123456",
  "type": "application.stage_changed",
  "timestamp": "2025-11-17T10:30:00Z",
  "data": {
    "applicationId": "uuid",
    "candidateId": "uuid",
    "jobId": "uuid",
    "fromStage": "phone_screen",
    "toStage": "technical_interview",
    "movedBy": "user_uuid"
  }
}
```

### Verifying Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Express middleware example
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  res.status(200).send('OK');
});
```

## SDKs and Libraries

Official SDKs are available for popular languages:

### JavaScript/TypeScript

```bash
npm install @recruiting-platform/sdk
```

```typescript
import { RecruitingPlatform } from '@recruiting-platform/sdk';

const client = new RecruitingPlatform({
  apiKey: 'your_api_key',
  environment: 'production'
});

// List jobs
const jobs = await client.jobs.list({ status: 'open' });

// Create candidate
const candidate = await client.candidates.create({
  email: 'candidate@email.com',
  firstName: 'John',
  lastName: 'Doe'
});
```

### Python

```bash
pip install recruiting-platform
```

```python
from recruiting_platform import RecruitingPlatform

client = RecruitingPlatform(api_key='your_api_key')

# List jobs
jobs = client.jobs.list(status='open')

# Create candidate
candidate = client.candidates.create(
    email='candidate@email.com',
    first_name='John',
    last_name='Doe'
)
```

### Ruby

```bash
gem install recruiting_platform
```

```ruby
require 'recruiting_platform'

client = RecruitingPlatform::Client.new(api_key: 'your_api_key')

# List jobs
jobs = client.jobs.list(status: 'open')

# Create candidate
candidate = client.candidates.create(
  email: 'candidate@email.com',
  first_name: 'John',
  last_name: 'Doe'
)
```

## Examples

### Complete Application Flow

```javascript
// 1. Create a candidate
const candidate = await client.candidates.create({
  email: 'jane@email.com',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '+1234567890'
});

// 2. Parse their resume
const resumeData = await client.ai.parseResume({
  candidateId: candidate.id,
  file: resumeFile
});

// 3. Create an application
const application = await client.applications.create({
  candidateId: candidate.id,
  jobId: 'job-uuid',
  source: { type: 'referral' }
});

// 4. Calculate match score
const matchScore = await client.ai.calculateMatch({
  candidateId: candidate.id,
  jobId: 'job-uuid'
});

// 5. Move to next stage if good match
if (matchScore.overall >= 75) {
  await client.applications.move(application.id, {
    stageId: 'phone-screen-stage-uuid'
  });
}

// 6. Schedule interview
const interview = await client.interviews.create({
  applicationId: application.id,
  scheduledAt: '2025-11-20T14:00:00Z',
  durationMinutes: 30,
  locationType: 'phone'
});

// 7. Send confirmation email
await client.communication.sendEmail({
  candidateId: candidate.id,
  templateId: 'interview-confirmation-template',
  variables: {
    interviewDate: interview.scheduledAt,
    interviewType: 'Phone Screen'
  }
});
```

### Bulk Operations

```javascript
// Get all applications in a specific stage
const applications = await client.applications.list({
  jobId: 'job-uuid',
  stageId: 'applied-stage-uuid',
  limit: 100
});

// Calculate match scores for all
const matchScores = await Promise.all(
  applications.map(app => 
    client.ai.calculateMatch({
      candidateId: app.candidateId,
      jobId: app.jobId
    })
  )
);

// Move high-scoring candidates to next stage
const highScorers = applications.filter((app, i) => 
  matchScores[i].overall >= 80
);

await client.applications.bulk({
  action: 'move',
  applicationIds: highScorers.map(app => app.id),
  stageId: 'phone-screen-stage-uuid'
});
```

### Webhook Integration

```javascript
const express = require('express');
const app = express();

app.post('/webhooks/recruiting-platform', express.json(), (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'application.created':
      // Notify team in Slack
      notifySlack(`New application from ${event.data.candidateName}`);
      break;
      
    case 'interview.scheduled':
      // Add to team calendar
      addToCalendar(event.data);
      break;
      
    case 'offer.accepted':
      // Trigger onboarding workflow
      startOnboarding(event.data.candidateId);
      break;
  }
  
  res.status(200).send('OK');
});
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2025-11-17T10:30:00Z"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

### Retry Logic

Implement exponential backoff for failed requests:

```javascript
async function makeRequestWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Support

- **Documentation**: [docs.platform.com](https://docs.platform.com)
- **API Status**: [status.platform.com](https://status.platform.com)
- **Support Email**: api-support@platform.com
- **Community Forum**: [community.platform.com](https://community.platform.com)
- **GitHub Issues**: [github.com/platform/api-issues](https://github.com/platform/api-issues)

## Changelog

### v1.0.0 (2025-11-17)
- Initial API release
- Core ATS functionality
- AI-powered features
- Webhook support
- OAuth 2.0 authentication
