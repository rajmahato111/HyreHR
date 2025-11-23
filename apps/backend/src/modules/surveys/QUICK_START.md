# Surveys Module - Quick Start Guide

This guide will help you get started with the Candidate Surveys feature.

## Setup

### 1. Run Database Migration

The surveys tables will be created automatically when you run migrations:

```bash
cd apps/backend
npm run migration:run
```

This creates two tables:
- `surveys` - Survey definitions
- `survey_responses` - Candidate responses

### 2. Verify Module Registration

The SurveysModule is already registered in `app.module.ts`. No additional setup needed.

## Creating Your First Survey

### Via API

```bash
curl -X POST http://localhost:3000/surveys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
      },
      {
        "id": "q3",
        "type": "rating",
        "question": "How would you rate your overall interview experience?",
        "required": true,
        "order": 2
      }
    ]
  }'
```

### Via UI

1. Navigate to `/surveys` in the frontend
2. Click "Create Survey"
3. Fill in survey details:
   - Name: "Post-Interview Feedback"
   - Trigger Type: "After Interview"
   - Send Delay: 2 hours
4. Add questions using the question type buttons
5. Click "Create Survey"

## Triggering Surveys

### Automatic Triggers

Integrate survey triggers into your application flow:

#### After Interview Completion

```typescript
import { SurveyTriggerService } from './modules/surveys';

// In your interviews service
async completeInterview(interviewId: string) {
  const interview = await this.findOne(interviewId);
  
  // Mark interview as complete
  interview.status = InterviewStatus.COMPLETED;
  await this.save(interview);
  
  // Trigger post-interview survey
  await this.surveyTriggerService.triggerPostInterview(
    interview.organizationId,
    interview.candidateId,
    interview.applicationId,
    interview.id
  );
}
```

#### After Application Submission

```typescript
// In your applications service
async createApplication(data: CreateApplicationDto) {
  const application = await this.create(data);
  
  // Trigger post-application survey
  await this.surveyTriggerService.triggerPostApplication(
    application.organizationId,
    application.candidateId,
    application.id
  );
  
  return application;
}
```

#### After Rejection

```typescript
// In your applications service
async rejectApplication(id: string, reasonId: string) {
  const application = await this.findOne(id);
  
  application.status = ApplicationStatus.REJECTED;
  application.rejectionReasonId = reasonId;
  application.rejectedAt = new Date();
  await this.save(application);
  
  // Trigger post-rejection survey
  await this.surveyTriggerService.triggerPostRejection(
    application.organizationId,
    application.candidateId,
    application.id
  );
}
```

## Viewing Analytics

### Survey-Specific Analytics

```bash
curl http://localhost:3000/surveys/SURVEY_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes:
- Total responses
- Completion rate
- NPS score
- Sentiment distribution
- Average response time
- Recent responses

### Organization-Wide Analytics

```bash
curl http://localhost:3000/surveys/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes:
- Overall NPS
- Total responses across all surveys
- Sentiment distribution
- NPS by trigger type
- Survey performance comparison

## Testing Survey Flow

### 1. Create a Test Survey

Use the API or UI to create a survey with trigger type "manual".

### 2. Create a Survey Response

```typescript
const response = await surveyResponseService.createResponse(
  surveyId,
  candidateId,
  applicationId
);

console.log('Survey link:', `http://localhost:5173/survey/${response.responseToken}`);
```

### 3. Complete the Survey

Navigate to the survey link and fill out the form. The system will:
- Calculate NPS score if NPS question is present
- Analyze sentiment from text responses
- Store the response with timestamp

### 4. View Results

Check the analytics dashboard to see:
- Updated NPS score
- Sentiment classification
- Response details

## Common Question Types

### NPS Question
```json
{
  "id": "nps1",
  "type": "nps",
  "question": "How likely are you to recommend us?",
  "required": true,
  "order": 0
}
```

### Rating Question
```json
{
  "id": "rating1",
  "type": "rating",
  "question": "Rate your experience",
  "required": true,
  "order": 1
}
```

### Text Question
```json
{
  "id": "text1",
  "type": "text",
  "question": "What could we improve?",
  "required": false,
  "order": 2
}
```

### Multiple Choice
```json
{
  "id": "mc1",
  "type": "multiple_choice",
  "question": "How did you hear about us?",
  "required": false,
  "options": ["LinkedIn", "Job Board", "Referral", "Company Website"],
  "order": 3
}
```

## Best Practices

### Survey Design
1. **Keep it short**: 3-5 questions maximum
2. **Start with NPS**: Always include an NPS question first
3. **Mix question types**: Combine quantitative (NPS, rating) with qualitative (text)
4. **Make key questions required**: But don't require everything

### Timing
- **Post-Application**: Send immediately or within 1 hour
- **Post-Interview**: Wait 2-4 hours to let experience settle
- **Post-Rejection**: Wait 24 hours to avoid emotional responses
- **Post-Offer**: Send after acceptance confirmation

### Response Rates
- Keep surveys under 2 minutes
- Explain how feedback will be used
- Send at appropriate times (not late night)
- Consider follow-up reminders (future feature)

## Troubleshooting

### Survey Not Triggering

Check that:
1. Survey is active (`active: true`)
2. Trigger type matches the event
3. SurveyTriggerService is properly injected
4. No errors in application logs

### Low Response Rates

Consider:
1. Reducing number of questions
2. Adjusting send delay timing
3. Improving survey introduction text
4. Making fewer questions required

### NPS Calculation Issues

Verify:
1. NPS question type is set to `"nps"`
2. Responses are numbers 0-10
3. Multiple responses exist for calculation

## Next Steps

1. **Integrate with Communication Module**: Send survey emails automatically
2. **Add Survey Reminders**: Follow up with non-respondents
3. **Create Survey Templates**: Build a library of common surveys
4. **Advanced Analytics**: Track trends over time
5. **Export Responses**: Download data for external analysis

## Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review API.md for complete endpoint reference
- Check application logs for error messages
