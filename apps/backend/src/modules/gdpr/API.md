# GDPR API Documentation

Complete API reference for GDPR compliance endpoints.

## Base URL

```
https://api.platform.com/api/gdpr
```

## Authentication

All endpoints require authentication via JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Data Subject Rights

#### Export Candidate Data

Export all personal data for a candidate (Right to Access).

```http
GET /candidates/:candidateId/export
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Permissions Required:**
- `candidates:export`

**Response:** `200 OK`
```json
{
  "candidate": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "locationCity": "San Francisco",
    "locationState": "CA",
    "locationCountry": "USA",
    "currentCompany": "Tech Corp",
    "currentTitle": "Software Engineer",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "tags": ["javascript", "react"],
    "gdprConsent": true,
    "gdprConsentDate": "2024-01-15T10:00:00Z",
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2024-11-15T00:00:00Z"
  },
  "applications": [
    {
      "id": "uuid",
      "jobId": "uuid",
      "stageId": "uuid",
      "status": "active",
      "appliedAt": "2024-10-01T00:00:00Z",
      "rating": 4
    }
  ],
  "interviews": [
    {
      "id": "uuid",
      "scheduledAt": "2024-10-15T14:00:00Z",
      "status": "completed",
      "locationType": "video"
    }
  ],
  "communications": [
    {
      "id": "uuid",
      "type": "email",
      "subject": "Interview Invitation",
      "sentAt": "2024-10-10T10:00:00Z"
    }
  ],
  "exportedAt": "2025-11-16T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Candidate not found
- `403 Forbidden`: Insufficient permissions

---

#### Delete Candidate Data

Delete/anonymize candidate data (Right to Erasure).

```http
DELETE /candidates/:candidateId
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Permissions Required:**
- `candidates:delete`

**Response:** `200 OK`
```json
{
  "message": "Candidate data has been anonymized"
}
```

**What Gets Anonymized:**
- Name → "Deleted User"
- Email → Anonymized hash
- Phone → Removed
- Location → Removed
- Social profiles → Removed
- Tags → Cleared
- Custom fields → Cleared
- Communications → Deleted

**What Gets Preserved:**
- Application history (anonymized)
- Interview records (anonymized)
- Audit logs

**Error Responses:**
- `404 Not Found`: Candidate not found
- `403 Forbidden`: Insufficient permissions

---

### Consent Management

#### Record Consent

Record data processing consent for a candidate.

```http
POST /candidates/:candidateId/consent
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Request Body:**
```json
{
  "consentType": "data_processing"
}
```

**Consent Types:**
- `data_processing`: General data processing
- `marketing`: Marketing communications
- `third_party_sharing`: Sharing with third parties
- `automated_decision_making`: Automated decision making

**Permissions Required:**
- `candidates:update`

**Response:** `200 OK`
```json
{
  "message": "Consent recorded successfully"
}
```

**Error Responses:**
- `404 Not Found`: Candidate not found
- `400 Bad Request`: Invalid consent type
- `403 Forbidden`: Insufficient permissions

---

#### Withdraw Consent

Withdraw data processing consent.

```http
DELETE /candidates/:candidateId/consent
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Permissions Required:**
- `candidates:update`

**Response:** `200 OK`
```json
{
  "message": "Consent withdrawn successfully"
}
```

**Error Responses:**
- `404 Not Found`: Candidate not found
- `403 Forbidden`: Insufficient permissions

---

#### Check Consent Status

Check if candidate has given consent.

```http
GET /candidates/:candidateId/consent
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Permissions Required:**
- `candidates:read`

**Response:** `200 OK`
```json
{
  "candidateId": "uuid",
  "hasConsent": true
}
```

**Error Responses:**
- `404 Not Found`: Candidate not found
- `403 Forbidden`: Insufficient permissions

---

### Data Retention

#### Get Retention Status

Get data retention status for a candidate.

```http
GET /candidates/:candidateId/retention
```

**Parameters:**
- `candidateId` (path, required): UUID of the candidate

**Permissions Required:**
- `candidates:read`

**Response:** `200 OK`
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

**Fields:**
- `createdAt`: When candidate was created
- `lastActivity`: Most recent activity (application, interview, communication)
- `retentionPeriodDays`: Configured retention period
- `shouldBeDeleted`: Whether candidate is past retention period
- `daysUntilDeletion`: Days remaining (negative if overdue)

**Error Responses:**
- `404 Not Found`: Candidate not found
- `403 Forbidden`: Insufficient permissions

---

### Retention Policy Management

#### List Retention Policies

Get all active retention policies for the organization.

```http
GET /retention-policies
```

**Permissions Required:**
- `admin:manage`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "entityType": "candidate",
    "retentionPeriodDays": 1095,
    "autoDelete": false,
    "notifyBeforeDays": 30,
    "active": true,
    "description": "3-year retention for candidates",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions

