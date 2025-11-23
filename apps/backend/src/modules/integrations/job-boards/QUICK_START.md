# Job Board Integration Quick Start

Get started with job board integrations in 5 minutes.

## Prerequisites

- Active job board accounts (LinkedIn, Indeed, Glassdoor)
- API credentials from each job board
- At least one open job in the system

## Step 1: Set Up Integrations

### LinkedIn

```bash
# Create LinkedIn integration
curl -X POST http://localhost:3000/integrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LinkedIn Jobs",
    "provider": "linkedin",
    "authType": "oauth2",
    "config": {
      "companyId": "12345678"
    },
    "credentials": {
      "accessToken": "your_linkedin_access_token",
      "refreshToken": "your_linkedin_refresh_token"
    }
  }'
```

### Indeed

```bash
# Create Indeed integration
curl -X POST http://localhost:3000/integrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Indeed Jobs",
    "provider": "indeed",
    "authType": "api_key",
    "config": {
      "employerId": "your_employer_id",
      "applicationUrl": "https://your-careers-site.com/apply"
    },
    "credentials": {
      "apiKey": "your_indeed_api_key"
    }
  }'
```

### Glassdoor

```bash
# Create Glassdoor integration
curl -X POST http://localhost:3000/integrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Glassdoor Jobs",
    "provider": "glassdoor",
    "authType": "api_key",
    "config": {
      "employerId": "your_employer_id"
    },
    "credentials": {
      "apiKey": "your_glassdoor_api_key",
      "partnerId": "your_partner_id"
    }
  }'
```

## Step 2: Post a Job

```bash
# Post job to LinkedIn
curl -X POST http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "LINKEDIN_INTEGRATION_UUID"
  }'

# Response:
# {
#   "id": "posting_1234567890_abc123",
#   "jobBoardName": "LinkedIn",
#   "externalId": "linkedin_job_id",
#   "url": "https://www.linkedin.com/jobs/view/linkedin_job_id",
#   "status": "active",
#   "postedAt": "2025-11-16T10:00:00Z"
# }
```

## Step 3: Verify Posting

```bash
# Get all postings for a job
curl -X GET http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# [
#   {
#     "id": "posting_1234567890_abc123",
#     "jobBoardName": "LinkedIn",
#     "status": "active",
#     "url": "https://www.linkedin.com/jobs/view/linkedin_job_id"
#   }
# ]
```

## Step 4: Update Posting (Optional)

```bash
# Update job details first
curl -X PUT http://localhost:3000/jobs/JOB_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Job Title",
    "description": "Updated description"
  }'

# Then update the posting
curl -X PUT http://localhost:3000/jobs/JOB_UUID/postings/POSTING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 5: Close Posting

```bash
# Close posting when job is filled
curl -X DELETE http://localhost:3000/jobs/JOB_UUID/postings/POSTING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "message": "Job posting closed successfully"
# }
```

## Common Tasks

### Post to Multiple Boards

```bash
# Post to LinkedIn
curl -X POST http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"integrationId": "LINKEDIN_INTEGRATION_UUID"}'

# Post to Indeed
curl -X POST http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"integrationId": "INDEED_INTEGRATION_UUID"}'

# Post to Glassdoor
curl -X POST http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"integrationId": "GLASSDOOR_INTEGRATION_UUID"}'
```

### Sync Posting Status

```bash
# Manually sync a posting
curl -X POST http://localhost:3000/jobs/JOB_UUID/postings/POSTING_ID/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check Posting Status

```bash
# Get all postings and check status
curl -X GET http://localhost:3000/jobs/JOB_UUID/postings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.[] | {jobBoardName, status, lastSyncAt}'
```

## Troubleshooting

### Posting Failed

```bash
# Check integration health
curl -X POST http://localhost:3000/integrations/INTEGRATION_UUID/health/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verify credentials
curl -X GET http://localhost:3000/integrations/INTEGRATION_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Posting Not Appearing

1. Check posting status: `GET /jobs/:jobId/postings`
2. Sync posting: `POST /jobs/:jobId/postings/:postingId/sync`
3. Check for errors in the posting record
4. Verify job board account is active

### Update Not Reflecting

1. Update the job first: `PUT /jobs/:jobId`
2. Then update the posting: `PUT /jobs/:jobId/postings/:postingId`
3. Wait a few minutes for job board to process
4. Sync to verify: `POST /jobs/:jobId/postings/:postingId/sync`

## Best Practices

1. **Always validate integrations** before posting jobs
2. **Post to multiple boards** to maximize reach
3. **Update postings** when job details change
4. **Close postings** when jobs are filled
5. **Monitor status** regularly with sync
6. **Handle errors** gracefully and retry if needed

## Next Steps

- Set up automatic posting workflows
- Configure webhook notifications
- Monitor posting performance
- Integrate with analytics dashboard

## Support

For issues or questions:
- Check the [full documentation](./README.md)
- Review the [API documentation](./API.md)
- Contact support team
