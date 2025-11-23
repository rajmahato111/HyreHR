# GDPR Compliance - Quick Start Guide

This guide will help you quickly set up and use the GDPR compliance features.

## Setup

### 1. Run Database Migration

```bash
cd apps/backend
npm run migration:run
```

This creates:
- GDPR fields in candidates table
- Data retention policies table

### 2. Verify Module is Loaded

The GDPR module should be imported in `app.module.ts`:

```typescript
import { GDPRModule } from './modules/gdpr/gdpr.module';

@Module({
  imports: [
    // ... other modules
    GDPRModule,
  ],
})
```

## Basic Usage

### Create a Retention Policy

1. Navigate to GDPR page in admin panel
2. Click "Create Policy"
3. Configure:
   - Entity Type: `candidate`
   - Retention Period: `1095` days (3 years)
   - Auto Delete: `false` (manual review first)
   - Notify Before: `30` days
4. Click "Create Policy"

### Export Candidate Data

**Via API:**
```bash
curl -X GET \
  http://localhost:3000/api/gdpr/candidates/{candidateId}/export \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Via UI:**
1. Go to candidate profile
2. Click "GDPR" tab
3. Click "Export All Data"
4. JSON file downloads automatically

### Delete Candidate Data

**Via API:**
```bash
curl -X DELETE \
  http://localhost:3000/api/gdpr/candidates/{candidateId} \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Via UI:**
1. Go to candidate profile
2. Click "GDPR" tab
3. Click "Delete/Anonymize Data"
4. Confirm deletion

### Manage Consent

**Record Consent:**
```bash
curl -X POST \
  http://localhost:3000/api/gdpr/candidates/{candidateId}/consent \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"consentType": "data_processing"}'
```

**Check Consent:**
```bash
curl -X GET \
  http://localhost:3000/api/gdpr/candidates/{candidateId}/consent \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Common Scenarios

### Scenario 1: Candidate Requests Data Export

1. Candidate emails requesting their data
2. Admin logs into platform
3. Navigates to candidate profile
4. Clicks GDPR tab → "Export All Data"
5. Sends downloaded JSON file to candidate

**Response Time:** Within 30 days (GDPR requirement)

### Scenario 2: Candidate Requests Data Deletion

1. Candidate emails requesting deletion
2. Admin verifies identity
3. Navigates to candidate profile
4. Clicks GDPR tab → "Delete/Anonymize Data"
5. Confirms deletion
6. System anonymizes data
7. Confirms deletion to candidate

**Response Time:** Within 30 days (GDPR requirement)

### Scenario 3: Set Up Automatic Cleanup

1. Navigate to GDPR → Retention Policies
2. Create policy:
   - Entity: `candidate`
   - Period: `1095` days
   - Auto Delete: `true` ✅
   - Notify: `30` days before
3. System automatically deletes expired data daily at 2 AM

### Scenario 4: Review Candidates for Deletion

1. Navigate to GDPR Dashboard
2. View "Overdue for Deletion" section
3. Review each candidate
4. Click "Delete Now" or "View" to assess
5. System tracks all deletions in audit log

## Monitoring

### Check Scheduled Job Status

View logs for automatic cleanup:
```bash
tail -f logs/gdpr-cleanup.log
```

Look for:
```
[GDPRService] Starting auto-delete job for expired candidate data
[GDPRService] Found 5 candidates for deletion in organization abc-123
[GDPRService] Auto-delete job completed. Deleted 5 candidates.
```

### View Audit Logs

All GDPR operations are logged:
```bash
curl -X GET \
  http://localhost:3000/api/audit/logs?entityType=candidate&action=delete \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Dashboard Metrics

Navigate to GDPR Dashboard to see:
- Candidates overdue for deletion
- Candidates approaching deletion
- Retention policy compliance

## Troubleshooting

### Issue: Scheduled job not running

**Solution:**
1. Check if ScheduleModule is imported in GDPRModule
2. Verify cron expression is correct
3. Check server timezone settings
4. Review application logs for errors

### Issue: Cannot delete candidate

**Possible causes:**
- Missing permissions (`candidates:delete`)
- Candidate not found
- Database transaction error

**Solution:**
1. Verify user has correct permissions
2. Check candidate exists in organization
3. Review error logs for details

### Issue: Export includes sensitive data

**Solution:**
The `sanitizeForExport` method should remove:
- passwordHash
- mfaSecret
- mfaBackupCodes

If other fields need removal, update the method in `gdpr.service.ts`.

### Issue: Retention policy not working

**Checklist:**
- [ ] Policy is active (`active: true`)
- [ ] Auto-delete is enabled if automatic
- [ ] Retention period is reasonable
- [ ] Organization ID matches
- [ ] Scheduled job is running

## Best Practices

### 1. Start with Manual Review
- Set `autoDelete: false` initially
- Review candidates manually
- Enable auto-delete after confidence

### 2. Set Appropriate Retention Periods
- Legal requirements vary by jurisdiction
- Common periods:
  - Active candidates: 1-2 years
  - Rejected candidates: 6 months - 1 year
  - Hired candidates: 3-7 years

### 3. Notify Before Deletion
- Set `notifyBeforeDays: 30` minimum
- Gives time to review and prevent accidental deletion
- Allows candidates to object if needed

### 4. Regular Audits
- Review GDPR dashboard weekly
- Check audit logs monthly
- Verify retention policies quarterly

### 5. Document Processes
- Keep records of data deletion requests
- Document retention policy decisions
- Maintain audit trail for compliance

## Testing

### Test Data Export
```typescript
// Test in development
const result = await gdprService.exportCandidateData(
  'test-candidate-id',
  'test-org-id'
);

expect(result).toHaveProperty('candidate');
expect(result).toHaveProperty('applications');
expect(result).toHaveProperty('exportedAt');
```

### Test Data Deletion
```typescript
// Test anonymization
await gdprService.deleteCandidateData(
  'test-candidate-id',
  'test-org-id',
  'test-user-id'
);

const candidate = await candidateRepository.findOne({
  where: { id: 'test-candidate-id' }
});

expect(candidate.firstName).toBe('Deleted');
expect(candidate.lastName).toBe('User');
expect(candidate.anonymized).toBe(true);
```

## Next Steps

1. ✅ Set up retention policies for your organization
2. ✅ Test export and deletion with test data
3. ✅ Configure automatic cleanup schedule
4. ✅ Train team on GDPR procedures
5. ✅ Document your GDPR compliance process
6. ✅ Set up monitoring and alerts

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Guide to GDPR](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [GDPR Checklist](https://gdpr.eu/checklist/)

## Support

For technical support:
- Check README.md for detailed documentation
- Review audit logs for operation history
- Contact development team

For legal questions:
- Consult with legal/compliance team
- Review your organization's data protection policy
- Seek advice from data protection officer (DPO)
