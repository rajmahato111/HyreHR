# Communication Module

This module handles all communication-related functionality including email integration, templates, activity feeds, and tracking.

## Features

### 1. Email Integration

- **Gmail Integration**: Send and receive emails via Gmail API
- **Outlook Integration**: Send and receive emails via Microsoft Graph API
- **Email Sync**: Automatically sync emails from providers
- **Threading**: Support for email threads and conversations
- **Attachments**: Handle email attachments

### 2. Email Templates

- **CRUD Operations**: Create, read, update, delete templates
- **Variable Substitution**: Dynamic content with `{{variableName}}` syntax
- **Categories**: Organize templates by category (outreach, interview, rejection, offer, follow-up)
- **Sharing**: Share templates across organization
- **Preview**: Preview templates with sample data
- **Default Templates**: Pre-built templates for common scenarios

### 3. Email Tracking

- **Open Tracking**: Track when emails are opened using tracking pixels
- **Click Tracking**: Track link clicks in emails
- **Delivery Status**: Monitor email delivery status
- **Analytics**: Aggregate statistics (open rate, click rate, etc.)

### 4. Activity Feed

- **Unified Timeline**: Combined view of all candidate interactions
- **Multiple Activity Types**: Emails, notes, stage changes, interviews, feedback
- **User Attribution**: Track who performed each action
- **Filtering**: Filter by date range, type, etc.
- **Summary Statistics**: Activity summaries for time periods

### 5. Notes and @Mentions

- **Internal Notes**: Add private notes to candidates/applications
- **@Mentions**: Mention team members in notes
- **Notifications**: Notify mentioned users (integration point)

## API Endpoints

### Email Operations

```
POST   /api/v1/communication/emails/send
POST   /api/v1/communication/emails/sync
GET    /api/v1/communication/emails/thread/:threadId
```

### Notes

```
POST   /api/v1/communication/notes
```

### Communications

```
GET    /api/v1/communication/communications
GET    /api/v1/communication/communications/:id
```

### Email Templates

```
POST   /api/v1/communication/templates
GET    /api/v1/communication/templates
GET    /api/v1/communication/templates/by-category
GET    /api/v1/communication/templates/:id
PUT    /api/v1/communication/templates/:id
DELETE /api/v1/communication/templates/:id
POST   /api/v1/communication/templates/:id/duplicate
PUT    /api/v1/communication/templates/:id/share
POST   /api/v1/communication/templates/:id/preview
POST   /api/v1/communication/templates/default
```

### Activity Feed

```
GET    /api/v1/communication/activity/candidate/:candidateId
GET    /api/v1/communication/activity/application/:applicationId
GET    /api/v1/communication/activity/candidate/:candidateId/summary
```

### Email Tracking

```
GET    /api/v1/communication/track/open/:communicationId
GET    /api/v1/communication/track/click/:communicationId
GET    /api/v1/communication/track/stats/:communicationId
POST   /api/v1/communication/track/stats/aggregate
```

## Environment Variables

```env
# Email Provider (gmail or outlook)
EMAIL_PROVIDER=gmail

# Gmail Configuration
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Microsoft Configuration
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback

# API Base URL (for tracking links)
API_BASE_URL=http://localhost:3000
```

## Usage Examples

### Send an Email

```typescript
POST /api/v1/communication/emails/send
{
  "toEmails": ["candidate@example.com"],
  "subject": "Interview Invitation",
  "body": "<p>Hi John, we'd like to invite you for an interview...</p>",
  "candidateId": "uuid",
  "applicationId": "uuid",
  "templateId": "uuid",
  "templateVariables": {
    "candidateName": "John Doe",
    "jobTitle": "Software Engineer",
    "interviewDate": "2025-11-20"
  }
}
```

### Create a Note with Mentions

