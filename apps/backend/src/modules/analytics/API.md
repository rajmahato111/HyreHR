# Analytics API Documentation

## Overview

The Analytics API provides comprehensive metrics, dashboards, and reporting capabilities for the recruiting platform.

## Base URL

```
/analytics
```

## Authentication

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Permissions

- `ANALYTICS_VIEW`: Required to view metrics and dashboards
- `ANALYTICS_EXPORT`: Required to generate and export reports

---

## Endpoints

### 1. Get Metrics

Retrieve calculated metrics for funnel, efficiency, quality, and diversity.

**Endpoint:** `GET /analytics/metrics`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | enum | No | Metric type: `funnel`, `efficiency`, `quality`, `diversity`. Omit to get all. |
| timeRange | enum | No | Time range: `last_7_days`, `last_30_days`, `last_90_days`, `last_6_months`, `last_year`, `custom`. Default: `last_30_days` |
| startDate | string | No | ISO date string. Required if timeRange=custom |
| endDate | string | No | ISO date string |
| jobId | string | No | Filter by specific job UUID |
| departmentId | string | No | Filter by department UUID |
| locationIds | array | No | Filter by location UUIDs |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/analytics/metrics?type=funnel&timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

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
    "dropOffAnalysis": [
      {
        "stage": "Application to Screening",
        "count": 75,
        "percentage": 50.0
      }
    ]
  },
  "period": {
    "startDate": "2024-10-16T00:00:00.000Z",
    "endDate": "2024-11-15T23:59:59.999Z"
  },
  "generatedAt": "2024-11-15T10:30:00.000Z"
}
```

---

### 2. Get Funnel Metrics

Retrieve only funnel metrics.

**Endpoint:** `GET /analytics/metrics/funnel`

**Query Parameters:** Same as Get Metrics

**Example Request:**

```bash
curl -X GET "http://localhost:3000/analytics/metrics/funnel?timeRange=last_90_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Efficiency Metrics

Retrieve only efficiency metrics.

**Endpoint:** `GET /analytics/metrics/efficiency`

**Query Parameters:** Same as Get Metrics

**Example Response:**

```json
{
  "averageTimeToFill": 32.5,
  "averageTimeToHire": 32.5,
  "averageTimeInStage": [
    {
      "stage": "Applied",
      "averageDays": 2.3
    },
    {
      "stage": "Phone Screen",
      "averageDays": 5.7
    }
  ],
  "interviewsPerHire": 3.2,
  "applicationResponseTime": 1.8
}
```

---

### 4. Get Quality Metrics

Retrieve only quality metrics.

**Endpoint:** `GET /analytics/metrics/quality`

**Query Parameters:** Same as Get Metrics

**Example Response:**

```json
{
  "offerAcceptanceRate": 80.0,
  "candidateQualityScore": 72.5,
  "sourceEffectiveness": [
    {
      "source": "LinkedIn",
      "applications": 50,
      "hires": 5,
      "conversionRate": 10.0
    },
    {
      "source": "Referral",
      "applications": 30,
      "hires": 8,
      "conversionRate": 26.7
    }
  ],
  "interviewFeedbackAverage": 68.0
}
```

---

### 5. Get Diversity Metrics

Retrieve only diversity metrics.

**Endpoint:** `GET /analytics/metrics/diversity`

**Query Parameters:** Same as Get Metrics

**Example Response:**

```json
{
  "demographicBreakdown": [
    {
      "category": "Gender",
      "value": "Not Collected",
      "count": 150,
      "percentage": 100
    }
  ],
  "stagePassRates": [
    {
      "stage": "All Stages",
      "demographics": [
        {
          "category": "Overall",
          "value": "All Candidates",
          "passRate": 5.3
        }
      ]
    }
  ],
  "hiringDiversity": [
    {
      "category": "Total",
      "value": "All Hires",
      "hireCount": 8,
      "percentage": 100
    }
  ]
}
```

---

### 6. Get Dashboard

Retrieve a pre-built dashboard with widgets.

