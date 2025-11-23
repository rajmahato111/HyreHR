# Analytics Module

The Analytics module provides comprehensive metrics, dashboards, and reporting capabilities for the recruiting platform.

## Features

### 1. Metrics Calculation Engine

Calculates four types of metrics:

#### Funnel Metrics
- Total applications at each stage
- Conversion rates between stages
- Drop-off analysis
- Overall pipeline health

#### Efficiency Metrics
- Average time to fill
- Average time to hire
- Time in each stage
- Interviews per hire
- Application response time

#### Quality Metrics
- Offer acceptance rate
- Candidate quality scores
- Source effectiveness
- Interview feedback averages

#### Diversity Metrics
- Demographic breakdowns
- Stage pass rates by demographics
- Hiring diversity statistics
- Bias detection indicators

### 2. Pre-built Dashboards

Four dashboard types available:

- **Recruiting Funnel**: Visual pipeline with conversion rates
- **Efficiency**: Time-based metrics and bottleneck identification
- **DEI**: Diversity, equity, and inclusion analytics
- **Executive Summary**: High-level overview for leadership

### 3. Custom Report Builder

- Dynamic query generation
- Multiple data sources (applications, candidates, interviews, jobs)
- Flexible filtering and grouping
- Export formats: CSV, Excel, PDF, JSON
- Scheduled report delivery

## API Endpoints

### Get Metrics

```http
GET /analytics/metrics?type=funnel&timeRange=last_30_days
```

Query Parameters:
- `type`: funnel | efficiency | quality | diversity (optional, returns all if omitted)
- `timeRange`: last_7_days | last_30_days | last_90_days | last_6_months | last_year | custom
- `startDate`: ISO date string (required if timeRange=custom)
- `endDate`: ISO date string (optional)
- `jobId`: Filter by specific job (optional)
- `departmentId`: Filter by department (optional)
- `locationIds`: Filter by locations (optional)

Response:
```json
{
  "funnel": {
    "totalApplications": 150,
    "screeningPassed": 75,
    "interviewsScheduled": 45,
    "interviewsCompleted": 40,
    "offersExtended": 10,
    "offersAccepted": 8,
    "conversionRates": {
      "applicationToScreening": 50.0,
      "screeningToInterview": 60.0,
      "interviewToOffer": 25.0,
      "offerToAcceptance": 80.0,
      "overallConversion": 5.3
    },
    "dropOffAnalysis": [...]
  },
  "efficiency": {...},
  "quality": {...},
  "diversity": {...},
  "period": {
    "startDate": "2024-10-16T00:00:00.000Z",
    "endDate": "2024-11-15T23:59:59.999Z"
  },
  "generatedAt": "2024-11-15T10:30:00.000Z"
}
```

### Get Dashboard

```http
GET /analytics/dashboards?type=recruiting_funnel&startDate=2024-10-01&endDate=2024-10-31
```

Query Parameters:
- `type`: recruiting_funnel | efficiency | dei | executive_summary | custom
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `jobId`: Filter by specific job (optional)
- `departmentId`: Filter by department (optional)
- `locationIds`: Filter by locations (optional)

Response:
```json
{
  "id": "recruiting-funnel",
  "type": "recruiting_funnel",
  "title": "Recruiting Funnel Dashboard",
  "description": "Overview of candidate progression through the hiring pipeline",
  "widgets": [
    {
      "id": "funnel-overview",
      "type": "funnel-chart",
      "title": "Recruiting Funnel",
      "data": {...}
    },
    {
      "id": "conversion-rates",
      "type": "metric-cards",
      "title": "Conversion Rates",
      "data": {...}
    }
  ],
  "period": {...},
  "generatedAt": "2024-11-15T10:30:00.000Z",
  "cachedAt": "2024-11-15T10:25:00.000Z"
}
```

### Generate Report

```http
POST /analytics/reports/generate
```

Request Body:
```json
{
  "reportId": "custom-report-1",
  "format": "excel",
  "startDate": "2024-10-01",
  "endDate": "2024-10-31",
  "definition": {
    "dataSource": "applications",
    "columns": [
      {
        "field": "candidate.firstName",
        "label": "First Name",
        "type": "string"
      },
      {
        "field": "candidate.lastName",
        "label": "Last Name",
        "type": "string"
      },
      {
        "field": "job.title",
        "label": "Job Title",
        "type": "string"
      },
      {
        "field": "appliedAt",
        "label": "Applied Date",
        "type": "date"
      },
      {
        "field": "status",
        "label": "Status",
        "type": "string"
      }
    ],
    "filters": [
      {
        "field": "status",
        "operator": "equals",
        "value": "active"
      }
    ],
    "orderBy": [
      {
        "column": "appliedAt",
        "direction": "DESC"
      }
    ]
  }
}
```

Response: File download (CSV, Excel, or PDF) or JSON data

### Invalidate Dashboard Cache

```http
POST /analytics/dashboards/invalidate-cache
```

Clears all cached dashboard data for the organization.

## Caching Strategy

Dashboards are cached for 1 hour to improve performance. Cache is automatically invalidated when:
- Data changes occur (applications, interviews, etc.)
- Manual cache invalidation is triggered
- Cache TTL expires

Cache keys include:
- Organization ID
- Dashboard type
- Date range
- Filters (job, department, location)

## Performance Considerations

1. **Database Indexes**: Ensure proper indexes on:
   - `applications.appliedAt`
   - `applications.jobId`
   - `applications.status`
   - `interviews.scheduledAt`
   - `interviews.applicationId`

2. **Query Optimization**:
   - Use joins instead of N+1 queries
   - Limit date ranges for large datasets
   - Consider materialized views for complex aggregations

3. **Caching**:
   - Dashboard data cached for 1 hour
   - Metrics cached for 15 minutes
   - Report results not cached (generated on-demand)

## Future Enhancements

1. **Real-time Analytics**: WebSocket updates for live dashboards
2. **Predictive Analytics**: ML-based forecasting
3. **Benchmarking**: Industry comparison data
4. **Custom Widgets**: User-defined dashboard widgets
5. **Data Warehouse**: Separate analytics database for historical data
6. **Advanced Visualizations**: More chart types and interactive features

## Dependencies

- TypeORM: Database queries
- Cache Manager: Dashboard caching
- ExcelJS: Excel export
- json2csv: CSV export
- (Future) PDFKit or Puppeteer: PDF export

## Testing

Run tests:
```bash
npm test -- analytics
```

## Permissions

Required permissions:
- `ANALYTICS_VIEW`: View metrics and dashboards
- `ANALYTICS_EXPORT`: Generate and export reports
