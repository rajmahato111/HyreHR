# Calendar Integration

This module provides calendar integration for interview scheduling with support for Google Calendar and Microsoft Outlook/Office 365.

## Features

- **Multi-Provider Support**: Integrates with both Google Calendar and Microsoft Outlook
- **OAuth 2.0 Authentication**: Secure authorization flow for calendar access
- **Availability Management**: Fetch free/busy information from user calendars
- **Event Management**: Create, update, and delete calendar events
- **Conflict Detection**: Check for scheduling conflicts before booking
- **Timezone Handling**: Full timezone support with conversion utilities
- **Working Hours**: Configure and respect user working hours
- **Common Availability**: Find time slots that work for multiple participants

## Services

### GoogleCalendarService

Handles integration with Google Calendar API.

**Key Methods:**
- `getAuthUrl()`: Generate OAuth authorization URL
- `getTokensFromCode(code)`: Exchange authorization code for tokens
- `getAvailability(credentials, startDate, endDate)`: Fetch free/busy slots
- `createEvent(credentials, event)`: Create calendar event with Google Meet link
- `updateEvent(credentials, eventId, updates)`: Update existing event
- `deleteEvent(credentials, eventId)`: Delete calendar event
- `hasConflicts(credentials, start, end)`: Check for scheduling conflicts

### MicrosoftCalendarService

Handles integration with Microsoft Graph API for Outlook/Office 365.

**Key Methods:**
- `getAuthUrl()`: Generate OAuth authorization URL
- `getTokensFromCode(code)`: Exchange authorization code for tokens
- `getAvailability(credentials, startDate, endDate)`: Fetch free/busy slots
- `createEvent(credentials, event)`: Create calendar event with Teams meeting
- `updateEvent(credentials, eventId, updates)`: Update existing event
- `deleteEvent(credentials, eventId)`: Delete calendar event
- `hasConflicts(credentials, start, end)`: Check for scheduling conflicts

### TimezoneService

Provides timezone conversion and working hours management.

**Key Methods:**
- `convertTimezone(date, fromTz, toTz)`: Convert date between timezones
- `formatInTimezone(date, timezone, format)`: Format date in specific timezone
- `isWithinWorkingHours(date, workingHours, timezone)`: Check if time is within working hours
- `filterByWorkingHours(slots, workingHours, timezone)`: Filter slots by working hours
- `generateTimeSlots(start, end, duration, timezone, workingHours)`: Generate available slots
- `findCommonAvailability(userAvailabilities, duration)`: Find overlapping free time

### CalendarService

Unified service that abstracts provider-specific implementations.

**Key Methods:**
- `getAuthUrl(provider)`: Get OAuth URL for any provider
- `exchangeCodeForTokens(provider, code)`: Exchange code for tokens
- `getUserAvailability(userId, startDate, endDate)`: Get user's availability
- `findCommonAvailability(userIds, startDate, endDate, duration)`: Find common free time
- `createInterviewEvent(userId, event)`: Create interview calendar event
- `updateInterviewEvent(userId, eventId, updates)`: Update interview event
- `deleteInterviewEvent(userId, eventId)`: Delete interview event
- `hasConflicts(userId, start, end)`: Check for conflicts
- `generateAvailableSlots(userIds, startDate, endDate, duration, timezone)`: Generate bookable slots

## API Endpoints

### Calendar Connection

**Get Authorization URL**
```
GET /interviews/calendar/auth-url?provider=google
```

**Connect Calendar**
```
POST /interviews/calendar/connect
Body: {
  "provider": "google",
  "code": "authorization_code"
}
```

**Disconnect Calendar**
```
DELETE /interviews/calendar/disconnect
```

### Availability

**Get My Availability**
```
GET /interviews/calendar/availability?startDate=2025-11-20T00:00:00Z&endDate=2025-11-27T23:59:59Z
```

**Find Common Availability**
```
POST /interviews/calendar/availability/common
Body: {
  "userIds": ["uuid-1", "uuid-2"],
  "startDate": "2025-11-20T00:00:00Z",
  "endDate": "2025-11-27T23:59:59Z",
  "durationMinutes": 60,
  "targetTimezone": "America/New_York"
}
```

**Generate Available Slots**
```
POST /interviews/calendar/availability/slots
Body: {
  "userIds": ["uuid-1", "uuid-2"],
  "startDate": "2025-11-20T00:00:00Z",
  "endDate": "2025-11-27T23:59:59Z",
  "durationMinutes": 60,
  "targetTimezone": "America/New_York"
}
```

### Conflict Detection

**Check for Conflicts**
```
POST /interviews/calendar/conflicts/check
Body: {
  "start": "2025-11-20T14:00:00Z",
  "end": "2025-11-20T15:00:00Z",
  "userIds": ["uuid-1", "uuid-2"]
}
```

