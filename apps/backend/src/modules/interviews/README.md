# Interviews Module

This module provides comprehensive interview management functionality for the recruiting platform, including interview plans, stages, scheduling, and feedback collection.

## Features

### 1. Scorecard Management
- Create and manage interview scorecards with custom attributes
- Support for different attribute types: rating, yes/no, text
- Reusable scorecards across multiple interview stages

### 2. Interview Plan Management
- Create interview plans with multiple stages
- Associate plans with specific jobs or use as templates
- Define interview process structure

### 3. Interview Stage Management
- Configure interview stages with type, duration, and order
- Link scorecards to specific stages
- Support for various interview types: phone screen, technical, behavioral, onsite, panel, case study, presentation, final

### 4. Interview Scheduling
- Schedule interviews with specific date/time and duration
- Assign multiple participants with different roles (interviewer, coordinator, observer)
- Support for different location types: phone, video, onsite
- Track interview status: scheduled, completed, cancelled, no_show
- Get upcoming interviews for users
- Query interviews by date range

### 5. Interview Feedback Collection
- Submit structured feedback using scorecards
- Overall rating (1-5) and decision recommendation
- Attribute-based ratings
- Strengths, concerns, and notes
- Prevent duplicate feedback submissions
- Track feedback submission status

### 6. Feedback Reminder System
- Identify interviews needing feedback
- Track interviewers with pending feedback
- Monitor oldest pending feedback dates

### 7. Feedback Analytics
- Overall feedback metrics (total, average rating)
- Decision breakdown (strong yes, yes, neutral, no, strong no)
- Feedback completion rate
- Average time to submit feedback
- Application-specific feedback summaries

## API Endpoints

### Scorecards
- `POST /interviews/scorecards` - Create scorecard
- `GET /interviews/scorecards` - List all scorecards
- `GET /interviews/scorecards/:id` - Get scorecard details
- `PUT /interviews/scorecards/:id` - Update scorecard
- `DELETE /interviews/scorecards/:id` - Delete scorecard

### Interview Plans
- `POST /interviews/plans` - Create interview plan
- `GET /interviews/plans` - List all interview plans
- `GET /interviews/plans/:id` - Get interview plan details
- `PUT /interviews/plans/:id` - Update interview plan
- `DELETE /interviews/plans/:id` - Delete interview plan

### Interview Stages
- `POST /interviews/stages` - Create interview stage
- `GET /interviews/stages?interviewPlanId=:id` - List stages for a plan
- `GET /interviews/stages/:id` - Get interview stage details
- `PUT /interviews/stages/:id` - Update interview stage
- `DELETE /interviews/stages/:id` - Delete interview stage

### Interviews
- `POST /interviews` - Schedule interview
- `GET /interviews?applicationId=:id` - List interviews (optionally filtered by application)
- `GET /interviews/:id` - Get interview details
- `PUT /interviews/:id` - Update interview
- `DELETE /interviews/:id` - Delete interview
- `POST /interviews/:id/cancel` - Cancel interview
- `POST /interviews/:id/complete` - Mark interview as completed
- `POST /interviews/:id/no-show` - Mark candidate as no-show
- `GET /interviews/upcoming/me` - Get upcoming interviews for current user
- `GET /interviews/by-date-range?startDate=:start&endDate=:end` - Get interviews by date range

### Interview Feedback
- `POST /interviews/feedback` - Submit feedback
- `GET /interviews/feedback?interviewId=:id` - List feedback for interview
- `GET /interviews/feedback/:id` - Get feedback details
- `PUT /interviews/feedback/:id` - Update feedback
- `POST /interviews/feedback/:id/submit` - Submit feedback (mark as final)
- `DELETE /interviews/feedback/:id` - Delete feedback

### Feedback Reminders
- `GET /interviews/needing-feedback` - Get interviews needing feedback
- `GET /interviews/pending-feedback/interviewers` - Get interviewers with pending feedback

### Feedback Analytics
- `GET /interviews/analytics/feedback?startDate=:start&endDate=:end` - Get feedback analytics
- `GET /interviews/analytics/feedback/application/:applicationId` - Get feedback summary for application

