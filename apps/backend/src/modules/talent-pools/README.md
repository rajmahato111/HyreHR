# Talent Pools Module

This module implements the Talent Pool and CRM features for the recruiting platform, including talent pool management, email sequences, and saved searches.

## Features

### 1. Talent Pool Management

Manage collections of candidates for future opportunities with two types:

- **Static Pools**: Manually curated lists of candidates
- **Dynamic Pools**: Auto-updating pools based on criteria (skills, experience, location, etc.)

**Endpoints:**
- `POST /talent-pools` - Create a new talent pool
- `GET /talent-pools` - List all talent pools
- `GET /talent-pools/:id` - Get talent pool details
- `PUT /talent-pools/:id` - Update talent pool
- `DELETE /talent-pools/:id` - Delete talent pool
- `POST /talent-pools/:id/candidates` - Add candidates to static pool
- `DELETE /talent-pools/:id/candidates` - Remove candidates from static pool
- `POST /talent-pools/:id/sync` - Sync dynamic pool with criteria
- `GET /talent-pools/:id/candidates` - Get pool candidates

**Example: Create Static Pool**
```json
POST /talent-pools
{
  "name": "Senior Engineers",
  "description": "Experienced engineers for future roles",
  "type": "static",
  "tags": ["engineering", "senior"],
  "candidateIds": ["uuid1", "uuid2"]
}
```

**Example: Create Dynamic Pool**
```json
POST /talent-pools
{
  "name": "JavaScript Developers in SF",
  "description": "Auto-updating pool of JS devs",
  "type": "dynamic",
  "criteria": {
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": { "min": 3 },
    "location": ["San Francisco", "Bay Area"]
  }
}
```

### 2. Email Sequences

Create multi-step email campaigns for candidate outreach and engagement.

**Endpoints:**
- `POST /talent-pools/sequences` - Create email sequence
- `GET /talent-pools/sequences` - List all sequences
- `GET /talent-pools/sequences/:id` - Get sequence details
- `PUT /talent-pools/sequences/:id` - Update sequence
- `DELETE /talent-pools/sequences/:id` - Delete sequence
- `POST /talent-pools/sequences/:id/enroll` - Enroll candidates
- `GET /talent-pools/sequences/:id/enrollments` - Get enrollments
- `DELETE /talent-pools/sequences/:id/enrollments/:candidateId` - Unenroll candidate

**Example: Create Sequence**
```json
POST /talent-pools/sequences
{
  "name": "Engineering Outreach",
  "description": "3-step sequence for engineers",
  "steps": [
    {
      "order": 1,
      "subject": "Exciting opportunity at {{company}}",
      "body": "Hi {{firstName}}, I came across your profile...",
      "delayDays": 0,
      "delayHours": 0
    },
    {
      "order": 2,
      "subject": "Following up on my previous email",
      "body": "Hi {{firstName}}, Just wanted to follow up...",
      "delayDays": 3,
      "delayHours": 0
    },
    {
      "order": 3,
      "subject": "Last chance to connect",
      "body": "Hi {{firstName}}, This is my final email...",
      "delayDays": 5,
      "delayHours": 0
    }
  ]
}
```

**Example: Enroll Candidates**
```json
POST /talent-pools/sequences/:id/enroll
{
  "candidateIds": ["uuid1", "uuid2", "uuid3"],
  "poolId": "pool-uuid" // optional
}
```

### 3. Saved Searches

Save and reuse complex candidate search queries.

**Endpoints:**
- `POST /talent-pools/saved-searches` - Create saved search
- `GET /talent-pools/saved-searches` - List saved searches
- `GET /talent-pools/saved-searches/:id` - Get saved search
- `PUT /talent-pools/saved-searches/:id` - Update saved search
- `DELETE /talent-pools/saved-searches/:id` - Delete saved search
- `POST /talent-pools/saved-searches/:id/use` - Record usage

**Example: Create Saved Search**
```json
POST /talent-pools/saved-searches
{
  "name": "Senior Full Stack Engineers",
  "description": "Experienced full stack developers",
  "criteria": {
    "query": "full stack engineer",
    "skills": ["JavaScript", "Python", "React", "Django"],
    "experience": { "min": 5, "max": 10 },
    "location": ["San Francisco", "New York", "Remote"],
    "tags": ["engineering"]
  },
  "isShared": true
}
```

## Database Schema

