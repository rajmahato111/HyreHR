# AI Email Generation - Quick Start Guide

## Setup

### 1. Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create a new API key
4. Ensure you have GPT-4 access

### 2. Configure Environment

Add to your `.env` file:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Restart Backend

```bash
cd apps/backend
npm run dev
```

## Usage Examples

### Example 1: Generate Outreach Email

**Scenario**: You want to reach out to a candidate about a job opportunity.

**Request**:
```bash
POST /api/v1/ai/email/outreach
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "candidateId": "candidate-uuid",
  "jobId": "job-uuid",
  "tone": "friendly",
  "additionalContext": "We met at the React Conference last month",
  "recruiterName": "Sarah Johnson",
  "companyName": "TechCorp"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subject": "Exciting Senior React Developer Opportunity at TechCorp",
    "body": "Hi John,\n\nIt was great meeting you at the React Conference last month! I was impressed by your presentation on state management...\n\nI'm reaching out because we have an exciting Senior React Developer position at TechCorp that I think would be perfect for you...",
    "tone": "friendly",
    "tokens": ["{{firstName}}", "{{currentTitle}}", "{{jobTitle}}"]
  }
}
```

### Example 2: Generate Response to Candidate

**Scenario**: A candidate asks about their application status.

**Request**:
```bash
POST /api/v1/ai/email/response
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "candidateEmail": "Hi, I applied for the Senior Engineer role two weeks ago. When can I expect to hear back about next steps?",
  "applicationId": "application-uuid",
  "tone": "professional",
  "context": "We are currently scheduling final round interviews"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subject": "Re: Application Status Update",
    "body": "Hi John,\n\nThank you for reaching out and for your patience. We appreciate your interest in the Senior Engineer position...\n\nWe are currently scheduling final round interviews and will be in touch within the next few days...",
    "tone": "professional",
    "tokens": []
  }
}
```

### Example 3: Generate Rejection Email

**Scenario**: You need to send a rejection email with constructive feedback.

**Request**:
```bash
POST /api/v1/ai/email/rejection
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "applicationId": "application-uuid",
  "tone": "friendly",
  "rejectionReason": "We decided to move forward with candidates who have more experience with our specific tech stack",
  "constructiveFeedback": "Your problem-solving approach during the technical interview was excellent. I'd recommend gaining more hands-on experience with Kubernetes and microservices architecture, which would make you a strong candidate for similar roles."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subject": "Update on Your Application for Senior Software Engineer",
    "body": "Dear John,\n\nThank you for taking the time to interview with us for the Senior Software Engineer position...\n\nAfter careful consideration, we've decided to move forward with candidates who have more experience with our specific tech stack...\n\nI wanted to share some feedback: Your problem-solving approach during the technical interview was excellent...",
    "tone": "friendly",
    "tokens": []
  }
}
```

## Frontend Integration

### Using the AI Email Assistant Component

```typescript
import { useState } from 'react';
import { AIEmailAssistant } from './components/communication';

function EmailComposerWithAI() {
  const [showAI, setShowAI] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleEmailGenerated = (generatedSubject: string, generatedBody: string) => {
    setSubject(generatedSubject);
    setBody(generatedBody);
  };

  return (
    <>
      <button onClick={() => setShowAI(true)}>
        ✨ Generate with AI
      </button>

      {showAI && (
        <AIEmailAssistant
          candidateId="candidate-uuid"
          jobId="job-uuid"
          mode="outreach"
          onEmailGenerated={handleEmailGenerated}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Your email composer UI */}
      <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />
    </>
  );
}
```

## Tone Selection Guide

### Professional
**Best for:**
- Executive roles
- Formal companies
- Legal/Finance sectors
- Initial outreach to senior candidates

**Characteristics:**
- Formal language
- Structured format
- Business-appropriate
- Respectful distance

### Friendly
**Best for:**
- Most recruiting scenarios
- Tech companies
- Mid-level positions
- Building relationships

**Characteristics:**
- Warm and approachable
- Professional but personable
- Conversational yet respectful
- Balanced tone

### Casual
**Best for:**
- Startups
- Creative roles
- Tech/Gaming companies
- Junior positions

**Characteristics:**
- Relaxed and informal
- Conversational
- Personal touch
- Approachable

## Tips for Best Results

### 1. Provide Context
The more context you provide, the better the AI can personalize:
- Mention where you found the candidate
- Reference specific skills or experiences
- Include mutual connections
- Add company culture details

### 2. Review and Edit
Always review AI-generated content:
- Check for accuracy
- Verify candidate details
- Adjust tone if needed
- Add personal touches

### 3. Iterate
If the first generation isn't perfect:
- Try a different tone
- Add more context
- Regenerate for variations
- Combine multiple generations

### 4. Use Personalization Tokens
The AI identifies tokens you can use in templates:
- `{{firstName}}` - Candidate's first name
- `{{currentTitle}}` - Current job title
- `{{jobTitle}}` - Job being recruited for
- And more...

## Common Issues

### "Failed to generate AI email"

**Cause**: OpenAI API error or missing API key

**Solution**:
1. Check `OPENAI_API_KEY` is set in `.env`
2. Verify API key is valid
3. Ensure you have GPT-4 access
4. Check OpenAI API status

### "Candidate not found"

**Cause**: Invalid candidate ID

**Solution**: Verify the candidate exists in your database

### Rate Limit Exceeded

**Cause**: Too many requests

**Solution**: Wait a moment and try again. Standard rate limits apply.

## API Rate Limits

- **Platform Rate Limit**: 100 requests per minute per user
- **OpenAI Rate Limit**: Depends on your OpenAI plan
- **Burst Capacity**: 200 requests

## Cost Considerations

Each AI generation uses approximately:
- **Tokens**: 300-600 tokens per generation
- **Cost**: ~$0.01-0.02 per generation (GPT-4 pricing)
- **Monthly Estimate**: For 1000 generations/month ≈ $10-20

## Testing

### Test with cURL

```bash
# Get available tones
curl -X GET http://localhost:3000/api/v1/ai/email/tones \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate outreach email
curl -X POST http://localhost:3000/api/v1/ai/email/outreach \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "your-candidate-id",
    "jobId": "your-job-id",
    "tone": "friendly"
  }'
```

### Test with Postman

1. Import the API endpoints
2. Set Authorization header with JWT token
3. Test each endpoint with sample data
4. Verify responses

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test the endpoints
3. ✅ Integrate into your email composer
4. ✅ Train your team on tone selection
5. ✅ Monitor usage and costs
6. ✅ Collect feedback for improvements

## Support

For issues or questions:
1. Check the logs: `apps/backend/logs/`
2. Review API documentation: `apps/backend/src/modules/ai/API.md`
3. Check OpenAI status: https://status.openai.com/

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
- [Module README](./README.md)
- [Full API Documentation](./API.md)
