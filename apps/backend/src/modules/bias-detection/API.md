# Bias Detection API

## Overview

The Bias Detection API provides endpoints for analyzing hiring patterns, detecting biased language in feedback, and generating comprehensive bias reports.

## Base URL

```
/bias-detection
```

## Endpoints

### 1. Analyze Feedback

Analyze specific interview feedback for biased language.

**Endpoint:** `GET /bias-detection/feedback/:id`

**Parameters:**
- `id` (path): Feedback ID

**Response:**
```json
{
  "feedbackId": "uuid",
  "biasScore": 45,
  "biasedTerms": [
    {
      "term": "young",
      "category": "age",
      "context": "...candidate is young and energetic...",
      "suggestion": "Focus on skills and experience rather than age-related terms"
    }
  ],
  "recommendations": [
    "Use structured interview scorecards with specific, job-related criteria"
  ],
  "hasBias": true
}
```

### 2. Check Feedback Before Submission

Real-time bias checking for feedback text.

**Endpoint:** `POST /bias-detection/check-feedback`

**Request Body:**
```json
{
  "strengths": "Candidate is very articulate",
  "concerns": "May not be a culture fit",
  "notes": "Young and energetic"
}
```

**Response:**
```json
{
  "hasBias": true,
  "biasScore": 35,
  "biasedTerms": [...],
  "recommendations": [...],
  "shouldWarn": true,
  "shouldBlock": false
}
```

### 3. Generate Bias Report

Generate comprehensive bias report for a job or department.

**Endpoint:** `GET /bias-detection/report`

**Query Parameters:**
- `jobId` (optional): Job ID
- `departmentId` (optional): Department ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "summary": {
    "totalAlerts": 5,
    "criticalAlerts": 1,
    "highAlerts": 2,
    "totalFeedbackAnalyzed": 50,
    "feedbackWithBias": 12,
    "totalBiasedTerms": 28
  },
  "alerts": [
    {
      "type": "statistical_disparity",
      "severity": "high",
      "message": "Statistical disparity detected...",
      "jobId": "uuid",
      "data": {...},
      "recommendation": "Review hiring criteria..."
    }
  ],
  "passRates": {
    "hasDisparity": true,
    "groups": [...],
    "overallPassRate": 55,
    "maxDifference": 20,
    "affectedGroups": ["Gender: Female"]
  },
  "representation": {...},
  "timeToHire": {...},
  "recommendations": [...]
}
```

### 4. Get Job Alerts

Get all bias alerts for a specific job.

**Endpoint:** `GET /bias-detection/alerts/job/:jobId`

**Parameters:**
- `jobId` (path): Job ID

**Response:**
```json
[
  {
    "type": "statistical_disparity",
    "severity": "high",
    "message": "Statistical disparity detected...",
    "jobId": "uuid",
    "data": {...},
    "recommendation": "Review hiring criteria..."
  }
]
```

### 5. Get Feedback Alerts

Get bias alerts for specific feedback.

**Endpoint:** `GET /bias-detection/alerts/feedback/:feedbackId`

**Parameters:**
- `feedbackId` (path): Feedback ID

**Response:**
```json
[
  {
    "type": "biased_language",
    "severity": "medium",
    "message": "Detected 3 potentially biased term(s)",
    "feedbackId": "uuid",
    "data": {...},
    "recommendation": "Focus on objective criteria..."
  }
]
```

### 6. Get Bias Metrics

Get bias metrics for dashboard display.

**Endpoint:** `GET /bias-detection/metrics`

**Query Parameters:**
- `organizationId` (required): Organization ID
- `jobId` (optional): Job ID

**Response:**
```json
{
  "totalApplications": 200,
  "demographics": {
    "gender: Female": 48,
    "gender: Male": 52,
    "ethnicity: Asian": 25,
    "ethnicity: Black or African American": 15,
    "ethnicity: Hispanic or Latino": 20,
    "ethnicity: White": 35
  },
  "recentAlerts": [...],
  "alertCounts": {
    "critical": 1,
    "high": 3,
    "medium": 5,
    "low": 2
  }
}
```

### 7. Get Recommendations

Get general recommendations for reducing bias.

**Endpoint:** `GET /bias-detection/recommendations`

**Response:**
```json
{
  "recommendations": [
    "Implement structured interviews with standardized questions",
    "Use blind resume reviews to reduce unconscious bias",
    "Provide regular bias training for all interviewers",
    "Use diverse interview panels",
    "Track and review diversity metrics regularly"
  ]
}
```

## Alert Types

- `biased_language`: Biased language detected in feedback
- `statistical_disparity`: Statistical disparity in pass-through rates
- `rating_inconsistency`: Inconsistent ratings across interviewers
- `demographic_pattern`: Unusual demographic patterns

## Alert Severity Levels

- `critical`: Requires immediate attention (bias score > 75)
- `high`: Significant bias detected (bias score 50-75)
- `medium`: Moderate bias detected (bias score 25-50)
- `low`: Minor bias detected (bias score < 25)

## Bias Categories

- `age`: Age-related bias
- `gender`: Gender bias
- `gender_stereotype`: Gender stereotype bias
- `cultural`: Cultural/ethnic bias
- `appearance`: Appearance-based bias
- `family_status`: Family status bias
- `disability`: Disability-related bias
- `subjective`: Subjective personality assessments
- `educational`: Educational prestige bias

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Either jobId or departmentId must be provided",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Feedback not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
