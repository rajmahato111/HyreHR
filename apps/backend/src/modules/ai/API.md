# AI Email Generation API

This document describes the AI-powered email generation endpoints.

## Base URL

```
/api/v1/ai
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Generate Outreach Email

Generate a personalized recruiting outreach email for a candidate.

**Endpoint:** `POST /ai/email/outreach`

**Request Body:**

```json
{
  "candidateId": "550e8400-e29b-41d4-a716-446655440000",
  "jobId": "660e8400-e29b-41d4-a716-446655440001",
  "tone": "friendly",
  "additionalContext": "We met at the tech conference last month",
  "recruiterName": "Jane Smith",
  "companyName": "Acme Corp"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | UUID | Yes | ID of the candidate |
| jobId | UUID | Yes | ID of the job opportunity |
| tone | Enum | Yes | Email tone: `professional`, `friendly`, or `casual` |
| additionalContext | String | No | Additional context to include in the email |
| recruiterName | String | No | Name of the recruiter sending the email |
| companyName | String | No | Company name (overrides job's company) |

**Response:**

```json
{
  "success": true,
  "data": {
    "subject": "Exciting Senior Software Engineer Opportunity at Acme Corp",
    "body": "Hi John,\n\nI came across your profile and was impressed by your experience with React and Node.js at TechCo...",
    "tone": "friendly",
    "tokens": [
      "{{firstName}}",
      "{{currentTitle}}",
      "{{currentCompany}}",
      "{{jobTitle}}"
    ]
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/ai/email/outreach \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "550e8400-e29b-41d4-a716-446655440000",
    "jobId": "660e8400-e29b-41d4-a716-446655440001",
    "tone": "friendly"
  }'
```

---

### 2. Generate Response Email

Generate a context-aware response to a candidate's email.

**Endpoint:** `POST /ai/email/response`

**Request Body:**

```json
{
  "candidateEmail": "Hi, I wanted to follow up on my application for the Senior Engineer role. When can I expect to hear back?",
  "candidateId": "550e8400-e29b-41d4-a716-446655440000",
  "applicationId": "770e8400-e29b-41d4-a716-446655440002",
  "tone": "professional",
  "context": "We are currently in the final round of interviews"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateEmail | String | Yes | The candidate's email content to respond to |
| candidateId | UUID | No | ID of the candidate (for context) |
| applicationId | UUID | No | ID of the application (for context) |
| tone | Enum | Yes | Email tone: `professional`, `friendly`, or `casual` |
| context | String | No | Additional context for the response |

**Response:**

```json
{
  "success": true,
  "data": {
    "subject": "Re: Application Status Update",
    "body": "Hi John,\n\nThank you for reaching out. We appreciate your interest in the Senior Engineer position...",
    "tone": "professional",
    "tokens": []
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/ai/email/response \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "When can I expect to hear back?",
    "applicationId": "770e8400-e29b-41d4-a716-446655440002",
    "tone": "friendly"
  }'
```

---

### 3. Generate Rejection Email

Generate an empathetic rejection email with optional constructive feedback.

**Endpoint:** `POST /ai/email/rejection`

**Request Body:**

```json
{
  "applicationId": "770e8400-e29b-41d4-a716-446655440002",
  "tone": "friendly",
  "rejectionReason": "We decided to move forward with candidates who have more experience with our tech stack",
  "constructiveFeedback": "Your problem-solving skills were impressive. Consider gaining more experience with Kubernetes and microservices architecture."
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| applicationId | UUID | Yes | ID of the application being rejected |
| tone | Enum | Yes | Email tone: `professional`, `friendly`, or `casual` |
| rejectionReason | String | No | Reason for rejection |
| constructiveFeedback | String | No | Constructive feedback for the candidate |

**Response:**

```json
{
  "success": true,
  "data": {
    "subject": "Update on Your Application for Senior Software Engineer",
    "body": "Dear John,\n\nThank you for taking the time to interview with us for the Senior Software Engineer position...",
    "tone": "friendly",
    "tokens": []
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/ai/email/rejection \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "770e8400-e29b-41d4-a716-446655440002",
    "tone": "friendly",
    "constructiveFeedback": "Your technical skills were strong. Consider gaining more leadership experience."
  }'
```

---

### 4. Get Available Tones

Get a list of available email tones with descriptions.

**Endpoint:** `GET /ai/email/tones`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "value": "professional",
      "label": "Professional",
      "description": "Formal and professional tone"
    },
    {
      "value": "friendly",
      "label": "Friendly",
      "description": "Warm and friendly while maintaining professionalism"
    },
    {
      "value": "casual",
      "label": "Casual",
      "description": "Casual and conversational tone"
    }
  ]
}
```

**Example cURL:**

```bash
curl -X GET http://localhost:3000/api/v1/ai/email/tones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Candidate not found",
  "error": "Bad Request"
}
```

**Common Error Codes:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Candidate, job, or application not found
- `500 Internal Server Error` - OpenAI API error or server error

---

## Email Tones

### Professional
- Formal language
- Business-appropriate
- Structured and clear
- Best for: Executive roles, formal companies

### Friendly
- Warm and approachable
- Professional but personable
- Conversational yet respectful
- Best for: Most recruiting scenarios

### Casual
- Relaxed and informal
- Conversational tone
- More personal
- Best for: Startups, creative roles, tech companies

---

## Personalization Tokens

The AI automatically identifies and uses personalization tokens:

- `{{firstName}}` - Candidate's first name
- `{{lastName}}` - Candidate's last name
- `{{currentTitle}}` - Current job title
- `{{currentCompany}}` - Current company
- `{{jobTitle}}` - Job title being recruited for
- `{{jobLocation}}` - Job location

These tokens are returned in the response and can be used for template-based emails.

---

## Best Practices

1. **Provide Context**: Include `additionalContext` for more personalized emails
2. **Choose Appropriate Tone**: Match the tone to your company culture and role
3. **Review Before Sending**: Always review AI-generated content before sending
4. **Iterate**: If the first generation isn't perfect, try again with different context
5. **Combine with Templates**: Use AI-generated content as a starting point and customize

---

## Rate Limiting

AI email generation endpoints are subject to rate limiting:
- 100 requests per minute per user
- 200 burst capacity

---

## Configuration

Ensure the following environment variable is set:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Integration Example

### Frontend Integration

```typescript
import axios from 'axios';

const generateOutreachEmail = async (candidateId: string, jobId: string) => {
  try {
    const response = await axios.post('/api/v1/ai/email/outreach', {
      candidateId,
      jobId,
      tone: 'friendly',
      recruiterName: 'Jane Smith'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to generate email:', error);
    throw error;
  }
};
```

### Using with Email Composer

```typescript
// Generate email
const generatedEmail = await generateOutreachEmail(candidateId, jobId);

// Pre-fill email composer
setEmailSubject(generatedEmail.subject);
setEmailBody(generatedEmail.body);
```

---

## Troubleshooting

### "Failed to generate AI email"

**Cause**: OpenAI API error or missing API key

**Solution**: 
1. Check that `OPENAI_API_KEY` is set in environment
2. Verify API key is valid and has GPT-4 access
3. Check OpenAI API status

### "Candidate not found" or "Job not found"

**Cause**: Invalid UUID or entity doesn't exist

**Solution**: Verify the IDs exist in the database

### Rate limit exceeded

**Cause**: Too many requests in short time

**Solution**: Implement request throttling on the frontend

---

## Future Enhancements

- Multi-language support
- Custom prompt templates
- A/B testing for email effectiveness
- Email performance analytics
- Batch email generation
- Integration with email tracking
