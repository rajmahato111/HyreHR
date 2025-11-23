# AI Module

This module provides AI-powered features for the recruiting platform, including email generation using OpenAI's GPT-4.

## Features

### 1. Outreach Email Generation
Generate personalized recruiting outreach emails based on candidate profile and job details.

**Endpoint:** `POST /ai/email/outreach`

**Request Body:**
```json
{
  "candidateId": "uuid",
  "jobId": "uuid",
  "tone": "professional|friendly|casual",
  "additionalContext": "Optional context",
  "recruiterName": "Optional recruiter name",
  "companyName": "Optional company name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Generated subject line",
    "body": "Generated email body",
    "tone": "professional",
    "tokens": ["{{firstName}}", "{{jobTitle}}"]
  }
}
```

### 2. Response Email Generation
Generate context-aware response drafts to candidate emails.

**Endpoint:** `POST /ai/email/response`

**Request Body:**
```json
{
  "candidateEmail": "The candidate's email content",
  "candidateId": "uuid (optional)",
  "applicationId": "uuid (optional)",
  "tone": "professional|friendly|casual",
  "context": "Optional additional context"
}
```

### 3. Rejection Email Generation
Generate empathetic rejection emails with optional constructive feedback.

**Endpoint:** `POST /ai/email/rejection`

**Request Body:**
```json
{
  "applicationId": "uuid",
  "tone": "professional|friendly|casual",
  "rejectionReason": "Optional reason",
  "constructiveFeedback": "Optional feedback"
}
```

### 4. Get Available Tones
Get list of available email tones.

**Endpoint:** `GET /ai/email/tones`

## Configuration

Set the OpenAI API key in your environment:

```bash
OPENAI_API_KEY=your_openai_api_key
```

## Email Tones

- **Professional**: Formal and professional tone
- **Friendly**: Warm and friendly while maintaining professionalism
- **Casual**: Casual and conversational tone

## Personalization Tokens

The service automatically identifies and returns personalization tokens used in generated emails:

- `{{firstName}}` - Candidate's first name
- `{{lastName}}` - Candidate's last name
- `{{currentTitle}}` - Candidate's current job title
- `{{currentCompany}}` - Candidate's current company
- `{{jobTitle}}` - Job title
- `{{jobLocation}}` - Job location

## Error Handling

The service includes comprehensive error handling:
- Validates that candidates and jobs exist
- Handles OpenAI API errors gracefully
- Logs all operations for debugging
- Returns user-friendly error messages

## Usage Example

```typescript
import { AIEmailService, EmailTone } from './ai-email.service';

// Inject the service
constructor(private aiEmailService: AIEmailService) {}

// Generate outreach email
const email = await this.aiEmailService.generateOutreachEmail({
  candidate: candidateEntity,
  job: jobEntity,
  tone: EmailTone.FRIENDLY,
  recruiterName: 'John Doe',
  companyName: 'Acme Corp'
});

console.log(email.subject);
console.log(email.body);
```

## Requirements

- OpenAI API key with GPT-4 access
- Node.js 18+
- NestJS framework
- TypeORM for database access

## Testing

The AI email generation can be tested using the provided endpoints. Make sure to:
1. Set up a valid OpenAI API key
2. Have test candidates and jobs in the database
3. Use appropriate authentication tokens

## Future Enhancements

- Support for multiple languages
- Custom prompt templates
- A/B testing for email effectiveness
- Email performance analytics
- Integration with email tracking