## Database Schema

### Tables
- `scorecards` - Interview evaluation templates
- `interview_plans` - Interview process definitions
- `interview_stages` - Individual stages within interview plans
- `interviews` - Scheduled interview instances
- `interview_participants` - Users participating in interviews
- `interview_feedback` - Feedback submitted by interviewers

## Data Models

### Scorecard
```typescript
{
  id: string;
  organizationId: string;
  name: string;
  attributes: ScorecardAttribute[];
  createdAt: Date;
}
```

### InterviewPlan
```typescript
{
  id: string;
  organizationId: string;
  name: string;
  jobId?: string;
  stages: InterviewStage[];
  createdAt: Date;
}
```

### InterviewStage
```typescript
{
  id: string;
  interviewPlanId: string;
  name: string;
  type: InterviewStageType;
  durationMinutes: number;
  orderIndex: number;
  instructions?: string;
  scorecardId?: string;
  createdAt: Date;
}
```

### Interview
```typescript
{
  id: string;
  applicationId: string;
  interviewStageId?: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: InterviewStatus;
  locationType?: LocationType;
  locationDetails?: string;
  meetingLink?: string;
  roomId?: string;
  participants: InterviewParticipant[];
  feedback: InterviewFeedback[];
  createdAt: Date;
  updatedAt: Date;
}
```

### InterviewFeedback
```typescript
{
  id: string;
  interviewId: string;
  interviewerId: string;
  scorecardId?: string;
  overallRating?: number;
  decision?: Decision;
  attributeRatings: AttributeRating[];
  strengths?: string;
  concerns?: string;
  notes?: string;
  submittedAt?: Date;
  createdAt: Date;
}
```

## Usage Examples

### Creating an Interview Plan
```typescript
POST /interviews/plans
{
  "name": "Software Engineer Interview Process",
  "jobId": "uuid"
}
```

### Adding Interview Stages
```typescript
POST /interviews/stages
{
  "interviewPlanId": "uuid",
  "name": "Technical Phone Screen",
  "type": "phone_screen",
  "durationMinutes": 45,
  "orderIndex": 1,
  "scorecardId": "uuid"
}
```

### Scheduling an Interview
```typescript
POST /interviews
{
  "applicationId": "uuid",
  "interviewStageId": "uuid",
  "scheduledAt": "2025-11-20T14:00:00Z",
  "durationMinutes": 60,
  "locationType": "video",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "participants": [
    {
      "userId": "uuid",
      "role": "interviewer"
    },
    {
      "userId": "uuid",
      "role": "coordinator"
    }
  ]
}
```

### Submitting Feedback
```typescript
POST /interviews/feedback
{
  "interviewId": "uuid",
  "scorecardId": "uuid",
  "overallRating": 4,
  "decision": "yes",
  "attributeRatings": [
    {
      "attributeId": "technical_skills",
      "value": 4
    }
  ],
  "strengths": "Strong problem-solving skills",
  "concerns": "Limited experience with React"
}
```

## Requirements Addressed

This implementation addresses the following requirements from the requirements document:

- **Requirement 7.1**: Interview plan creation with multiple stages and assigned interviewers
- **Requirement 3.1**: Interview scheduling with calendar integration support
- **Requirement 3.2**: Participant assignment and calendar event creation
- **Requirement 7.2**: Structured feedback collection using scorecards
- **Requirement 7.3**: Scorecard-based feedback forms with ratings and decisions
- **Requirement 7.5**: Feedback reminder system for overdue submissions

## Future Enhancements

The following features are planned for future implementation:

1. **Calendar Integration** (Task 13)
   - Google Calendar and Microsoft Outlook integration
   - Real-time availability checking
   - Automatic calendar event creation

2. **Candidate Self-Service Scheduling** (Task 14)
   - Scheduling link generation
   - Candidate-facing scheduling page
   - Rescheduling and cancellation

3. **Interview Transcription** (Task 35)
   - Real-time transcription
   - Key point extraction
   - Interview summaries

4. **Bias Detection** (Task 36)
   - Biased language detection in feedback
   - Statistical disparity analysis
   - Bias alert system
