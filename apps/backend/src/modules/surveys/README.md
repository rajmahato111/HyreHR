# Surveys Module

The Surveys module enables organizations to collect feedback from candidates at various stages of the recruitment process through customizable surveys with NPS scoring and sentiment analysis.

## Features

### Survey Builder
- Create custom surveys with multiple question types
- Support for NPS, rating, text, multiple choice, and yes/no questions
- Configure trigger types (post-application, post-interview, post-rejection, post-offer)
- Set send delays for automated survey distribution
- Activate/deactivate surveys

### Survey Triggers
- **Post-Application**: Automatically send surveys after candidates apply
- **Post-Interview**: Collect feedback after interview completion
- **Post-Rejection**: Gather insights from rejected candidates
- **Post-Offer**: Measure satisfaction after offer acceptance
- **Manual**: Send surveys on-demand

### Response Collection
- Public survey forms accessible via unique tokens
- Mobile-responsive survey interface
- Required/optional question validation
- Automatic NPS score calculation
- Real-time sentiment analysis

### Analytics & Reporting
- Net Promoter Score (NPS) calculation
- Sentiment distribution analysis
- Completion rate tracking
- Average response time metrics
- Response trends over time
- NPS by trigger type

### Sentiment Analysis
- Automatic sentiment scoring based on text responses and NPS
- Five-level sentiment classification:
  - Very Positive
  - Positive
  - Neutral
  - Negative
  - Very Negative
- Keyword-based analysis with positive/negative indicators
- Sentiment explanations for each response

## API Endpoints

### Survey Management

#### Create Survey
```http
POST /surveys
Authorization: Bearer <token>

{
  "name": "Post-Interview Feedback",
  "description": "Collect feedback after interviews",
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

#### Get All Surveys
```http
GET /surveys
Authorization: Bearer <token>
```

#### Get Survey by ID
```http
GET /surveys/:id
Authorization: Bearer <token>
```

#### Update Survey
```http
PATCH /surveys/:id
Authorization: Bearer <token>

{
  "name": "Updated Survey Name",
  "active": true
}
```

#### Toggle Survey Active Status
```http
PATCH /surveys/:id/toggle
Authorization: Bearer <token>
```

#### Delete Survey
```http
DELETE /surveys/:id
Authorization: Bearer <token>
```

### Analytics

#### Get Survey Analytics
```http
GET /surveys/:id/analytics
Authorization: Bearer <token>

Response:
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
  "responses": [...]
}
```

#### Get Organization Analytics
```http
GET /surveys/analytics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>

Response:
{
  "totalResponses": 500,
  "overallNPS": 38,
  "sentimentDistribution": {...},
  "npsByTrigger": {
    "post_application": 45,
    "post_interview": 52,
    "post_rejection": 28
  },
  "surveys": [...]
}
```

#### Get Survey Responses
```http
GET /surveys/:id/responses
Authorization: Bearer <token>
```

### Public Survey Response

#### Get Survey by Token (Public)
```http
GET /surveys/response/:token
```

#### Submit Survey Response (Public)
```http
POST /surveys/response/:token/submit

{
  "answers": [
    {
      "questionId": "q1",
      "answer": 9
    },
    {
      "questionId": "q2",
      "answer": "The interviewers were very professional and friendly."
    }
  ]
}
```

## Question Types

### NPS (Net Promoter Score)
- 0-10 scale rating
- Automatically calculates NPS score
- Categorizes respondents as Promoters (9-10), Passives (7-8), or Detractors (0-6)

### Rating
- 1-5 star rating
- Visual star display

### Text
- Free-form text input
- Used for sentiment analysis
- Supports multi-line responses

### Multiple Choice
- Single selection from predefined options
- Customizable option list

### Yes/No
- Binary choice question
- Simple true/false responses

## Triggering Surveys

### Automatic Triggers

Surveys are automatically triggered by the `SurveyTriggerService` when specific events occur:

```typescript
// After application submission
await surveyTriggerService.triggerPostApplication(
  organizationId,
  candidateId,
  applicationId
);

