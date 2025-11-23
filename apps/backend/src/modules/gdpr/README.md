# GDPR Compliance Module

This module implements GDPR (General Data Protection Regulation) compliance features for the recruiting platform, ensuring data subject rights are respected and data retention policies are enforced.

## Features

### 1. Data Export (Right to Access)
- Export all candidate data in JSON format
- Includes candidate profile, applications, interviews, and communications
- Sanitizes sensitive internal fields
- Audit logging of all exports

### 2. Data Deletion (Right to Erasure)
- Anonymizes candidate personal data
- Preserves application history for compliance
- Deletes associated communications
- Maintains referential integrity
- Audit logging of all deletions

### 3. Consent Management
- Record and track data processing consent
- Support for different consent types
- Consent withdrawal functionality
- Consent status checking
- Audit logging of consent changes

### 4. Data Retention Policies
- Configurable retention periods per entity type
- Automatic deletion scheduling
- Notification before deletion
- Organization-specific policies
- Support for candidates, applications, and communications

### 5. Automated Cleanup
- Daily scheduled job (2 AM) for expired data
- Automatic deletion based on retention policies
- Notification system for approaching deletions
- Comprehensive audit trail

## API Endpoints

### Data Subject Rights

#### Export Candidate Data
```http
GET /api/gdpr/candidates/:candidateId/export
Authorization: Bearer <token>
Permissions: candidates:export
```

Response:
```json
{
  "candidate": { ... },
  "applications": [ ... ],
  "interviews": [ ... ],
  "communications": [ ... ],
  "exportedAt": "2025-11-16T10:00:00Z"
}
```

#### Delete Candidate Data
```http
DELETE /api/gdpr/candidates/:candidateId
Authorization: Bearer <token>
Permissions: candidates:delete
```

Response:
```json
{
  "message": "Candidate data has been anonymized"
}
```

### Consent Management

#### Record Consent
```http
POST /api/gdpr/candidates/:candidateId/consent
Authorization: Bearer <token>
Permissions: candidates:update

{
  "consentType": "data_processing"
}
```

#### Withdraw Consent
```http
DELETE /api/gdpr/candidates/:candidateId/consent
Authorization: Bearer <token>
Permissions: candidates:update
```

#### Check Consent Status
```http
GET /api/gdpr/candidates/:candidateId/consent
Authorization: Bearer <token>
Permissions: candidates:read
```

Response:
```json
{
  "candidateId": "uuid",
  "hasConsent": true
}
```

### Data Retention

#### Get Retention Status
```http
GET /api/gdpr/candidates/:candidateId/retention
Authorization: Bearer <token>
Permissions: candidates:read
```

Response:
```json
{
  "candidateId": "uuid",
  "createdAt": "2022-01-01T00:00:00Z",
  "lastActivity": "2023-06-15T00:00:00Z",
  "retentionPeriodDays": 1095,
  "shouldBeDeleted": false,
  "daysUntilDeletion": 365
}
```

### Retention Policy Management

#### List Retention Policies
```http
GET /api/gdpr/retention-policies
Authorization: Bearer <token>
Permissions: admin:manage
```

#### Create Retention Policy
```http
POST /api/gdpr/retention-policies
Authorization: Bearer <token>
Permissions: admin:manage

{
  "entityType": "candidate",
  "retentionPeriodDays": 1095,
  "autoDelete": false,
  "notifyBeforeDays": 30,
  "description": "3-year retention for candidates"
}
```

#### Update Retention Policy
```http
POST /api/gdpr/retention-policies/:policyId
Authorization: Bearer <token>
Permissions: admin:manage

{
  "retentionPeriodDays": 730,
  "autoDelete": true
}
```

#### Delete Retention Policy
```http
DELETE /api/gdpr/retention-policies/:policyId
Authorization: Bearer <token>
Permissions: admin:manage
```

#### Get Candidates for Deletion
```http
GET /api/gdpr/candidates-for-deletion
Authorization: Bearer <token>
Permissions: admin:manage
```

Returns candidates that have exceeded retention period.