### talent_pools
- `id` - UUID primary key
- `organization_id` - Organization reference
- `name` - Pool name
- `description` - Pool description
- `type` - 'static' or 'dynamic'
- `criteria` - JSONB criteria for dynamic pools
- `owner_id` - User who owns the pool
- `tags` - Array of tags
- `member_count` - Number of candidates
- `engagement_rate` - Engagement percentage
- `last_synced_at` - Last sync timestamp for dynamic pools
- `created_at`, `updated_at` - Timestamps

### talent_pool_members
- `pool_id` - Talent pool reference
- `candidate_id` - Candidate reference
- `added_at` - When candidate was added

### email_sequences
- `id` - UUID primary key
- `organization_id` - Organization reference
- `name` - Sequence name
- `description` - Sequence description
- `status` - 'draft', 'active', 'paused', 'archived'
- `steps` - JSONB array of sequence steps
- `created_by` - User who created the sequence
- `total_enrolled` - Total candidates enrolled
- `total_completed` - Total who completed sequence
- `total_replied` - Total who replied
- `open_rate` - Email open rate percentage
- `reply_rate` - Email reply rate percentage
- `created_at`, `updated_at` - Timestamps

### sequence_enrollments
- `id` - UUID primary key
- `sequence_id` - Email sequence reference
- `candidate_id` - Candidate reference
- `pool_id` - Optional talent pool reference
- `status` - 'active', 'completed', 'paused', 'unsubscribed', 'bounced'
- `current_step` - Current step index
- `next_send_at` - When to send next email
- `enrolled_at` - Enrollment timestamp
- `completed_at` - Completion timestamp
- `replied_at` - Reply timestamp
- `response_sentiment` - 'interested', 'not_interested', 'neutral'
- `emails_sent` - Number of emails sent
- `emails_opened` - Number of emails opened
- `emails_clicked` - Number of emails clicked
- `created_at`, `updated_at` - Timestamps

### saved_searches
- `id` - UUID primary key
- `organization_id` - Organization reference
- `user_id` - User who created the search
- `name` - Search name
- `description` - Search description
- `criteria` - JSONB search criteria
- `is_shared` - Whether search is shared with team
- `last_used_at` - Last usage timestamp
- `use_count` - Number of times used
- `created_at`, `updated_at` - Timestamps

## Services

### TalentPoolsService
Handles talent pool CRUD operations, candidate management, and dynamic pool syncing.

Key methods:
- `create()` - Create new talent pool
- `findAll()` - List all pools
- `findOne()` - Get pool details
- `update()` - Update pool
- `remove()` - Delete pool
- `addCandidates()` - Add candidates to static pool
- `removeCandidates()` - Remove candidates from static pool
- `syncDynamicPool()` - Sync dynamic pool based on criteria
- `getCandidates()` - Get pool candidates
- `updateEngagementMetrics()` - Update engagement metrics

### EmailSequencesService
Manages email sequences and enrollments.

Key methods:
- `create()` - Create email sequence
- `findAll()` - List all sequences
- `findOne()` - Get sequence details
- `update()` - Update sequence
- `remove()` - Delete sequence
- `enrollCandidates()` - Enroll candidates in sequence
- `getEnrollments()` - Get sequence enrollments
- `unenrollCandidate()` - Unenroll candidate
- `processScheduledEmails()` - Process due emails (called by scheduler)
- `recordEmailOpen()` - Track email opens
- `recordEmailClick()` - Track email clicks
- `recordResponse()` - Record candidate response

### SavedSearchesService
Manages saved search queries.

Key methods:
- `create()` - Create saved search
- `findAll()` - List saved searches (user's + shared)
- `findOne()` - Get saved search
- `update()` - Update saved search
- `remove()` - Delete saved search
- `recordUsage()` - Track search usage

## Integration Points

### With Candidates Module
- Queries candidates based on pool criteria
- Adds/removes candidates from pools
- Validates candidate existence

### With Communication Module
- Sends emails for sequence steps
- Tracks email opens, clicks, replies
- Records communication history

### Future Enhancements
- Email enrichment service for finding contact info
- Source tracking for candidate origins
- Advanced engagement analytics
- A/B testing for email sequences
- Automated response classification using AI
- Integration with Chrome extension for sourcing

## Requirements Covered

This implementation addresses the following requirements:

- **Requirement 5.1**: Static and dynamic talent pool creation
- **Requirement 5.2**: Criteria-based auto-updating pools
- **Requirement 5.3**: Multi-step email sequences with delays
- **Requirement 5.4**: Response classification and engagement tracking
- **Requirement 6.3**: Source tracking (foundation)
- **Requirement 6.4**: Saved search functionality
- **Requirement 6.5**: Email enrichment (foundation)