// After interview completion
await surveyTriggerService.triggerPostInterview(
  organizationId,
  candidateId,
  applicationId,
  interviewId
);

// After rejection
await surveyTriggerService.triggerPostRejection(
  organizationId,
  candidateId,
  applicationId
);

// After offer acceptance
await surveyTriggerService.triggerPostOffer(
  organizationId,
  candidateId,
  applicationId
);
```

### Integration Points

To integrate survey triggers into your application flow:

1. **Applications Module**: Trigger post-application surveys when applications are created
2. **Interviews Module**: Trigger post-interview surveys when interviews are marked complete
3. **Applications Module**: Trigger post-rejection surveys when applications are rejected
4. **Offers Module**: Trigger post-offer surveys when offers are accepted

## NPS Calculation

Net Promoter Score is calculated using the formula:

```
NPS = ((Promoters - Detractors) / Total Responses) × 100
```

Where:
- **Promoters**: Responses with score 9-10
- **Passives**: Responses with score 7-8 (not included in calculation)
- **Detractors**: Responses with score 0-6

NPS ranges from -100 to +100:
- **50+**: Excellent
- **0-49**: Good
- **Below 0**: Needs Improvement

## Sentiment Analysis Algorithm

The sentiment analysis uses a simple but effective keyword-based approach:

1. **Text Analysis**: Scans responses for positive and negative keywords
2. **NPS Weighting**: Heavily weights NPS scores in sentiment calculation
3. **Score Calculation**: Combines text sentiment and NPS for final score
4. **Classification**: Maps scores to five sentiment levels

### Positive Keywords
great, excellent, amazing, wonderful, fantastic, good, helpful, professional, smooth, easy

### Negative Keywords
bad, terrible, awful, poor, disappointing, difficult, confusing, slow, unprofessional, frustrating

## Database Schema

### surveys
- `id`: UUID primary key
- `organization_id`: UUID foreign key
- `name`: Survey name
- `description`: Optional description
- `trigger_type`: When to send (enum)
- `questions`: JSONB array of questions
- `active`: Boolean status
- `send_delay_hours`: Delay before sending
- `created_by`: User who created survey
- `created_at`, `updated_at`: Timestamps

### survey_responses
- `id`: UUID primary key
- `survey_id`: UUID foreign key
- `candidate_id`: UUID foreign key
- `application_id`: Optional UUID foreign key
- `interview_id`: Optional UUID foreign key
- `status`: pending/completed/expired
- `answers`: JSONB array of answers
- `nps_score`: Calculated NPS (0-10)
- `sentiment`: Calculated sentiment enum
- `sentiment_analysis`: Text explanation
- `sent_at`: When survey was sent
- `completed_at`: When response was submitted
- `expires_at`: Expiration date (30 days)
- `response_token`: Unique access token
- `created_at`, `updated_at`: Timestamps

## Best Practices

### Survey Design
1. Keep surveys short (3-5 questions max)
2. Always include at least one NPS question
3. Use a mix of quantitative (NPS, rating) and qualitative (text) questions
4. Make critical questions required, others optional
5. Set appropriate send delays (e.g., 2 hours after interview)

### Timing
- **Post-Application**: Send immediately or within 1 hour
- **Post-Interview**: Send 2-4 hours after interview
- **Post-Rejection**: Send 24 hours after rejection
- **Post-Offer**: Send after offer acceptance

### Response Rates
- Keep surveys under 2 minutes to complete
- Use clear, concise question wording
- Explain how feedback will be used
- Consider incentives for completion

### Analytics
- Review NPS trends monthly
- Compare NPS across different trigger types
- Analyze sentiment patterns in text responses
- Act on negative feedback promptly
- Share positive feedback with team

## Future Enhancements

- Advanced sentiment analysis using ML models
- Multi-language survey support
- Survey templates library
- A/B testing for survey questions
- Integration with communication module for automated emails
- Survey response reminders
- Conditional question logic
- Custom branding for survey pages
- Export responses to CSV/Excel
- Survey response notifications
