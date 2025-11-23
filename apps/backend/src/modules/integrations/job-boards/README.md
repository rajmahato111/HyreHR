# Job Board Integrations

This module provides integration with major job boards for posting and managing job listings.

## Supported Job Boards

- **LinkedIn**: Post jobs to LinkedIn Jobs
- **Indeed**: Post jobs to Indeed
- **Glassdoor**: Post jobs to Glassdoor

## Features

- Post jobs to multiple job boards simultaneously
- Update job postings when job details change
- Close job postings when jobs are filled or closed
- Sync job posting status from job boards
- Track posting history and status
- Automatic scheduled sync every hour

## Setup

### LinkedIn Integration

1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/
2. Configure OAuth 2.0 credentials
3. Request access to LinkedIn Jobs API
4. Create integration in the platform:

```typescript
POST /integrations
{
  "name": "LinkedIn Jobs",
  "provider": "linkedin",
  "authType": "oauth2",
  "config": {
    "companyId": "your_linkedin_company_id"
  },
  "credentials": {
    "accessToken": "encrypted_access_token",
    "refreshToken": "encrypted_refresh_token"
  }
}
```

### Indeed Integration

1. Sign up for Indeed Publisher account at https://www.indeed.com/publisher
2. Get API key from Indeed Publisher dashboard
3. Create integration:

```typescript
POST /integrations
{
  "name": "Indeed Jobs",
  "provider": "indeed",
  "authType": "api_key",
  "config": {
    "employerId": "your_indeed_employer_id",
    "applicationUrl": "https://your-careers-site.com/apply"
  },
  "credentials": {
    "apiKey": "encrypted_api_key"
  }
}
```

### Glassdoor Integration

1. Apply for Glassdoor API access at https://www.glassdoor.com/developer/
2. Get API key and partner ID
3. Create integration:

```typescript
POST /integrations
{
  "name": "Glassdoor Jobs",
  "provider": "glassdoor",
  "authType": "api_key",
  "config": {
    "employerId": "your_glassdoor_employer_id"
  },
  "credentials": {
    "apiKey": "encrypted_api_key",
    "partnerId": "your_partner_id"
  }
}
```

## Usage

### Post Job to Board

Post a job to a specific job board:

```typescript
POST /jobs/:jobId/postings
{
  "integrationId": "integration_uuid"
}

Response:
{
  "id": "posting_1234567890_abc123",
  "jobId": "job_uuid",
  "integrationId": "integration_uuid",
  "jobBoardName": "LinkedIn",
  "externalId": "linkedin_job_id",
  "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
  "status": "active",
  "postedAt": "2025-11-16T10:00:00Z",
  "lastSyncAt": "2025-11-16T10:00:00Z",
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

### Get Job Postings

Get all postings for a job:

```typescript
GET /jobs/:jobId/postings

Response:
[
  {
    "id": "posting_1234567890_abc123",
    "jobBoardName": "LinkedIn",
    "externalId": "linkedin_job_id",
    "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
    "status": "active",
    "postedAt": "2025-11-16T10:00:00Z",
    "lastSyncAt": "2025-11-16T10:00:00Z"
  },
  {
    "id": "posting_1234567891_def456",
    "jobBoardName": "Indeed",
    "externalId": "indeed_job_id",
    "url": "https://www.indeed.com/viewjob?jk=indeed_job_id",
    "status": "active",
    "postedAt": "2025-11-16T10:05:00Z",
    "lastSyncAt": "2025-11-16T10:05:00Z"
  }
]
```

### Update Job on Board

Update a job posting when job details change:

```typescript
PUT /jobs/:jobId/postings/:postingId

Response:
{
  "id": "posting_1234567890_abc123",
  "status": "active",
  "lastSyncAt": "2025-11-16T11:00:00Z",
  "updatedAt": "2025-11-16T11:00:00Z"
}
```

### Close Job on Board

Close a job posting:

```typescript
DELETE /jobs/:jobId/postings/:postingId