**Endpoint:** `GET /analytics/dashboards`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | enum | Yes | Dashboard type: `recruiting_funnel`, `efficiency`, `dei`, `executive_summary` |
| startDate | string | No | ISO date string |
| endDate | string | No | ISO date string |
| jobId | string | No | Filter by specific job UUID |
| departmentId | string | No | Filter by department UUID |
| locationIds | array | No | Filter by location UUIDs |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/analytics/dashboards?type=recruiting_funnel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

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
      "data": {
        "stages": [
          { "name": "Applications", "value": 150 },
          { "name": "Screening Passed", "value": 75 },
          { "name": "Interviews Scheduled", "value": 45 },
          { "name": "Interviews Completed", "value": 40 },
          { "name": "Offers Extended", "value": 10 },
          { "name": "Offers Accepted", "value": 8 }
        ]
      }
    },
    {
      "id": "conversion-rates",
      "type": "metric-cards",
      "title": "Conversion Rates",
      "data": {
        "metrics": [
          {
            "label": "Application to Screening",
            "value": 50.0,
            "format": "percentage"
          }
        ]
      }
    }
  ],
  "period": {
    "startDate": "2024-10-16T00:00:00.000Z",
    "endDate": "2024-11-15T23:59:59.999Z"
  },
  "generatedAt": "2024-11-15T10:30:00.000Z",
  "cachedAt": "2024-11-15T10:25:00.000Z"
}
```

---

### 7. Invalidate Dashboard Cache

Clear cached dashboard data for the organization.

**Endpoint:** `POST /analytics/dashboards/invalidate-cache`

**Example Request:**

```bash
curl -X POST "http://localhost:3000/analytics/dashboards/invalidate-cache" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "message": "Dashboard cache invalidated successfully"
}
```

---

### 8. Generate Report

Generate a custom report with specified columns, filters, and export format.

**Endpoint:** `POST /analytics/reports/generate`

**Request Body:**

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

**Report Definition Fields:**

- **dataSource**: `applications`, `candidates`, `interviews`, `jobs`
- **columns**: Array of column definitions
  - **field**: Dot-notation path to field (e.g., `candidate.firstName`)
  - **label**: Display label for column
  - **type**: `string`, `number`, `date`, `boolean`
  - **format**: Optional format (e.g., `currency`, `percentage`)
- **filters**: Array of filter conditions
  - **field**: Field to filter on
  - **operator**: `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `between`, `in`
  - **value**: Filter value
- **orderBy**: Array of sort orders
  - **column**: Column to sort by
  - **direction**: `ASC` or `DESC`

**Export Formats:**

- `csv`: CSV file download
- `excel`: Excel (.xlsx) file download
- `pdf`: PDF file download
- `json`: JSON response

**Example Request:**

```bash
curl -X POST "http://localhost:3000/analytics/reports/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "applications-report",
    "format": "csv",
    "startDate": "2024-10-01",
    "endDate": "2024-10-31",
    "definition": {
      "dataSource": "applications",
      "columns": [
        {"field": "candidate.firstName", "label": "First Name", "type": "string"},
        {"field": "candidate.lastName", "label": "Last Name", "type": "string"},
        {"field": "job.title", "label": "Job", "type": "string"},
        {"field": "status", "label": "Status", "type": "string"}
      ],
      "filters": [
        {"field": "status", "operator": "equals", "value": "active"}
      ],
      "orderBy": [
        {"column": "appliedAt", "direction": "DESC"}
      ]
    }
  }'
```

**Response:**

- For CSV, Excel, PDF: File download with appropriate Content-Type and Content-Disposition headers
- For JSON: Report data object

---

## Dashboard Types

### 1. Recruiting Funnel (`recruiting_funnel`)

Visualizes candidate progression through the hiring pipeline with:
- Funnel chart showing stage-by-stage counts
- Conversion rate metrics
- Drop-off analysis

### 2. Efficiency (`efficiency`)

Tracks hiring speed and process efficiency with:
- Time to fill and time to hire metrics
- Average time in each stage
- Interviews per hire
- Application response time

### 3. DEI (`dei`)

Diversity, equity, and inclusion analytics with:
- Demographic breakdown charts
- Stage pass rates by demographics
- Hiring diversity statistics

### 4. Executive Summary (`executive_summary`)

High-level overview for leadership with:
- Key performance indicators
- Source effectiveness table
- Overall conversion metrics

---

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["Invalid query parameter"],
  "error": "Bad Request"
}
```

---

## Caching

Dashboards are cached for 1 hour to improve performance. The cache includes:
- Organization ID
- Dashboard type
- Date range
- Filters

Cache can be manually invalidated using the `/analytics/dashboards/invalidate-cache` endpoint.

---

## Rate Limiting

All endpoints are subject to the global rate limit of 100 requests per minute per user.

---

## Notes

1. **Date Ranges**: All dates should be in ISO 8601 format (e.g., `2024-10-01T00:00:00.000Z`)
2. **Diversity Metrics**: Currently returns placeholder data. Production implementation requires proper demographic data collection with EEOC compliance.
3. **PDF Export**: Currently returns plain text. Production implementation would use a proper PDF generation library.
4. **Scheduled Reports**: API endpoint exists but scheduler integration is pending.

---

## Testing

### Quick Test

```bash
# Get funnel metrics for last 30 days
curl -X GET "http://localhost:3000/analytics/metrics/funnel?timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get recruiting funnel dashboard
curl -X GET "http://localhost:3000/analytics/dashboards?type=recruiting_funnel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Generate CSV report
curl -X POST "http://localhost:3000/analytics/reports/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "test-report",
    "format": "csv",
    "definition": {
      "dataSource": "applications",
      "columns": [
        {"field": "id", "label": "ID", "type": "string"},
        {"field": "status", "label": "Status", "type": "string"}
      ]
    }
  }' \
  --output report.csv
```
