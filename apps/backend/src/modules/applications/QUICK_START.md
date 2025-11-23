# Applications Module - Quick Start Guide

## Setup

1. **Run the migration** to create the database tables:
```bash
cd apps/backend
npm run migration:run
```

2. **Run the seed** to populate default data:
```bash
npm run seed
```

3. **Start the development server**:
```bash
npm run dev
```

## Quick Test Flow

### 1. Login to get authentication token
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "recruiter@demo.com",
  "password": "recruiter123"
}
```

Save the `accessToken` from the response.

### 2. Get default pipeline stages
```bash
GET http://localhost:3000/applications/pipeline-stages?jobId=default
Authorization: Bearer <your-access-token>
```

You should see 6 default stages: Applied, Phone Screen, Technical Interview, Onsite Interview, Offer, Hired.

### 3. Create a candidate (if not exists)
```bash
POST http://localhost:3000/candidates
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "gdprConsent": true
}
```

### 4. Create a job (if not exists)
```bash
POST http://localhost:3000/jobs
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "description": "We are looking for a senior software engineer...",
  "departmentId": "<department-id-from-seed>",
  "locationIds": ["<location-id-from-seed>"],
  "employmentType": "full_time",
  "status": "open"
}
```

### 5. Create an application
```bash
POST http://localhost:3000/applications
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "candidateId": "<candidate-id>",
  "jobId": "<job-id>",
  "sourceType": "career_site"
}
```

The application will automatically be placed in the "Applied" stage.

### 6. Move application to next stage
```bash
POST http://localhost:3000/applications/<application-id>/move
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "stageId": "<phone-screen-stage-id>"
}
```

### 7. Rate the application
```bash
PUT http://localhost:3000/applications/<application-id>
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "rating": 4
}
```

### 8. View application history
```bash
GET http://localhost:3000/applications/<application-id>/history
Authorization: Bearer <your-access-token>
```

You should see all stage transitions with timestamps and user information.

### 9. Get rejection reasons
```bash
GET http://localhost:3000/applications/rejection-reasons/list
Authorization: Bearer <your-access-token>
```

### 10. Reject an application
```bash
POST http://localhost:3000/applications/<application-id>/reject
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "rejectionReasonId": "<rejection-reason-id>"
}
```

### 11. Bulk operations
```bash
# Bulk move
POST http://localhost:3000/applications/bulk/move
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "applicationIds": ["<app-id-1>", "<app-id-2>"],
  "stageId": "<target-stage-id>"
}

# Bulk reject
POST http://localhost:3000/applications/bulk/reject
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "applicationIds": ["<app-id-1>", "<app-id-2>"],
  "rejectionReasonId": "<rejection-reason-id>"
}
```

## Common Queries

### Get all applications for a job
```bash
GET http://localhost:3000/applications?jobId=<job-id>
Authorization: Bearer <your-access-token>
```

### Get all applications for a candidate
```bash
GET http://localhost:3000/applications?candidateId=<candidate-id>
Authorization: Bearer <your-access-token>
```

### Get applications in a specific stage
```bash
GET http://localhost:3000/applications?stageId=<stage-id>
Authorization: Bearer <your-access-token>
```

### Get rejected applications
```bash
GET http://localhost:3000/applications?status=rejected
Authorization: Bearer <your-access-token>
```

### Pagination
```bash
GET http://localhost:3000/applications?page=1&limit=20
Authorization: Bearer <your-access-token>
```

## Custom Pipeline Stages

### Create a custom stage for a specific job
```bash
POST http://localhost:3000/applications/pipeline-stages
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Culture Fit Interview",
  "type": "custom",
  "orderIndex": 3,
  "jobId": "<job-id>"
}
```

### Get stages for a specific job
```bash
GET http://localhost:3000/applications/pipeline-stages?jobId=<job-id>
Authorization: Bearer <your-access-token>
```

## Troubleshooting

### "No default pipeline stages found"
Run the seed script to create default stages:
```bash
npm run seed
```

Or initialize stages manually:
```bash
POST http://localhost:3000/applications/pipeline-stages/initialize
Authorization: Bearer <your-access-token>
```

### "Candidate has already applied to this job"
Each candidate can only have one active or hired application per job. Check existing applications:
```bash
GET http://localhost:3000/applications?candidateId=<candidate-id>&jobId=<job-id>
Authorization: Bearer <your-access-token>
```

### "Cannot delete stage with X applications"
Move all applications to a different stage before deleting:
```bash
# Get applications in the stage
GET http://localhost:3000/applications?stageId=<stage-id>

# Move them to another stage
POST http://localhost:3000/applications/bulk/move
{
  "applicationIds": ["..."],
  "stageId": "<new-stage-id>"
}

# Then delete the stage
DELETE http://localhost:3000/applications/pipeline-stages/<stage-id>
```

## Integration Points

This module integrates with:
- **Candidates Module**: Links applications to candidates
- **Jobs Module**: Links applications to job postings
- **Auth Module**: Uses JWT authentication and user context
- **Future: Interview Module**: Will link interviews to applications
- **Future: Communication Module**: Will track emails sent to applicants
- **Future: Analytics Module**: Will provide metrics on application funnel

## Database Queries

Useful SQL queries for debugging:

```sql
-- View all applications with candidate and job info
SELECT 
  a.id,
  c.first_name || ' ' || c.last_name as candidate_name,
  j.title as job_title,
  s.name as stage_name,
  a.status,
  a.applied_at
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN jobs j ON a.job_id = j.id
JOIN pipeline_stages s ON a.stage_id = s.id
ORDER BY a.applied_at DESC;

-- View application history
SELECT 
  ah.timestamp,
  fs.name as from_stage,
  ts.name as to_stage,
  u.first_name || ' ' || u.last_name as moved_by,
  ah.automated
FROM application_history ah
LEFT JOIN pipeline_stages fs ON ah.from_stage_id = fs.id
JOIN pipeline_stages ts ON ah.to_stage_id = ts.id
LEFT JOIN users u ON ah.user_id = u.id
WHERE ah.application_id = '<application-id>'
ORDER BY ah.timestamp DESC;

-- Count applications by stage
SELECT 
  s.name as stage_name,
  COUNT(a.id) as application_count
FROM pipeline_stages s
LEFT JOIN applications a ON s.id = a.stage_id AND a.status = 'active'
WHERE s.organization_id = '<org-id>'
GROUP BY s.id, s.name, s.order_index
ORDER BY s.order_index;
```

## Next Steps

After testing the Applications Module, you can:
1. Build the Candidate Pipeline UI (Task 9)
2. Integrate with Interview Scheduling (Task 12)
3. Add email notifications for stage changes (Task 16)
4. Build analytics dashboards (Task 25)
