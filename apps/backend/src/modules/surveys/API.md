# Surveys API Documentation

Complete API reference for the Candidate Surveys module.

## Base URL

```
http://localhost:3000/surveys
```

## Authentication

All endpoints except public survey response endpoints require JWT authentication:

```
Authorization: Bearer <your_jwt_token>
```

---

## Survey Management

### Create Survey

Create a new survey with custom questions.

**Endpoint:** `POST /surveys`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "triggerType": "post_application | post_interview | post_rejection | post_offer | manual (required)",
  "sendDelayHours": "number (optional, default: 0)",
  "active": "boolean (optional, default: true)",
  "questions": [
    {
      "id": "string (required, unique within survey)",
      "type": "nps | rating | text | multiple_choice | yes_no (required)",
      "question": "string (required)",
      "required": "boolean (required)",
      "options": "string[] (required for multiple_choice)",
      "order": "number (required)"
    }
  ]
}
```

**Example Request:**
```json
{
  "name": "Post-Interview Feedback",
  "description": "Collect feedback after candidate interviews",
  "triggerType": "post_interview",
  "sendDelayHours": 2,
  "questions": [
    {
      "id": "q1",
      "type": "nps",
      "question": "How likely are you to recommend our company to a friend?",
      "required": true,
      "order": 0
    },
    {
      "id": "q2",
      "type": "text",
      "question": "What did you like most about the interview process?",
      "required": false,
      "order": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Post-Interview Feedback",
  "description": "Collect feedback after candidate interviews",
  "triggerType": "post_interview",
  "sendDelayHours": 2,
  "active": true,
  "questions": [...],
  "createdBy": "uuid",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get All Surveys

Retrieve all surveys for the organization.

**Endpoint:** `GET /surveys`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "name": "Post-Interview Feedback",
    "description": "Collect feedback after candidate interviews",
    "triggerType": "post_interview",
    "sendDelayHours": 2,
    "active": true,
    "questions": [...],
    "createdBy": "uuid",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Survey by ID

Retrieve a specific survey.

**Endpoint:** `GET /surveys/:id`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Post-Interview Feedback",
  "description": "Collect feedback after candidate interviews",
  "triggerType": "post_interview",
  "sendDelayHours": 2,
  "active": true,
  "questions": [...],
  "createdBy": "uuid",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Survey not found

---

### Update Survey

Update an existing survey.

**Endpoint:** `PATCH /surveys/:id`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Request Body:** (all fields optional)
```json
{
  "name": "string",
  "description": "string",
  "triggerType": "post_application | post_interview | post_rejection | post_offer | manual",
  "sendDelayHours": "number",
  "active": "boolean",
  "questions": [...]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "Updated Survey Name",
  ...
}
```

---

### Toggle Survey Active Status

Activate or deactivate a survey.

**Endpoint:** `PATCH /surveys/:id/toggle`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "active": true,
  ...
}
```

---

### Delete Survey

Delete a survey and all associated responses.

**Endpoint:** `DELETE /surveys/:id`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Response:** `204 No Content`

---

## Survey Analytics

### Get Survey Analytics

Get detailed analytics for a specific survey.

**Endpoint:** `GET /surveys/:id/analytics`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Response:** `200 OK`
```json
{
  "totalResponses": 150,
  "completionRate": 85,
  "nps": 42,
  "sentimentDistribution": {
    "very_positive": 45,
    "positive": 60,
    "neutral": 30,
    "negative": 10,
    "very_negative": 5
  },
  "avgResponseTime": 8,
  "responses": [
    {
      "id": "uuid",
      "candidateId": "uuid",
      "completedAt": "2024-01-15T10:30:00Z",
      "npsScore": 9,
      "sentiment": "very_positive"
    }
  ]
}
```

**Metrics Explained:**
- `totalResponses`: Total number of completed responses
- `completionRate`: Percentage of sent surveys that were completed
- `nps`: Net Promoter Score (-100 to +100)
- `sentimentDistribution`: Count of responses by sentiment
- `avgResponseTime`: Average time to complete in minutes
- `responses`: Recent individual responses

---

### Get Organization Analytics

Get aggregated analytics across all surveys.

**Endpoint:** `GET /surveys/analytics`

**Authentication:** Required

**Query Parameters:**
- `startDate` (optional): ISO date string (e.g., "2024-01-01")
- `endDate` (optional): ISO date string (e.g., "2024-12-31")

**Example:**
```
GET /surveys/analytics?startDate=2024-01-01&endDate=2024-12-31
```

**Response:** `200 OK`
```json
{
  "totalResponses": 500,
  "overallNPS": 38,
  "sentimentDistribution": {
    "very_positive": 120,
    "positive": 200,
    "neutral": 100,
    "negative": 60,
    "very_negative": 20
  },
  "npsByTrigger": {
    "post_application": 45,
    "post_interview": 52,
    "post_rejection": 28,
    "post_offer": 65
  },
  "surveys": [
    {
      "id": "uuid",
      "name": "Post-Interview Feedback",
      "triggerType": "post_interview",
      "responseCount": 150
    }
  ]
}
```

---

### Get Survey Responses

Get all responses for a specific survey.

**Endpoint:** `GET /surveys/:id/responses`

**Authentication:** Required

**Parameters:**
- `id` (path): Survey UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "surveyId": "uuid",
    "candidateId": "uuid",
    "applicationId": "uuid",
    "interviewId": "uuid",
    "status": "completed",
    "answers": [
      {
        "questionId": "q1",
        "answer": 9
      },
      {
        "questionId": "q2",
        "answer": "Great experience overall!"
      }
    ],
    "npsScore": 9,
    "sentiment": "very_positive",
    "sentimentAnalysis": "Highly positive feedback with strong satisfaction indicators",
    "sentAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T10:08:00Z",
    "expiresAt": "2024-02-14T10:00:00Z",
    "responseToken": "abc123...",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:08:00Z",
    "candidate": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
]
```

---

## Public Survey Response

These endpoints are public and do not require authentication.

### Get Survey by Token

Retrieve survey details using a response token.

**Endpoint:** `GET /surveys/response/:token`

**Authentication:** Not required

**Parameters:**
- `token` (path): Unique response token

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "surveyId": "uuid",
  "candidateId": "uuid",
  "status": "pending",
  "expiresAt": "2024-02-14T10:00:00Z",
  "responseToken": "abc123...",
  "survey": {
    "id": "uuid",
    "name": "Post-Interview Feedback",
    "description": "We'd love to hear about your interview experience",
    "questions": [
      {
        "id": "q1",
        "type": "nps",
        "question": "How likely are you to recommend our company?",
        "required": true,
        "order": 0
      }
    ]
  },
  "candidate": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**
- `404 Not Found`: Invalid token
- `400 Bad Request`: Survey already completed or expired

---

### Submit Survey Response

Submit answers to a survey.

**Endpoint:** `POST /surveys/response/:token/submit`

**Authentication:** Not required

**Parameters:**
- `token` (path): Unique response token

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": 9
    },
    {
      "questionId": "q2",
      "answer": "The interviewers were very professional and friendly."
    },
    {
      "questionId": "q3",
      "answer": 5
    }
  ]
}
```

**Answer Types by Question Type:**
- `nps`: number (0-10)
- `rating`: number (1-5)
- `text`: string
- `multiple_choice`: string (one of the options)
- `yes_no`: string ("yes" or "no")

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "surveyId": "uuid",
  "candidateId": "uuid",
  "status": "completed",
  "answers": [...],
  "npsScore": 9,
  "sentiment": "very_positive",
  "sentimentAnalysis": "Highly positive feedback with strong satisfaction indicators",
  "completedAt": "2024-01-15T10:08:00Z",
  ...
}
```

