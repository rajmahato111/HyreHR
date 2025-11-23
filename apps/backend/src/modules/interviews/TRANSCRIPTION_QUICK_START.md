# Interview Transcription - Quick Start Guide

## Overview

The Interview Transcription feature provides AI-powered analysis of interviews, including real-time transcription, speaker identification, key point extraction, sentiment analysis, and automated feedback generation.

## Prerequisites

1. OpenAI API key configured in environment variables:
```env
OPENAI_API_KEY=sk-...
```

2. Database migration applied:
```bash
npm run migration:run
```

## Basic Usage

### 1. Start Transcription

When an interview begins, start the transcription process:

```typescript
POST /interviews/:interviewId/transcription/start
Authorization: Bearer <token>

{
  "interviewId": "uuid",
  "audioUrl": "https://..." // Optional
}
```

Response:
```json
{
  "message": "Transcription started",
  "transcript": {
    "id": "transcript-uuid",
    "interviewId": "interview-uuid",
    "status": "processing"
  }
}
```

### 2. Check Transcription Status

Poll for transcription completion:

```typescript
GET /interviews/:interviewId/transcription
Authorization: Bearer <token>
```

Response when processing:
```json
{
  "transcript": {
    "id": "transcript-uuid",
    "status": "processing",
    ...
  }
}
```

Response when completed:
```json
{
  "transcript": {
    "id": "transcript-uuid",
    "status": "completed",
    "fullText": "Complete transcript...",
    "summary": "AI-generated summary...",
    "keyPoints": [...],
    "sentimentAnalysis": {...},
    "redFlags": [...],
    "greenFlags": [...],
    "suggestedFeedback": "Structured feedback..."
  }
}
```

### 3. Use in Frontend

```tsx
import { InterviewTranscription } from '../components/interviews';

function InterviewDetailPage({ interviewId }) {
  return (
    <div>
      <h1>Interview Details</h1>
      
      {/* Transcription Component */}
      <InterviewTranscription 
        interviewId={interviewId}
        onStartTranscription={() => {
          console.log('Transcription started');
        }}
      />
    </div>
  );
}
```

## Features Breakdown

### Real-Time Transcription
- Uses OpenAI Whisper for speech-to-text
- Identifies speakers automatically
- Provides confidence scores for each segment

### Key Points Extraction
- Identifies important moments in the interview
- Categories: technical, behavioral, experience
- Importance levels: high, medium, low

### Sentiment Analysis
- Overall interview sentiment (positive/neutral/negative)
- Segment-by-segment sentiment tracking
- Numerical sentiment scores

### Flag Detection

**Red Flags (Concerns):**
- Negative attitudes
- Lack of preparation
- Communication issues
- Inconsistencies

**Green Flags (Positives):**
- Strong technical knowledge
- Excellent communication
- Problem-solving ability
- Cultural fit indicators

### Suggested Feedback
- Structured feedback template
- Technical assessment
- Communication evaluation
- Hiring recommendation

## Integration with Feedback System

The transcription can be used to pre-fill interview feedback forms:

```typescript
// Get transcript
const { transcript } = await transcriptionService.getTranscription(interviewId);

// Use suggested feedback as starting point
if (transcript?.suggestedFeedback) {
  // Pre-fill feedback form
  feedbackForm.notes = transcript.suggestedFeedback;
  
  // Reference key points
  feedbackForm.strengths = transcript.keyPoints
    ?.filter(kp => kp.importance === 'high')
    .map(kp => kp.text)
    .join(', ');
}
```

## Performance Considerations

- Transcription is asynchronous and may take 2-5 minutes
- Poll every 5 seconds for status updates
- Consider implementing WebSocket for real-time updates
- Large interviews (>1 hour) may take longer to process

## Error Handling

```typescript
try {
  const result = await transcriptionService.startTranscription(interviewId);
} catch (error) {
  if (error.status === 404) {
    console.error('Interview not found');
  } else if (error.status === 500) {
    console.error('Transcription service error');
  }
}
```

## Testing

### Manual Testing

1. Create an interview
2. Start transcription via API or UI
3. Wait for processing to complete
4. Review transcript, summary, and flags
5. Use suggested feedback in feedback form

### Mock Data

The service includes mock data for development. In production, replace with actual OpenAI API calls.

## Troubleshooting

### Transcription Stuck in Processing
- Check OpenAI API key is valid
- Check API rate limits
- Review server logs for errors

### No Audio URL Provided
- Transcription will use mock data
- In production, integrate with video conferencing platform

### Poor Transcription Quality
- Ensure audio quality is good
- Check for background noise
- Verify speaker identification is working

## Next Steps

1. Integrate with video conferencing platforms (Zoom, Teams)
2. Implement real-time streaming transcription
3. Add custom vocabulary for technical terms
4. Build automated highlight reel generation
5. Add bias detection in interviewer questions

## Support

For issues or questions, refer to:
- Main documentation: `TRANSCRIPTION.md`
- API documentation: Check Swagger/OpenAPI docs
- Backend service: `transcription.service.ts`
