# Job Board Integration API

## Endpoints

### Post Job to Board

Post a job to a specific job board.

**Endpoint:** `POST /jobs/:jobId/postings`

**Authentication:** Required (JWT)

**Permissions:** `jobs:update`

**Path Parameters:**
- `jobId` (UUID): The job ID to post

**Request Body:**
```json
{
  "integrationId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "posting_1234567890_abc123",
  "jobId": "uuid",
  "integrationId": "uuid",
  "jobBoardName": "LinkedIn",
  "externalId": "linkedin_job_id",
  "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
  "status": "active",
  "postedAt": "2025-11-16T10:00:00Z",
  "lastSyncAt": "2025-11-16T10:00:00Z",
  "metadata": {
    "companyId": "12345",
    "state": "LISTED"
  },
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Job is not open or integration is invalid
- `404 Not Found`: Job or integration not found
- `403 Forbidden`: Insufficient permissions

---

### Get Job Postings

Get all postings for a specific job.

**Endpoint:** `GET /jobs/:jobId/postings`

**Authentication:** Required (JWT)

**Permissions:** `jobs:read`

**Path Parameters:**
- `jobId` (UUID): The job ID

**Response:** `200 OK`
```json
[
  {
    "id": "posting_1234567890_abc123",
    "jobId": "uuid",
    "integrationId": "uuid",
    "jobBoardName": "LinkedIn",
    "externalId": "linkedin_job_id",
    "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
    "status": "active",
    "postedAt": "2025-11-16T10:00:00Z",
    "lastSyncAt": "2025-11-16T10:00:00Z",
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:00:00Z"
  },
  {
    "id": "posting_1234567891_def456",
    "jobId": "uuid",
    "integrationId": "uuid",
    "jobBoardName": "Indeed",
    "externalId": "indeed_job_id",
    "url": "https://www.indeed.com/viewjob?jk=indeed_job_id",
    "status": "active",
    "postedAt": "2025-11-16T10:05:00Z",
    "lastSyncAt": "2025-11-16T10:05:00Z",
    "createdAt": "2025-11-16T10:05:00Z",
    "updatedAt": "2025-11-16T10:05:00Z"
  }
]
```

**Error Responses:**
- `404 Not Found`: Job not found
- `403 Forbidden`: Insufficient permissions

---

### Update Job on Board

Update a job posting when job details change.

**Endpoint:** `PUT /jobs/:jobId/postings/:postingId`

**Authentication:** Required (JWT)

**Permissions:** `jobs:update`

**Path Parameters:**
- `jobId` (UUID): The job ID
- `postingId` (string): The posting ID

**Response:** `200 OK`
```json
{
  "id": "posting_1234567890_abc123",
  "jobId": "uuid",
  "integrationId": "uuid",
  "jobBoardName": "LinkedIn",
  "externalId": "linkedin_job_id",
  "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
  "status": "active",
  "postedAt": "2025-11-16T10:00:00Z",
  "lastSyncAt": "2025-11-16T11:00:00Z",
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T11:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Job or posting not found
- `400 Bad Request`: Update failed
- `403 Forbidden`: Insufficient permissions

---

### Close Job on Board

Close a job posting on a job board.

**Endpoint:** `DELETE /jobs/:jobId/postings/:postingId`

**Authentication:** Required (JWT)

**Permissions:** `jobs:update`

**Path Parameters:**
- `jobId` (UUID): The job ID
- `postingId` (string): The posting ID

**Response:** `200 OK`
```json
{
  "message": "Job posting closed successfully"
}
```

**Error Responses:**
- `404 Not Found`: Job or posting not found
- `400 Bad Request`: Close failed
- `403 Forbidden`: Insufficient permissions

---

### Sync Job Posting

Manually sync posting status from job board.

**Endpoint:** `POST /jobs/:jobId/postings/:postingId/sync`

**Authentication:** Required (JWT)

**Permissions:** `jobs:read`

**Path Parameters:**
- `jobId` (UUID): The job ID
- `postingId` (string): The posting ID

**Response:** `200 OK`
```json
{
  "id": "posting_1234567890_abc123",
  "jobId": "uuid",
  "integrationId": "uuid",
  "jobBoardName": "LinkedIn",
  "externalId": "linkedin_job_id",
  "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
  "status": "active",
  "postedAt": "2025-11-16T10:00:00Z",
  "lastSyncAt": "2025-11-16T12:00:00Z",
  "metadata": {
    "companyId": "12345",
    "state": "LISTED"
  },
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T12:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Job or posting not found
- `400 Bad Request`: Sync failed
- `403 Forbidden`: Insufficient permissions

---

## Data Models

### JobBoardPostingRecord

```typescript
{
  id: string;                    // Unique posting ID
  jobId: string;                 // Job UUID
  integrationId: string;         // Integration UUID
  jobBoardName: string;          // "LinkedIn", "Indeed", "Glassdoor"
  externalId: string;            // Job board's job ID
  url?: string;                  // Public job posting URL
  status: 'active' | 'closed' | 'expired' | 'error';
  postedAt: Date;                // When job was posted
  lastSyncAt?: Date;             // Last sync timestamp
  metadata?: Record<string, any>; // Job board specific data
  error?: string;                // Error message if status is "error"
  createdAt: Date;
  updatedAt: Date;
}
```

### Posting Status Values

- `active`: Job is currently posted and accepting applications
- `closed`: Job posting has been closed
- `expired`: Job posting has expired (based on job board rules)
- `error`: Error occurred during posting or sync

---

## Example Workflows

### Post Job to Multiple Boards

```typescript
// 1. Get available integrations
GET /integrations?provider=linkedin,indeed,glassdoor

// 2. Post to LinkedIn
POST /jobs/job-uuid/postings
{
  "integrationId": "linkedin-integration-uuid"
}

// 3. Post to Indeed
POST /jobs/job-uuid/postings
{
  "integrationId": "indeed-integration-uuid"
}

// 4. Post to Glassdoor
POST /jobs/job-uuid/postings
{
  "integrationId": "glassdoor-integration-uuid"
}

// 5. Verify all postings
GET /jobs/job-uuid/postings
```

### Update Job and Sync Postings

```typescript
// 1. Update job details
PUT /jobs/job-uuid
{
  "title": "Updated Job Title",
  "description": "Updated description"
}

// 2. Get all postings
GET /jobs/job-uuid/postings

// 3. Update each posting
PUT /jobs/job-uuid/postings/posting-1-id
PUT /jobs/job-uuid/postings/posting-2-id
PUT /jobs/job-uuid/postings/posting-3-id
```

### Close Job and Remove Postings

```typescript
// 1. Close job
PATCH /jobs/job-uuid/status
{
  "status": "closed"
}

// 2. Get all postings
GET /jobs/job-uuid/postings

// 3. Close each posting
DELETE /jobs/job-uuid/postings/posting-1-id
DELETE /jobs/job-uuid/postings/posting-2-id
DELETE /jobs/job-uuid/postings/posting-3-id
```

### Monitor Posting Status

```typescript
// 1. Get all postings
GET /jobs/job-uuid/postings

// 2. Sync each posting to get latest status
POST /jobs/job-uuid/postings/posting-1-id/sync
POST /jobs/job-uuid/postings/posting-2-id/sync

// 3. Check for errors
// If status is "error", check the error field for details
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Only open jobs can be posted to job boards | Job must have status "open" |
| 400 | Job board {provider} is not supported | Invalid job board provider |
| 400 | LinkedIn posting failed: {message} | LinkedIn API error |
| 400 | Indeed posting failed: {message} | Indeed API error |
| 400 | Glassdoor posting failed: {message} | Glassdoor API error |
| 404 | Job with ID {id} not found | Job doesn't exist |
| 404 | Integration with ID {id} not found | Integration doesn't exist |
| 404 | Posting with ID {id} not found | Posting doesn't exist |
| 403 | Forbidden | Insufficient permissions |
| 401 | Unauthorized | Authentication required |

---

## Rate Limits

Job board APIs have different rate limits:

- **LinkedIn**: 100 requests/hour per access token
- **Indeed**: 1000 requests/day per API key
- **Glassdoor**: 500 requests/hour per API key

Consider implementing rate limiting and request queuing for high-volume posting.

---

## Webhooks

Job board integrations can trigger webhooks for the following events:

- `job_board.posting.created`: When a job is posted to a board
- `job_board.posting.updated`: When a posting is updated
- `job_board.posting.closed`: When a posting is closed
- `job_board.posting.sync_failed`: When a sync fails

Configure webhooks in the integration settings to receive real-time notifications.