```typescript
POST /api/v1/communication/notes
{
  "body": "@john.doe Please review this candidate's resume. They have great experience!",
  "candidateId": "uuid",
  "mentions": ["user-uuid-1"]
}
```

### Create an Email Template

```typescript
POST /api/v1/communication/templates
{
  "name": "Phone Screen Invitation",
  "subject": "Phone screen for {{jobTitle}} at {{companyName}}",
  "body": "Hi {{candidateName}},\n\nWe'd like to schedule a phone screen...",
  "category": "interview",
  "variables": ["candidateName", "jobTitle", "companyName"]
}
```

### Get Candidate Activity Feed

```typescript
GET /api/v1/communication/activity/candidate/:candidateId?limit=50

Response:
[
  {
    "id": "uuid",
    "type": "email",
    "timestamp": "2025-11-15T10:30:00Z",
    "user": {
      "id": "uuid",
      "name": "Jane Smith",
      "avatarUrl": "https://..."
    },
    "data": {
      "subject": "Interview Invitation",
      "direction": "outbound",
      "status": "opened"
    }
  },
  {
    "id": "uuid",
    "type": "stage_change",
    "timestamp": "2025-11-14T15:20:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe"
    },
    "data": {
      "fromStage": "Applied",
      "toStage": "Phone Screen",
      "automated": false
    }
  }
]
```

## Email Template Variables

Common variables available in templates:

- `{{candidateName}}` - Candidate's full name
- `{{candidateFirstName}}` - Candidate's first name
- `{{candidateEmail}}` - Candidate's email
- `{{jobTitle}}` - Job title
- `{{companyName}}` - Company name
- `{{recruiterName}}` - Recruiter's name
- `{{recruiterEmail}}` - Recruiter's email
- `{{interviewDate}}` - Interview date
- `{{interviewTime}}` - Interview time
- `{{interviewerName}}` - Interviewer's name
- `{{location}}` - Interview location
- `{{duration}}` - Interview duration
- `{{salary}}` - Salary offer
- `{{startDate}}` - Start date
- `{{benefits}}` - Benefits description

## Email Tracking

### How It Works

1. **Open Tracking**: A 1x1 transparent pixel is injected into the email body. When the email is opened, the pixel is loaded, triggering a request to our tracking endpoint.

2. **Click Tracking**: All links in the email are replaced with tracked links that redirect through our server, allowing us to record clicks before redirecting to the original URL.

### Tracking Pixel

```html
<img src="https://api.example.com/api/v1/communication/track/open/uuid" 
     width="1" height="1" style="display:none" alt="" />
```

### Tracked Link

```
Original: https://example.com/job-posting
Tracked:  https://api.example.com/api/v1/communication/track/click/uuid?url=https%3A%2F%2Fexample.com%2Fjob-posting
```

## Activity Feed Types

The activity feed includes the following types:

1. **email** - Outbound and inbound emails
2. **note** - Internal notes and comments
3. **stage_change** - Pipeline stage transitions
4. **application** - New applications
5. **interview** - Scheduled interviews
6. **feedback** - Interview feedback submissions

## Database Schema

### communications

- Stores all communication records (emails, notes, calls, SMS)
- Links to candidates and applications
- Tracks status and timestamps
- Stores metadata including mentions

### email_templates

- Stores reusable email templates
- Supports variable substitution
- Categorized for easy organization
- Can be shared across organization

## Integration with Other Modules

- **Candidates Module**: Links communications to candidates
- **Applications Module**: Links communications to applications
- **Interviews Module**: Activity feed includes interview data
- **Auth Module**: User attribution for all activities
- **Notifications Module**: (Future) Send notifications for mentions

## Future Enhancements

- SMS integration via Twilio
- WhatsApp integration
- Slack/Teams integration for notifications
- AI-powered email suggestions
- Sentiment analysis on communications
- Automated follow-up reminders
- Email scheduling (send later)
- Email sequences/drip campaigns
- Rich text editor integration
- Email signature management
