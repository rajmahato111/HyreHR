# SLA Management UI

This directory contains the UI components for Service Level Agreement (SLA) management.

## Components

### SlaRuleForm
A form for creating and editing SLA rules with:
- Rule name and description
- Rule type selection (time to first review, time to schedule interview, etc.)
- Threshold configuration in hours
- Alert recipient management
- Escalation settings
- Active/inactive status toggle

### SlaRuleList
Displays all SLA rules with:
- Filtering by status (all, active, inactive)
- Quick actions (edit, delete)
- Rule metadata display (type, threshold, recipients)

### SlaComplianceDashboard
Comprehensive dashboard showing:
- Overall compliance metrics (total activities, compliant, violations, compliance rate)
- Compliance breakdown by rule type with progress bars
- Violations list with filtering (all, open, acknowledged)
- Violation management (acknowledge, resolve)
- Date range selection (7d, 30d, 90d)

## Usage

```tsx
import { SlaPage } from './pages/SlaPage';

// In your router
<Route path="/sla" element={<SlaPage />} />
```

## Features

- **Rule Configuration**: Define SLA rules with thresholds and alert recipients
- **Compliance Monitoring**: Real-time tracking of SLA compliance rates
- **Violation Management**: Acknowledge and resolve SLA violations
- **Escalation Support**: Configure escalation paths for critical violations
- **Analytics**: Visual representation of compliance metrics by rule type

## API Integration

All components use the `slaService` from `services/sla.ts` which provides:
- CRUD operations for SLA rules
- Violation retrieval and management
- Compliance metrics calculation

## Requirements Covered

- **15.1**: SLA rule configuration with thresholds and alert recipients
- **15.2**: Alert notification system (backend integration)
- **15.3**: SLA compliance metrics dashboard
- **15.4**: SLA violation logging
- **15.5**: Escalation handling
