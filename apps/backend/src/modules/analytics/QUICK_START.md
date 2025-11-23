# Analytics Module - Quick Start Guide

## Overview

The Analytics module provides comprehensive metrics, dashboards, and reporting for your recruiting platform. This guide will help you get started quickly.

## Prerequisites

- Backend server running
- Valid JWT authentication token
- Some application data in the database

## Quick Start

### 1. Get Funnel Metrics

See how candidates progress through your pipeline:

```bash
curl -X GET "http://localhost:3000/analytics/metrics/funnel?timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What you'll see:**
- Total applications at each stage
- Conversion rates between stages
- Drop-off analysis

### 2. View Recruiting Funnel Dashboard

Get a visual overview of your hiring pipeline:

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=recruiting_funnel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What you'll see:**
- Funnel chart data
- Conversion rate cards
- Drop-off analysis chart

### 3. Check Efficiency Metrics

Measure how fast you're hiring:

```bash
curl -X GET "http://localhost:3000/analytics/metrics/efficiency?timeRange=last_90_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What you'll see:**
- Average time to fill
- Average time to hire
- Time in each stage
- Interviews per hire

### 4. Generate a Custom Report

Export application data to CSV:

```bash
curl -X POST "http://localhost:3000/analytics/reports/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "my-first-report",
    "format": "csv",
    "startDate": "2024-10-01",
    "endDate": "2024-10-31",
    "definition": {
      "dataSource": "applications",
      "columns": [
        {"field": "candidate.firstName", "label": "First Name", "type": "string"},
        {"field": "candidate.lastName", "label": "Last Name", "type": "string"},
        {"field": "job.title", "label": "Job", "type": "string"},
        {"field": "status", "label": "Status", "type": "string"},
        {"field": "appliedAt", "label": "Applied Date", "type": "date"}
      ],
      "orderBy": [
        {"column": "appliedAt", "direction": "DESC"}
      ]
    }
  }' \
  --output applications.csv
```

## Common Use Cases

### Track Hiring Performance

```bash
# Get all metrics for the last quarter
curl -X GET "http://localhost:3000/analytics/metrics?timeRange=last_90_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Monitor Specific Job

```bash
# Get metrics for a specific job
curl -X GET "http://localhost:3000/analytics/metrics?jobId=YOUR_JOB_ID&timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Department Performance

```bash
# Get metrics for a specific department
curl -X GET "http://localhost:3000/analytics/metrics?departmentId=YOUR_DEPT_ID&timeRange=last_6_months" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Executive Dashboard

```bash
# Get high-level summary for leadership
curl -X GET "http://localhost:3000/analytics/dashboards?type=executive_summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Export Interview Data

```bash
curl -X POST "http://localhost:3000/analytics/reports/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "interviews-report",
    "format": "excel",
    "definition": {
      "dataSource": "interviews",
      "columns": [
        {"field": "application.candidate.firstName", "label": "Candidate", "type": "string"},
        {"field": "application.job.title", "label": "Job", "type": "string"},
        {"field": "scheduledAt", "label": "Interview Date", "type": "date"},
        {"field": "status", "label": "Status", "type": "string"}
      ],
      "filters": [
        {"field": "status", "operator": "equals", "value": "completed"}
      ]
    }
  }' \
  --output interviews.xlsx
```

## Dashboard Types

### 1. Recruiting Funnel
Best for: Recruiters and coordinators
Shows: Pipeline progression and conversion rates

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=recruiting_funnel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Efficiency
Best for: TA leaders and hiring managers
Shows: Time-based metrics and bottlenecks

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=efficiency" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. DEI
Best for: DEI officers and HR leadership
Shows: Diversity metrics and bias indicators

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=dei" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Executive Summary
Best for: Executives and senior leadership
Shows: High-level KPIs and source effectiveness

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=executive_summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Report Filters

### Filter by Status

```json
{
  "filters": [
    {"field": "status", "operator": "equals", "value": "active"}
  ]
}
```

### Filter by Date Range

```json
{
  "filters": [
    {
      "field": "appliedAt",
      "operator": "between",
      "value": ["2024-10-01", "2024-10-31"]
    }
  ]
}
```

### Filter by Multiple Values

```json
{
  "filters": [
    {
      "field": "status",
      "operator": "in",
      "value": ["active", "hired"]
    }
  ]
}
```

### Search by Name

```json
{
  "filters": [
    {
      "field": "candidate.firstName",
      "operator": "contains",
      "value": "John"
    }
  ]
}
```

## Export Formats

### CSV
Best for: Excel analysis, data imports
```json
{"format": "csv"}
```

### Excel
Best for: Formatted reports, charts
```json
{"format": "excel"}
```

### PDF
Best for: Sharing, printing
```json
{"format": "pdf"}
```

### JSON
Best for: API integration, custom processing
```json
{"format": "json"}
```

## Performance Tips

1. **Use Specific Time Ranges**: Shorter time ranges = faster queries
2. **Filter by Job or Department**: Reduces data volume
3. **Cache Dashboards**: Dashboards are cached for 1 hour
4. **Invalidate Cache After Data Changes**: Use `/analytics/dashboards/invalidate-cache`

## Troubleshooting

### No Data Returned

**Problem**: Empty metrics or dashboards

**Solutions**:
- Check if you have applications in the specified time range
- Verify your filters aren't too restrictive
- Ensure your organization has data

### Slow Queries

**Problem**: Requests taking too long

**Solutions**:
- Use shorter time ranges
- Add filters to reduce data volume
- Check database indexes
- Consider caching

### Permission Denied

**Problem**: 403 Forbidden error

**Solutions**:
- Verify you have `ANALYTICS_VIEW` permission
- For exports, verify you have `ANALYTICS_EXPORT` permission
- Check your JWT token is valid

## Next Steps

1. **Integrate with Frontend**: Use the API to build analytics dashboards in your UI
2. **Schedule Reports**: Set up automated report delivery (coming soon)
3. **Custom Dashboards**: Create custom dashboard configurations
4. **Real-time Updates**: Implement WebSocket updates for live dashboards (coming soon)

## Support

For more details, see:
- [API Documentation](./API.md)
- [README](./README.md)
- [Module Documentation](../../README.md)

## Example Integration

### React Component

```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

function FunnelMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/analytics/metrics/funnel', {
          params: { timeRange: 'last_30_days' },
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Recruiting Funnel</h2>
      <div>Total Applications: {metrics.totalApplications}</div>
      <div>Hires: {metrics.offersAccepted}</div>
      <div>Conversion Rate: {metrics.conversionRates.overallConversion}%</div>
    </div>
  );
}
```

## Testing

Run the analytics module tests:

```bash
npm test -- analytics
```

## Feedback

Found a bug or have a feature request? Please open an issue in the project repository.