#### Get Candidates Approaching Deletion
```http
GET /api/gdpr/candidates-approaching-deletion
Authorization: Bearer <token>
Permissions: admin:manage
```

Returns candidates nearing retention limit (within notification window).

## Database Schema

### Candidate Entity Updates
```sql
ALTER TABLE candidates ADD COLUMN gdpr_consent_type VARCHAR(100);
ALTER TABLE candidates ADD COLUMN anonymized BOOLEAN DEFAULT false;
ALTER TABLE candidates ADD COLUMN gdpr_deleted_at TIMESTAMP;
```

### Data Retention Policies Table
```sql
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  entity_type VARCHAR(50),
  retention_period_days INTEGER,
  auto_delete BOOLEAN DEFAULT false,
  notify_before_days INTEGER DEFAULT 30,
  active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Export Candidate Data
```typescript
const exportData = await gdprService.exportCandidateData(
  candidateId,
  organizationId
);

// Download as JSON file
const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: 'application/json',
});
```

### Delete Candidate Data
```typescript
await gdprService.deleteCandidateData(
  candidateId,
  organizationId,
  userId
);
// Candidate data is now anonymized
```

### Create Retention Policy
```typescript
const policy = await gdprService.createRetentionPolicy(organizationId, {
  entityType: 'candidate',
  retentionPeriodDays: 1095, // 3 years
  autoDelete: true,
  notifyBeforeDays: 30,
  description: 'Standard candidate retention policy'
});
```

### Check Retention Status
```typescript
const status = await gdprService.getRetentionStatus(
  candidateId,
  organizationId
);

if (status.shouldBeDeleted) {
  console.log(`Candidate is ${status.daysUntilDeletion} days overdue`);
}
```

## Automated Jobs

### Daily Cleanup Job
Runs every day at 2 AM:
- Finds candidates exceeding retention period
- Automatically deletes if auto-delete is enabled
- Logs all deletions for audit purposes

```typescript
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async autoDeleteExpiredData(): Promise<void> {
  // Automatic cleanup logic
}
```

## Compliance Notes

### Data Anonymization
When a candidate is deleted:
- Name changed to "Deleted User"
- Email anonymized with hash
- Phone, location, and social profiles removed
- Tags and custom fields cleared
- Communications deleted
- Application history preserved (anonymized)

### Audit Trail
All GDPR operations are logged:
- Data exports
- Data deletions
- Consent changes
- Retention policy changes

### Retention Periods
Default retention periods:
- Candidates: 3 years (1095 days)
- Applications: Tied to candidate retention
- Communications: Tied to candidate retention

Organizations can customize these periods.

## Frontend Components

### GDPRDataManagement
Component for managing individual candidate GDPR rights:
- Export data
- Delete/anonymize data
- Manage consent
- View retention status

### RetentionPolicyManager
Admin interface for managing retention policies:
- Create/edit/delete policies
- Configure auto-deletion
- Set notification periods

### GDPRDashboard
Overview of GDPR compliance status:
- Candidates overdue for deletion
- Candidates approaching deletion
- Summary statistics

## Security Considerations

1. **Permissions**: All endpoints require appropriate permissions
2. **Audit Logging**: All operations are logged with user attribution
3. **Data Sanitization**: Sensitive fields removed from exports
4. **Anonymization**: Data is anonymized, not deleted, to maintain integrity
5. **Encryption**: Sensitive data encrypted at rest

## Testing

Run GDPR-related tests:
```bash
npm test -- gdpr
```

## Migration

Run the GDPR migration:
```bash
npm run migration:run
```

This adds:
- GDPR fields to candidates table
- Data retention policies table

## Monitoring

Monitor GDPR operations:
- Check audit logs for GDPR actions
- Review scheduled job execution logs
- Monitor retention policy compliance
- Track consent rates

## Support

For questions or issues related to GDPR compliance:
1. Check audit logs for operation history
2. Review retention policy configuration
3. Verify permissions are correctly assigned
4. Contact the compliance team for legal questions