**Error Responses:**
- `400 Bad Request`: Missing required answers or invalid data
- `404 Not Found`: Invalid token
- `400 Bad Request`: Survey already completed or expired

---

## Data Models

### Survey
```typescript
{
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  triggerType: 'post_application' | 'post_interview' | 'post_rejection' | 'post_offer' | 'manual';
  questions: SurveyQuestion[];
  active: boolean;
  sendDelayHours: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SurveyQuestion
```typescript
{
  id: string;
  type: 'nps' | 'rating' | 'text' | 'multiple_choice' | 'yes_no';
  question: string;
  required: boolean;
  options?: string[]; // for multiple_choice
  order: number;
}
```

### SurveyResponse
```typescript
{
  id: string;
  surveyId: string;
  candidateId: string;
  applicationId?: string;
  interviewId?: string;
  status: 'pending' | 'completed' | 'expired';
  answers?: QuestionAnswer[];
  npsScore?: number;
  sentiment?: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  sentimentAnalysis?: string;
  sentAt?: string;
  completedAt?: string;
  expiresAt?: string;
  responseToken: string;
  createdAt: string;
  updatedAt: string;
}
```

### QuestionAnswer
```typescript
{
  questionId: string;
  answer: string | number | string[];
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are rate limited to:
- 100 requests per minute (standard)
- 200 requests per minute (burst)

Exceeding these limits will result in a `429 Too Many Requests` response.

---

## Webhooks (Future Feature)

Webhook events will be available for:
- `survey.response.completed` - When a candidate completes a survey
- `survey.nps.threshold` - When NPS drops below configured threshold
- `survey.sentiment.negative` - When negative sentiment is detected

---

## Examples

### Complete Survey Creation Flow

```bash
# 1. Create survey
SURVEY_ID=$(curl -X POST http://localhost:3000/surveys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.id')

# 2. Create response (programmatically)
RESPONSE_TOKEN=$(curl -X POST http://localhost:3000/surveys/$SURVEY_ID/responses \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"candidateId": "uuid", "applicationId": "uuid"}' | jq -r '.responseToken')

# 3. Candidate completes survey (public)
curl -X POST http://localhost:3000/surveys/response/$RESPONSE_TOKEN/submit \
  -H "Content-Type: application/json" \
  -d '{"answers": [...]}'

# 4. View analytics
curl http://localhost:3000/surveys/$SURVEY_ID/analytics \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

For additional help:
- See README.md for detailed documentation
- See QUICK_START.md for setup instructions
- Check application logs for error details
