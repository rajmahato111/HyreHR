# Applications Module

This module handles application lifecycle management, pipeline stages, and bulk operations for the recruiting platform.

## Features

### Pipeline Stage Management
- Create, read, update, and delete pipeline stages
- Support for default organization-wide stages
- Support for job-specific custom stages
- Initialize default stages for new organizations

### Application Lifecycle
- Create applications for candidates applying to jobs
- Track application status (active, rejected, withdrawn, hired)
- Move applications between pipeline stages with history tracking
- Rate applications (1-5 stars)
- Reject applications with optional rejection reasons
- View complete application history

### Bulk Operations
- Bulk move multiple applications to a new stage
- Bulk reject multiple applications with optional rejection reason

## API Endpoints

### Pipeline Stages

#### Create Pipeline Stage
```
POST /applications/pipeline-stages
Body: {
  "name": "Technical Interview",
  "type": "technical_interview",
  "orderIndex": 2,
  "jobId": "uuid" // optional, null for default stages
}
```

#### Get All Pipeline Stages
```
GET /applications/pipeline-stages?jobId=default
// jobId=default returns organization default stages
// jobId=<uuid> returns job-specific stages
// no jobId returns all stages
```

#### Get Single Pipeline Stage
```
GET /applications/pipeline-stages/:id
```

#### Update Pipeline Stage
```
PUT /applications/pipeline-stages/:id
Body: {
  "name": "Updated Name",
  "orderIndex": 3
}
```

#### Delete Pipeline Stage
```
DELETE /applications/pipeline-stages/:id
```

#### Initialize Default Stages
```
POST /applications/pipeline-stages/initialize
// Creates default stages: Applied, Phone Screen, Technical Interview, Onsite Interview, Offer, Hired
```

### Applications

#### Create Application
```
POST /applications
Body: {
  "candidateId": "uuid",
  "jobId": "uuid",
  "stageId": "uuid", // optional, defaults to "Applied" stage
  "sourceType": "career_site",
  "sourceDetails": {},
  "customFields": {}
}
```

#### Get All Applications
```
GET /applications?jobId=uuid&candidateId=uuid&stageId=uuid&status=active&page=1&limit=20
```

#### Get Single Application
```
GET /applications/:id
```

#### Update Application
```
PUT /applications/:id
Body: {
  "rating": 4,
  "customFields": {}
}
```

#### Move Application to Different Stage
```
POST /applications/:id/move
Body: {
  "stageId": "uuid"
}
```

#### Reject Application
```
POST /applications/:id/reject
Body: {
  "rejectionReasonId": "uuid" // optional
}
```

#### Get Application History
```
GET /applications/:id/history
// Returns all stage transitions with timestamps and user attribution
```

### Bulk Operations

#### Bulk Move Applications
```
POST /applications/bulk/move
Body: {
  "applicationIds": ["uuid1", "uuid2", "uuid3"],
  "stageId": "uuid"
}
Response: {
  "success": 3,
  "failed": 0
}
```

#### Bulk Reject Applications
```
POST /applications/bulk/reject
Body: {
  "applicationIds": ["uuid1", "uuid2", "uuid3"],
  "rejectionReasonId": "uuid" // optional
}
Response: {
  "success": 3,
  "failed": 0
}
```

### Rejection Reasons

#### Get All Rejection Reasons
```
GET /applications/rejection-reasons/list
```

## Database Schema

### pipeline_stages
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- name (varchar)
- type (enum: applied, phone_screen, technical_interview, onsite_interview, offer, hired, rejected, custom)
- order_index (integer)
- job_id (uuid, nullable, foreign key) - null for default stages
- created_at (timestamp)

### applications
- id (uuid, primary key)
- candidate_id (uuid, foreign key)
- job_id (uuid, foreign key)
- stage_id (uuid, foreign key)
- status (enum: active, rejected, withdrawn, hired)
- source_type (varchar)
- source_details (jsonb)
- applied_at (timestamp)
- stage_entered_at (timestamp)
- rejected_at (timestamp, nullable)
- rejection_reason_id (uuid, nullable, foreign key)
- hired_at (timestamp, nullable)
- rating (integer, 1-5, nullable)
- archived (boolean)
- custom_fields (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

### application_history
- id (uuid, primary key)
- application_id (uuid, foreign key)
- from_stage_id (uuid, nullable, foreign key)
- to_stage_id (uuid, foreign key)
- user_id (uuid, nullable, foreign key)
- automated (boolean)
- timestamp (timestamp)

### rejection_reasons
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- name (varchar)
- description (text, nullable)
- active (boolean)
- created_at (timestamp)

## Requirements Covered

This implementation covers the following requirements from the requirements document:

- **Requirement 2.1**: Visual kanban-style interface support with stage management
- **Requirement 2.2**: Stage change tracking with timestamp and user attribution
- **Requirement 2.2**: Bulk operations for moving and rejecting applications

## Usage Example

```typescript
// 1. Initialize default stages for a new organization
POST /applications/pipeline-stages/initialize

// 2. Create an application
POST /applications
{
  "candidateId": "candidate-uuid",
  "jobId": "job-uuid"
}

// 3. Move application to next stage
POST /applications/{applicationId}/move
{
  "stageId": "phone-screen-stage-uuid"
}

// 4. Rate the application
PUT /applications/{applicationId}
{
  "rating": 4
}

// 5. Reject application
POST /applications/{applicationId}/reject
{
  "rejectionReasonId": "not-qualified-uuid"
}

// 6. View application history
GET /applications/{applicationId}/history
```

## Testing

To test the implementation:

1. Run migrations: `npm run migration:run`
2. Run seeds: `npm run seed`
3. Start the server: `npm run dev`
4. Use the API endpoints with authentication token

Default test credentials:
- Admin: admin@demo.com / admin123
- Recruiter: recruiter@demo.com / recruiter123
