# AI Email Assistant

The AI Email Assistant is a powerful feature that helps recruiters generate personalized, professional emails using AI. It's integrated into the EmailComposer component and also available as a standalone component.

## Features

### 1. AI Email Generation Button
- Accessible via the "AI Assistant" button in the email composer
- Generates emails based on candidate and job context
- Supports multiple email types: outreach, response, and rejection

### 2. Tone Selector
Three tone options are available:
- **Professional**: Formal and professional tone
- **Friendly**: Warm and friendly while maintaining professionalism
- **Casual**: Casual and conversational tone

### 3. Additional Context
- Optional text area for adding specific details
- Helps AI generate more personalized content
- Can include meeting notes, specific requirements, or other relevant information

### 4. Email Preview
- Shows generated subject and body before use
- Displays the tone used for generation
- Provides context about AI-generated content

### 5. Regeneration
- Regenerate button allows trying different variations
- Can change tone and context before regenerating
- Maintains conversation flow without losing progress

### 6. Edit & Use Options
- **Use This Email**: Directly inserts content into composer
- **Edit & Use**: Inserts content and allows immediate editing
- **Regenerate**: Creates a new version with current settings

## Usage

### In EmailComposer

```tsx
import { EmailComposer } from '../components/communication';

<EmailComposer
  candidateId="candidate-uuid"
  applicationId="application-uuid"
  jobId="job-uuid"
  emailType="outreach" // or 'response' or 'rejection'
  onClose={() => setShowComposer(false)}
  onSent={() => handleEmailSent()}
/>
```

### Standalone Component

```tsx
import { AIEmailAssistant } from '../components/communication';

<AIEmailAssistant
  candidateId="candidate-uuid"
  applicationId="application-uuid"
  jobId="job-uuid"
  emailType="outreach"
  onGenerated={(content) => {
    setSubject(content.subject);
    setBody(content.body);
  }}
  onClose={() => setShowAssistant(false)}
/>
```

## Email Types

### Outreach Email
Used for initial candidate outreach. Requires:
- `candidateId`: The candidate to reach out to
- `jobId`: The job to mention in the email

Example use case: Sourcing candidates from talent pools

### Response Email
Used for responding to candidate inquiries. Requires:
- `candidateId`: The candidate responding to
- `applicationId` (optional): For context about their application

Example use case: Answering candidate questions about the process

### Rejection Email
Used for sending rejection notifications. Requires:
- `applicationId`: The application being rejected

Example use case: Notifying candidates who weren't selected

## API Integration

The component integrates with the following backend endpoints:

- `POST /ai/email/outreach` - Generate outreach emails
- `POST /ai/email/response` - Generate response emails
- `POST /ai/email/rejection` - Generate rejection emails
- `GET /ai/email/tones` - Get available tone options

## User Experience Flow

1. **Open AI Assistant**: Click "AI Assistant" button in email composer
2. **Select Tone**: Choose from Professional, Friendly, or Casual
3. **Add Context** (Optional): Provide additional details for personalization
4. **Generate**: Click "Generate Email with AI"
5. **Review**: Preview the generated subject and body
6. **Action**: Choose to use, edit, or regenerate the email

## Best Practices

### For Recruiters

1. **Choose the Right Tone**:
   - Use Professional for executive roles or formal companies
   - Use Friendly for most tech and startup roles
   - Use Casual for creative roles or very informal cultures

2. **Provide Context**:
   - Mention specific skills or projects you noticed
   - Reference mutual connections or shared interests
   - Include details about why they're a good fit

3. **Review Before Sending**:
   - Always review AI-generated content
   - Personalize with specific details
   - Ensure accuracy of all information

4. **Iterate if Needed**:
   - Don't hesitate to regenerate if the first version isn't perfect
   - Try different tones to see what works best
   - Add more context for better results

### For Developers

1. **Error Handling**:
   - Always handle API errors gracefully
   - Provide clear error messages to users
   - Allow retry on failure

2. **Loading States**:
   - Show loading indicators during generation
   - Disable buttons to prevent duplicate requests
   - Provide feedback on long-running operations

3. **Context Management**:
   - Pass relevant IDs (candidate, application, job)
   - Ensure email type matches the context
   - Validate required fields before generation

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:
- Modifying the gradient backgrounds
- Changing button colors
- Adjusting spacing and sizing

### Behavior
Customize the component behavior by:
- Modifying default tone selection
- Adjusting preview modal size
- Changing button labels and icons

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 13.1**: AI generates personalized outreach emails using candidate profile and job description
- **Requirement 13.4**: Tone selection (friendly, professional, casual) is supported
- **Additional Features**:
  - Regeneration capability for iterating on content
  - Preview before using generated content
  - Edit option for fine-tuning AI output
  - Standalone component for flexible integration

## Future Enhancements

Potential improvements for future iterations:

1. **Template Learning**: Learn from recruiter edits to improve future generations
2. **Multi-language Support**: Generate emails in different languages
3. **A/B Testing**: Track which tones and styles get better response rates
4. **Smart Suggestions**: Suggest best tone based on candidate profile
5. **Batch Generation**: Generate emails for multiple candidates at once
6. **Email History**: Show previously generated emails for reference