Response:
{
  "message": "Job posting closed successfully"
}
```

### Sync Job Posting

Manually sync posting status from job board:

```typescript
POST /jobs/:jobId/postings/:postingId/sync

Response:
{
  "id": "posting_1234567890_abc123",
  "status": "active",
  "lastSyncAt": "2025-11-16T12:00:00Z",
  "updatedAt": "2025-11-16T12:00:00Z"
}
```

## Posting Status

Job postings can have the following statuses:

- `active`: Job is currently posted and accepting applications
- `closed`: Job posting has been closed
- `expired`: Job posting has expired (based on job board rules)
- `error`: Error occurred during posting or sync

## Automatic Sync

The system automatically syncs all active job postings every hour to:
- Update posting status
- Detect if postings were closed externally
- Track posting performance metrics

## Data Storage

Job board postings are stored in the job's `customFields.jobBoardPostings` array. Each posting record contains:

```typescript
{
  id: string;                    // Unique posting ID
  jobId: string;                 // Job UUID
  integrationId: string;         // Integration UUID
  jobBoardName: string;          // "LinkedIn", "Indeed", "Glassdoor"
  externalId: string;            // Job board's job ID
  url?: string;                  // Public job posting URL
  status: string;                // "active", "closed", "expired", "error"
  postedAt: Date;                // When job was posted
  lastSyncAt?: Date;             // Last sync timestamp
  metadata?: Record<string, any>; // Job board specific data
  error?: string;                // Error message if status is "error"
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Common Errors

**Invalid Credentials**
```json
{
  "statusCode": 400,
  "message": "LinkedIn posting failed: Invalid access token"
}
```

**Job Not Open**
```json
{
  "statusCode": 400,
  "message": "Only open jobs can be posted to job boards"
}
```

**Integration Not Found**
```json
{
  "statusCode": 404,
  "message": "Integration with ID xxx not found"
}
```

**Posting Not Found**
```json
{
  "statusCode": 404,
  "message": "Posting with ID xxx not found"
}
```

### Error Recovery

When a posting sync fails:
1. The posting status is set to `error`
2. The error message is stored in the posting record
3. The posting is skipped in subsequent automatic syncs
4. Manual sync can be attempted to retry

## Best Practices

1. **Validate Credentials**: Always validate integration credentials before posting
2. **Handle Errors Gracefully**: Check posting status and handle errors appropriately
3. **Sync Regularly**: Use automatic sync or trigger manual syncs after job updates
4. **Close Postings**: Always close postings when jobs are filled to avoid wasted applications
5. **Monitor Status**: Check posting status regularly to ensure jobs are live
6. **Update Postings**: Update postings when job details change to keep information current

## Rate Limiting

Each job board has different rate limits:

- **LinkedIn**: 100 requests per hour per access token
- **Indeed**: 1000 requests per day per API key
- **Glassdoor**: 500 requests per hour per API key

The system does not currently implement rate limiting. Consider implementing rate limiting if posting high volumes of jobs.

## Testing

Test job board integrations:

1. Create test integration with sandbox credentials
2. Post a test job
3. Verify posting appears on job board
4. Update the job and verify changes
5. Close the posting and verify it's removed

## Troubleshooting

### LinkedIn Issues

**Problem**: Access token expired
**Solution**: Refresh OAuth token using refresh token

**Problem**: Company ID not found
**Solution**: Verify company ID in LinkedIn Developer portal

### Indeed Issues

**Problem**: API key invalid
**Solution**: Regenerate API key in Indeed Publisher dashboard

**Problem**: Employer ID not found
**Solution**: Verify employer ID in Indeed account settings

### Glassdoor Issues

**Problem**: Partner ID invalid
**Solution**: Contact Glassdoor API support to verify partner ID

**Problem**: Posting not appearing
**Solution**: Glassdoor postings may take up to 24 hours to appear

## Future Enhancements

- Support for additional job boards (ZipRecruiter, Monster, etc.)
- Application tracking from job boards
- Performance analytics per job board
- A/B testing different job descriptions
- Automatic job board selection based on job type
- Bulk posting to multiple boards
- Posting templates per job board
