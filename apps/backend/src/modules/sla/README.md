# SLA Management Module

This module provides Service Level Agreement (SLA) management and monitoring capabilities for the recruiting platform.

## Features

### SLA Rule Configuration
- Define SLA rules with configurable thresholds
- Support for multiple SLA types:
  - Time to first review
  - Time to schedule interview
  - Time to provide feedback
  - Time to offer
  - Time to hire
- Configure alert recipients for violations
- Set up escalation paths with escalation thresholds
- Apply rules globally or to specific jobs/departments

### SLA Monitoring
- Automated monitoring runs every 10 minutes
- Real-time tracking of SLA compliance
- Automatic violation detection and logging
- Escalation handling for prolonged violations
- Violation status management (open, acknowledged, resolved)

### Compliance Metrics
- Overall compliance statistics
- Metrics by SLA type
- Average delay calculations
- Violation trends and analysis

## API Endpoints

### SLA Rules

#### Create SLA Rule
```
POST /sla/rules
```

Request body:
```json
{
  "name": "Time to First Review - Engineering",
  "description": "Applications should be reviewed within 24 hours",
  "type": "time_to_first_review",
  "thresholdHours": 24,
  "alertRecipients": ["recruiter@company.com", "manager@company.com"],
  "escalationRecipients": ["director@company.com"],
  "escalationHours": 48,
  "active": true,
  "jobIds": ["job-uuid-1", "job-uuid-2"],
  "departmentIds": ["dept-uuid-1"]
}
```

#### Get All SLA Rules
```
GET /sla/rules?type=time_to_first_review&active=true
```

#### Get SLA Rule by ID
```
GET /sla/rules/:id
```

#### Update SLA Rule
```
PUT /sla/rules/:id
```

#### Delete SLA Rule
```
DELETE /sla/rules/:id
```

### SLA Violations

#### Get All Violations
```
GET /sla/violations?status=open&entityType=application
```

Query parameters:
- `slaRuleId`: Filter by SLA rule
- `entityType`: Filter by entity type (application, interview, offer)
- `entityId`: Filter by specific entity
- `status`: Filter by status (open, acknowledged, resolved)
- `escalated`: Filter by escalation status

#### Get Violation by ID
```
GET /sla/violations/:id
```

#### Acknowledge Violation
```
PUT /sla/violations/:id/acknowledge
```

#### Resolve Violation
```
PUT /sla/violations/:id/resolve
```

Request body:
```json
{
  "notes": "Issue resolved by expediting the review process"
}
```

### Metrics

#### Get Compliance Metrics
```
GET /sla/metrics/compliance?startDate=2025-01-01&endDate=2025-01-31
```

Response:
```json
{
  "summary": {
    "totalViolations": 45,
    "openViolations": 12,
    "resolvedViolations": 30,
    "escalatedViolations": 3
  },
  "byType": [
    {
      "type": "time_to_first_review",
      "totalViolations": 20,
      "openViolations": 5,
      "escalatedViolations": 1,
      "averageDelayHours": 36.5
    }
  ]
}
```

## SLA Types

### TIME_TO_FIRST_REVIEW
Tracks time from application submission to first stage change. Ensures applications are reviewed promptly.

### TIME_TO_SCHEDULE_INTERVIEW
Tracks time from entering an interview stage to having an interview scheduled. Ensures timely interview scheduling.

### TIME_TO_PROVIDE_FEEDBACK
Tracks time from completed interview to feedback submission. Ensures interviewers provide timely feedback.

### TIME_TO_OFFER
Tracks time from application to offer creation. Monitors overall offer decision timeline.

### TIME_TO_HIRE
Tracks time from application to hire. Monitors complete hiring cycle duration.

## Automated Monitoring

The SLA monitoring service runs automated checks:

1. **Compliance Check** (every 10 minutes)
   - Checks all active SLA rules
   - Identifies violations
   - Creates violation records
   - Sends alert notifications

2. **Escalation Check** (every hour)
   - Reviews open violations
   - Checks if escalation threshold exceeded
   - Escalates violations
   - Sends escalation notifications

## Notification Integration

The module is designed to integrate with the notification service for:
- Alert emails to configured recipients
- Escalation notifications
- Slack/Teams integration (future)
- In-app notifications (future)

## Database Schema

### sla_rules
- `id`: UUID primary key
- `organization_id`: Organization reference
- `name`: Rule name
- `description`: Rule description
- `type`: SLA type enum
- `threshold_hours`: Threshold in hours
- `alert_recipients`: Array of email addresses
- `escalation_recipients`: Array of email addresses
- `escalation_hours`: Hours before escalation
- `active`: Rule active status
- `job_ids`: Optional job filter
- `department_ids`: Optional department filter

### sla_violations
- `id`: UUID primary key
- `sla_rule_id`: SLA rule reference
- `entity_type`: Type of entity (application, interview, offer)
- `entity_id`: Entity UUID
- `violated_at`: Violation timestamp
- `expected_at`: Expected completion timestamp
- `actual_hours`: Actual hours elapsed
- `status`: Violation status (open, acknowledged, resolved)
- `acknowledged_at`: Acknowledgment timestamp
- `acknowledged_by`: User who acknowledged
- `resolved_at`: Resolution timestamp
- `resolved_by`: User who resolved
- `escalated`: Escalation flag
- `escalated_at`: Escalation timestamp
- `notes`: Resolution notes

## Usage Examples

### Creating a Time to First Review SLA
```typescript
const rule = await slaService.createRule(organizationId, {
  name: 'Quick Application Review',
  type: SlaRuleType.TIME_TO_FIRST_REVIEW,
  thresholdHours: 24,
  alertRecipients: ['recruiting-team@company.com'],
  escalationRecipients: ['recruiting-director@company.com'],
  escalationHours: 48,
  active: true,
});
```

### Getting Compliance Metrics
```typescript
const metrics = await slaService.getComplianceMetrics(
  organizationId,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

### Resolving a Violation
```typescript
await slaMonitoringService.resolveViolation(
  violationId,
  userId,
  'Expedited review process implemented'
);
```

## Best Practices

1. **Set Realistic Thresholds**: Base thresholds on historical data and team capacity
2. **Configure Escalations**: Set escalation thresholds to catch prolonged issues
3. **Monitor Regularly**: Review compliance metrics weekly
4. **Adjust Rules**: Update rules based on performance and business needs
5. **Use Filters**: Apply rules to specific jobs/departments for targeted monitoring
6. **Document Resolutions**: Add notes when resolving violations for future reference

## Future Enhancements

- Predictive SLA violation alerts
- Custom SLA types
- Business hours calculation
- Holiday calendar integration
- Advanced reporting and analytics
- Automated remediation workflows