### Calendar Events

**Get My Calendar Events**
```
GET /interviews/calendar/events?startDate=2025-11-20T00:00:00Z&endDate=2025-11-27T23:59:59Z
```

### Configuration

**Update Working Hours**
```
PUT /interviews/calendar/working-hours
Body: {
  "workingHours": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00" }
  ]
}
```

**Update Timezone**
```
PUT /interviews/calendar/timezone
Body: {
  "timezone": "America/New_York"
}
```

## Setup

### Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/v1/interviews/calendar/callback`
6. Set environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/interviews/calendar/callback
   ```

### Microsoft Calendar API

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application in Azure AD
3. Add API permissions:
   - Calendars.ReadWrite
   - Calendars.Read.Shared
   - OnlineMeetings.ReadWrite
4. Add redirect URI: `http://localhost:3000/api/v1/interviews/calendar/callback`
5. Create a client secret
6. Set environment variables:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   MICROSOFT_REDIRECT_URI=http://localhost:3000/api/v1/interviews/calendar/callback
   ```

## Usage Example

### Connecting a Calendar

```typescript
// 1. Get authorization URL
const authUrl = await calendarService.getAuthUrl(CalendarProvider.GOOGLE);
// Redirect user to authUrl

// 2. After user authorizes, exchange code for tokens
const credentials = await calendarService.exchangeCodeForTokens(
  CalendarProvider.GOOGLE,
  authorizationCode
);

// 3. Save credentials
await calendarService.saveUserCalendarCredentials(
  userId,
  CalendarProvider.GOOGLE,
  credentials
);
```

### Finding Available Time Slots

```typescript
// Find common availability for multiple users
const slots = await calendarService.generateAvailableSlots(
  ['user-1', 'user-2', 'user-3'],
  new Date('2025-11-20'),
  new Date('2025-11-27'),
  60, // 60 minutes duration
  'America/New_York'
);

// slots will contain all available time slots that work for all users
```

### Creating an Interview Event

```typescript
const event = await calendarService.createInterviewEvent(userId, {
  summary: 'Technical Interview - John Doe',
  description: 'Technical interview for Senior Engineer position',
  start: new Date('2025-11-20T14:00:00Z'),
  end: new Date('2025-11-20T15:00:00Z'),
  attendees: ['candidate@example.com', 'interviewer@example.com'],
  includeVideoConference: true, // Creates Google Meet or Teams link
});

// event.meetingLink will contain the video conference URL
```

### Checking for Conflicts

```typescript
const conflicts = await calendarService.hasConflictsForMultipleUsers(
  ['user-1', 'user-2'],
  new Date('2025-11-20T14:00:00Z'),
  new Date('2025-11-20T15:00:00Z')
);

// conflicts = [
//   { userId: 'user-1', hasConflict: false },
//   { userId: 'user-2', hasConflict: true }
// ]
```

## Working Hours Configuration

Working hours are defined per user and respect their timezone:

```typescript
const workingHours = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
];

await calendarService.updateUserWorkingHours(userId, workingHours);
```

Days of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

## Timezone Support

The system uses IANA timezone identifiers (e.g., 'America/New_York', 'Europe/London').

**Common Operations:**

```typescript
// Convert between timezones
const converted = timezoneService.convertTimezone(
  date,
  'America/Los_Angeles',
  'America/New_York'
);

// Format in specific timezone
const formatted = timezoneService.formatInTimezone(
  date,
  'America/New_York',
  'MMM DD, YYYY h:mm A z'
);

// Get timezone display name
const display = timezoneService.getTimezoneDisplayName('America/New_York');
// "America/New_York (UTC-05:00) EST"
```

## Error Handling

All calendar operations include proper error handling:

- **Authentication Errors**: Thrown when OAuth tokens are invalid or expired
- **Permission Errors**: Thrown when calendar access is denied
- **Conflict Errors**: Returned when scheduling conflicts are detected
- **Validation Errors**: Thrown for invalid input (dates, timezones, etc.)

## Security Considerations

1. **Token Storage**: Calendar credentials are stored encrypted in the database
2. **Token Refresh**: Access tokens are automatically refreshed when expired
3. **Scope Limitation**: Only request necessary calendar permissions
4. **User Consent**: Users must explicitly authorize calendar access
5. **Data Privacy**: Calendar data is only accessed when needed for scheduling

## Testing

```bash
# Run tests
npm test

# Test calendar integration
npm test -- calendar.service.spec.ts
```

## Future Enhancements

- [ ] Support for additional calendar providers (Apple Calendar, etc.)
- [ ] Recurring interview schedules
- [ ] Room/resource booking integration
- [ ] Calendar sync for interview updates
- [ ] Bulk availability checking
- [ ] Smart scheduling suggestions based on historical data
