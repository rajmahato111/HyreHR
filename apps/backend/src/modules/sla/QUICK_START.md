# SLA Management - Quick Start Guide

This guide will help you get started with the SLA Management module.

## Prerequisites

- Backend server running
- Database migrations applied
- Authentication configured

## Step 1: Run Database Migration

The SLA tables will be created automatically when you run migrations:

```bash
npm run migration:run
```

This creates:
- `sla_rules` table
- `sla_violations` table

## Step 2: Create Your First SLA Rule

### Example: Time to First Review

Create a rule to ensure applications are reviewed within 24 hours:

```bash
curl -X POST http://localhost:3000/sla/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "24-Hour Application Review",
    "description": "All applications must be reviewed within 24 hours",
    "type": "time_to_first_review",
    "thresholdHours": 24,
    "alertRecipients": ["recruiter@company.com"],
    "escalationRecipients": ["manager@company.com"],
    "escalationHours": 48,
    "active": true
  }'
```

### Example: Time to Schedule Interview

Create a rule for interview scheduling:

```bash
curl -X POST http://localhost:3000/sla/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "48-Hour Interview Scheduling",
    "description": "Interviews must be scheduled within 48 hours",
    "type": "time_to_schedule_interview",
    "thresholdHours": 48,
    "alertRecipients": ["coordinator@company.com"],
    "active": true
  }'
```

### Example: Department-Specific Rule

Create a rule that only applies to specific departments:

```bash
curl -X POST http://localhost:3000/sla/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Fast Track",
    "description": "Engineering applications reviewed within 12 hours",
    "type": "time_to_first_review",
    "thresholdHours": 12,
    "alertRecipients": ["eng-recruiting@company.com"],
    "departmentIds": ["engineering-dept-uuid"],
    "active": true
  }'
```

## Step 3: View SLA Rules

List all active SLA rules:

```bash
curl -X GET "http://localhost:3000/sla/rules?active=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Filter by type:

```bash
curl -X GET "http://localhost:3000/sla/rules?type=time_to_first_review" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 4: Monitor Violations

The monitoring service runs automatically every 10 minutes. To view violations:

```bash
curl -X GET "http://localhost:3000/sla/violations?status=open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

View violations for a specific entity:

```bash
curl -X GET "http://localhost:3000/sla/violations?entityType=application&entityId=app-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 5: Manage Violations

### Acknowledge a Violation

```bash
curl -X PUT http://localhost:3000/sla/violations/violation-uuid/acknowledge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Resolve a Violation

```bash
curl -X PUT http://localhost:3000/sla/violations/violation-uuid/resolve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Application reviewed and moved to phone screen stage"
  }'
```

## Step 6: View Compliance Metrics

Get overall compliance metrics:

```bash
curl -X GET "http://localhost:3000/sla/metrics/compliance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Get metrics for a specific date range:

```bash
curl -X GET "http://localhost:3000/sla/metrics/compliance?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Use Cases

### 1. Fast-Track Important Roles

Create stricter SLAs for critical positions:

```javascript
{
  "name": "Executive Role - Fast Track",
  "type": "time_to_first_review",
  "thresholdHours": 4,
  "jobIds": ["ceo-job-uuid", "cto-job-uuid"],
  "alertRecipients": ["ceo@company.com"],
  "active": true
}
```

### 2. Interview Feedback Compliance

Ensure interviewers provide timely feedback:

```javascript
{
  "name": "Same-Day Interview Feedback",
  "type": "time_to_provide_feedback",
  "thresholdHours": 8,
  "alertRecipients": ["recruiting@company.com"],
  "escalationRecipients": ["vp-talent@company.com"],
  "escalationHours": 24,
  "active": true
}
```

### 3. Offer Decision Timeline

Monitor time from final interview to offer:

```javascript
{
  "name": "3-Day Offer Decision",
  "type": "time_to_offer",
  "thresholdHours": 72,
  "alertRecipients": ["hiring-managers@company.com"],
  "active": true
}
```

## Monitoring Schedule

The SLA monitoring service runs on the following schedule:

- **Compliance Check**: Every 10 minutes
  - Checks all active SLA rules
  - Creates violation records
  - Sends alert notifications

- **Escalation Check**: Every hour
  - Reviews open violations
  - Escalates violations past escalation threshold
  - Sends escalation notifications

## Best Practices

1. **Start Conservative**: Begin with longer thresholds and adjust based on data
2. **Use Escalations**: Set escalation thresholds to catch prolonged issues
3. **Department-Specific Rules**: Create targeted rules for different teams
4. **Regular Review**: Check compliance metrics weekly
5. **Document Resolutions**: Always add notes when resolving violations

## Troubleshooting

### Violations Not Being Created

1. Check that the SLA rule is active: `active: true`
2. Verify the monitoring service is running (check logs)
3. Ensure entities match the rule criteria (job/department filters)

### Too Many Violations

1. Review threshold settings - they may be too aggressive
2. Check if rules are properly filtered by job/department
3. Consider adjusting thresholds based on team capacity

### Notifications Not Sending

1. Verify alert recipients are configured correctly
2. Check notification service integration (future enhancement)
3. Review application logs for errors

## Next Steps

- Integrate with notification service for email alerts
- Set up Slack/Teams webhooks for real-time alerts
- Create custom dashboards for SLA monitoring
- Configure automated remediation workflows

## API Reference

For complete API documentation, see [README.md](./README.md)
