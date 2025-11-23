# Interview Transcription and Analysis

This module provides AI-powered interview transcription and analysis capabilities, including real-time transcription, speaker identification, key point extraction, sentiment analysis, and automated feedback generation.

## Features

### 1. Real-Time Transcription
- Automatic transcription of video/audio interviews using OpenAI Whisper
- Speaker identification and diarization
- High-accuracy speech-to-text conversion
- Support for multiple audio formats

### 2. Speaker Identification
- Automatic detection of interviewers and candidates
- Speaker labeling and tracking throughout the interview
- Integration with interview participant data

### 3. Key Point Extraction
- AI-powered extraction of important moments
- Categorization by technical skills, behavioral traits, and experience
- Importance scoring (high, medium, low)
- Timestamp references for easy navigation

### 4. Sentiment Analysis
- Overall interview sentiment assessment
- Segment-by-segment sentiment tracking
- Sentiment score calculation (-1 to 1 scale)
- Visual sentiment timeline

### 5. Red Flag & Green Flag Detection
- Automatic identification of concerning responses (red flags)
- Detection of positive indicators (green flags)
- Severity/importance scoring
- Contextual explanations for each flag

### 6. Interview Summary Generation
- AI-generated comprehensive interview summaries
- Key takeaways and highlights
- Candidate strengths and areas of concern
- Overall impression and recommendation

### 7. Suggested Feedback
- Structured feedback drafts based on transcript analysis
- Technical assessment
- Communication skills evaluation
- Problem-solving ability assessment
- Cultural fit indicators
- Hiring recommendation

## API Endpoints

### Start Transcription
```http
POST /interviews/:id/transcription/start
Authorization: Bearer <token>

{
  "interviewId": "uuid",
  "audioUrl": "https://..."  // Optional
}
```

**Response:**
```json
{
  "message": "Transcription started",
  "transcript": {
    "id": "uuid",
    "interviewId": "uuid",
    "status": "processing"
  }
}
```

### Get Transcription
```http
GET /interviews/:id/transcription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transcript": {
    "id": "uuid",
    "interviewId": "uuid",
    "status": "completed",
    "speakers": [
      {
        "id": "speaker_0",
        "name": "John Interviewer",
        "role": "interviewer"
      },
      {
        "id": "speaker_candidate",
        "role": "candidate"
      }
    ],
    "segments": [
      {
        "id": "seg_1",
        "speakerId": "speaker_0",
        "text": "Can you tell me about your experience?",
        "startTime": 0,
        "endTime": 3.5,
        "confidence": 0.95
      }
    ],
    "fullText": "Complete transcript text...",
    "keyPoints": [
      {
        "text": "5 years of TypeScript experience",
        "timestamp": 120,
        "importance": "high",
        "category": "technical"
      }
    ],
    "sentimentAnalysis": {
      "overall": "positive",
      "score": 0.7,
      "segments": [
        {
          "timestamp": 0,
          "sentiment": "positive",
          "score": 0.8
        }
      ]
    },
    "redFlags": [
      {
        "text": "I don't really like working in teams",
        "timestamp": 300,
        "reason": "Potential collaboration issues",
        "severity": "medium"
      }
    ],
    "greenFlags": [
      {
        "text": "I built a system that reduced processing time by 80%",
        "timestamp": 450,
        "reason": "Strong problem-solving and impact"
      }
    ],
    "summary": "The candidate demonstrated strong technical skills...",
    "suggestedFeedback": "Technical Assessment: Strong...",
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:15:00Z"
  }
}
```

### Update Transcript Segments (Real-time)
```http
PUT /interviews/transcription/:transcriptId/segments
Authorization: Bearer <token>

{
  "segments": [
    {
      "speakerId": "speaker_0",
      "text": "New segment text",
      "startTime": 100,
      "endTime": 105,
      "confidence": 0.92
    }
  ]
}
```

### Delete Transcription
```http
DELETE /interviews/transcription/:transcriptId
Authorization: Bearer <token>
```

## Database Schema

### interview_transcripts Table
```sql
CREATE TABLE interview_transcripts (
  id UUID PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id),
  status VARCHAR(50),  -- processing, completed, failed
  speakers JSONB,
  segments JSONB,
  full_text TEXT,
  key_points JSONB,
  sentiment_analysis JSONB,
  red_flags JSONB,
  green_flags JSONB,
  summary TEXT,
  suggested_feedback TEXT,
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Configuration

### Environment Variables
```env
# OpenAI API Key for transcription and analysis
OPENAI_API_KEY=sk-...

# Optional: Custom transcription service
TRANSCRIPTION_SERVICE_URL=https://...
TRANSCRIPTION_API_KEY=...
```

## Usage Example

### Starting Transcription
```typescript
// Start transcription when interview begins
const transcript = await transcriptionService.startTranscription(
  interviewId,
  audioStreamUrl
);

console.log(`Transcription started: ${transcript.id}`);
```

### Checking Status
```typescript
// Poll for completion
const transcript = await transcriptionService.getTranscriptByInterviewId(
  interviewId
);

if (transcript.status === 'completed') {
  console.log('Summary:', transcript.summary);
  console.log('Key Points:', transcript.keyPoints);
  console.log('Suggested Feedback:', transcript.suggestedFeedback);
}
```

### Real-time Updates
```typescript
// Update segments as they arrive
await transcriptionService.updateTranscriptSegments(
  transcriptId,
  newSegments
);
```

## Processing Pipeline

1. **Audio Transcription** (OpenAI Whisper)
   - Convert audio to text
   - Identify speakers
   - Generate timestamps

2. **Key Point Extraction** (GPT-4)
   - Analyze transcript for important moments
   - Categorize by type
   - Assign importance scores

3. **Sentiment Analysis** (GPT-4)
   - Overall sentiment assessment
   - Segment-level sentiment tracking
   - Score calculation

4. **Flag Detection** (GPT-4)
   - Identify red flags (concerns)
   - Identify green flags (positives)
   - Provide contextual explanations

5. **Summary Generation** (GPT-4)
   - Create comprehensive summary
   - Highlight key takeaways
   - Overall impression

6. **Feedback Suggestion** (GPT-4)
   - Generate structured feedback
   - Technical and behavioral assessment
   - Hiring recommendation

## Integration with Interview Feedback

The transcription service integrates seamlessly with the interview feedback system:

- Suggested feedback can be used as a starting point for interviewers
- Key points and flags are referenced in feedback forms
- Sentiment analysis informs overall candidate assessment
- Summary provides context for hiring decisions

## Performance Considerations

- Transcription processing is asynchronous
- Large interviews may take several minutes to process
- Status polling recommended for UI updates
- Consider implementing WebSocket for real-time updates

## Future Enhancements

- [ ] Real-time streaming transcription
- [ ] Multi-language support
- [ ] Custom vocabulary for technical terms
- [ ] Integration with video conferencing platforms (Zoom, Teams)
- [ ] Automated highlight reel generation
- [ ] Bias detection in interviewer questions
- [ ] Question quality analysis
- [ ] Interview coaching suggestions