---

#### Create Retention Policy

Create a new retention policy.

```http
POST /retention-policies
```

**Request Body:**
```json
{
  "entityType": "candidate",
  "retentionPeriodDays": 1095,
  "autoDelete": false,
  "notifyBeforeDays": 30,
  "description": "3-year retention for candidates"
}
```

**Field Validation:**
- `entityType` (required): "candidate", "application", or "communication"
- `retentionPeriodDays` (required): Integer >= 1
- `autoDelete` (required): Boolean
- `notifyBeforeDays` (required): Integer >= 1
- `description` (optional): String

**Permissions Required:**
- `admin:manage`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "entityType": "candidate",
  "retentionPeriodDays": 1095,
  "autoDelete": false,
  "notifyBeforeDays": 30,
  "active": true,
  "description": "3-year retention for candidates",
  "createdAt": "2025-11-16T10:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `403 Forbidden`: Insufficient permissions

---

#### Update Retention Policy

Update an existing retention policy.

```http
POST /retention-policies/:policyId
```

**Parameters:**
- `policyId` (path, required): UUID of the policy

**Request Body:**
```json
{
  "retentionPeriodDays": 730,
  "autoDelete": true,
  "notifyBeforeDays": 60,
  "active": true,
  "description": "Updated policy"
}
```

**All fields are optional.**

**Permissions Required:**
- `admin:manage`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "entityType": "candidate",
  "retentionPeriodDays": 730,
  "autoDelete": true,
  "notifyBeforeDays": 60,
  "active": true,
  "description": "Updated policy",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-11-16T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Policy not found
- `400 Bad Request`: Validation error
- `403 Forbidden`: Insufficient permissions

---

#### Delete Retention Policy

Delete a retention policy.

```http
DELETE /retention-policies/:policyId
```

**Parameters:**
- `policyId` (path, required): UUID of the policy

**Permissions Required:**
- `admin:manage`

**Response:** `200 OK`
```json
{
  "message": "Retention policy deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Policy not found
- `403 Forbidden`: Insufficient permissions

---

### Compliance Monitoring

#### Get Candidates for Deletion

Get list of candidates that have exceeded retention period.

```http
GET /candidates-for-deletion
```

**Permissions Required:**
- `admin:manage`

**Response:** `200 OK`
```json
[
  {
    "candidate": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "policy": {
      "id": "uuid",
      "retentionPeriodDays": 1095
    },
    "daysOverdue": 45
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions

---

#### Get Candidates Approaching Deletion

Get list of candidates nearing retention limit.

```http
GET /candidates-approaching-deletion
```

**Permissions Required:**
- `admin:manage`

**Response:** `200 OK`
```json
[
  {
    "candidate": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    "daysUntilDeletion": 15
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2025-11-16T10:00:00Z"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- Standard: 100 requests per minute
- Burst: 200 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

## Audit Logging

All GDPR operations are automatically logged with:
- User ID
- Action type
- Entity type and ID
- Timestamp
- Metadata

Access audit logs via:
```http
GET /api/audit/logs?entityType=candidate&action=delete
```

## Examples

### Export Data with cURL

```bash
curl -X GET \
  https://api.platform.com/api/gdpr/candidates/abc-123/export \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -o candidate-data.json
```

### Delete Data with cURL

```bash
curl -X DELETE \
  https://api.platform.com/api/gdpr/candidates/abc-123 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Create Retention Policy with cURL

```bash
curl -X POST \
  https://api.platform.com/api/gdpr/retention-policies \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "entityType": "candidate",
    "retentionPeriodDays": 1095,
    "autoDelete": false,
    "notifyBeforeDays": 30,
    "description": "3-year retention"
  }'
```

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.platform.com/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Export candidate data
const exportData = await api.get(`/gdpr/candidates/${candidateId}/export`);
console.log(exportData.data);

// Delete candidate data
await api.delete(`/gdpr/candidates/${candidateId}`);

// Create retention policy
const policy = await api.post('/gdpr/retention-policies', {
  entityType: 'candidate',
  retentionPeriodDays: 1095,
  autoDelete: false,
  notifyBeforeDays: 30
});
```

## Best Practices

1. **Always verify identity** before exporting or deleting data
2. **Log all operations** for compliance audit trail
3. **Respond within 30 days** to data subject requests
4. **Test in staging** before production deployment
5. **Monitor retention policies** regularly
6. **Document processes** for compliance reviews
7. **Train staff** on GDPR procedures
8. **Review permissions** regularly

## Support

For API support:
- Technical issues: development@platform.com
- Legal questions: legal@platform.com
- Documentation: https://docs.platform.com/gdpr
