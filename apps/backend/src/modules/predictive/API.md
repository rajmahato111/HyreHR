# Predictive Analytics API

## Overview

The Predictive Analytics API provides AI-powered predictions for recruiting metrics, including time-to-fill estimates and offer acceptance probability.

## Base URL

```
/predictive
```

## Endpoints

### Get Time to Fill Prediction

Predicts how long it will take to fill a job opening.

**Endpoint:** `GET /predictive/time-to-fill/:jobId`

**Parameters:**
- `jobId` (path, required): UUID of the job

**Response:** `200 OK`

```json
{
  "predictedDays": 42,
  "confidenceInterval": {
    "lower": 35,
    "upper": 49
  },
  "factors": [
    {
      "name": "Historical Average",
      "impact": 0.15,
      "value": "45 days"
    },
    {
      "name": "Department Average",
      "impact": 0.10,
      "value": "40 days"
    },
    {
      "name": "Expected Applicant Volume",
      "impact": -0.08,
      "value": "25 applicants"
    },
    {
      "name": "Compensation Competitiveness",
      "impact": -0.05,
      "value": "High"
    },
    {
      "name": "Location Competitiveness",
      "impact": -0.03,
      "value": "Medium"
    },
    {
      "name": "Hiring Manager Responsiveness",
      "impact": -0.04,
      "value": "Good"
    },
    {
      "name": "Interviewer Availability",
      "impact": -0.02,
      "value": "Good"
    },
    {
      "name": "Seasonality",
      "impact": 0.02,
      "value": "Normal season"
    },
    {
      "name": "Seniority Level",
      "impact": 0.06,
      "value": "Senior"
    }
  ]
}
```

**Error Responses:**

- `404 Not Found`: Job not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions

**Example:**

```bash
curl -X GET \
  https://api.example.com/predictive/time-to-fill/550e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Get Offer Acceptance Prediction

Predicts the probability that a candidate will accept an offer.

**Endpoint:** `GET /predictive/offer-acceptance/:offerId`

**Parameters:**
- `offerId` (path, required): UUID of the offer

**Response:** `200 OK`

```json
{
  "acceptanceProbability": 75,
  "factors": [
    {
      "name": "Compensation vs Market",
      "impact": 12.5,
      "value": "Above market"
    },
    {
      "name": "Candidate Engagement",
      "impact": 8.0,
      "value": "Highly engaged"
    },
    {
      "name": "Interview Feedback",
      "impact": 6.5,
      "value": "Excellent (4.2-5.0)"
    },
    {
      "name": "Candidate Experience Score",
      "impact": 4.0,
      "value": "Good"
    },
    {
      "name": "Time in Process",
      "impact": -2.5,
      "value": "35 days"
    },
    {
      "name": "Counter-Offer Risk",
      "impact": -1.5,
      "value": "Medium"
    },
    {
      "name": "Average Response Time",
      "impact": -1.0,
      "value": "2 days"
    }
  ],
  "riskLevel": "low",
  "recommendations": [
    "Strong acceptance indicators - maintain momentum and close quickly",
    "Compensation is competitive but could be improved to increase acceptance likelihood"
  ]
}
```

**Error Responses:**

- `404 Not Found`: Offer not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions

**Example:**

```bash
curl -X GET \
  https://api.example.com/predictive/offer-acceptance/660e8400-e29b-41d4-a716-446655440001 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Data Models

### TimeToFillPrediction

| Field | Type | Description |
|-------|------|-------------|
| predictedDays | number | Predicted number of days to fill the position |
| confidenceInterval | object | Lower and upper bounds of the prediction |
| confidenceInterval.lower | number | Lower bound (days) |
| confidenceInterval.upper | number | Upper bound (days) |
| factors | array | Key factors influencing the prediction |
| factors[].name | string | Factor name |
| factors[].impact | number | Impact on prediction (positive = increases time, negative = decreases time) |
| factors[].value | string | Human-readable value |

### OfferAcceptancePrediction

| Field | Type | Description |
|-------|------|-------------|
| acceptanceProbability | number | Probability of acceptance (0-100%) |
| factors | array | Key factors influencing the prediction |
| factors[].name | string | Factor name |
| factors[].impact | number | Impact on probability (percentage points) |
| factors[].value | string | Human-readable value |
| riskLevel | string | Risk level: "low", "medium", or "high" |
| recommendations | array | Actionable recommendations to improve acceptance probability |

## Feature Descriptions

### Time to Fill Factors

- **Historical Average**: Average time to fill across all jobs in the organization
- **Department Average**: Average time to fill for jobs in the same department
- **Expected Applicant Volume**: Predicted number of applicants based on similar jobs
- **Compensation Competitiveness**: How competitive the salary is compared to market rates
- **Location Competitiveness**: Attractiveness of the job location
- **Hiring Manager Responsiveness**: How quickly the hiring manager provides feedback
- **Interviewer Availability**: Availability of interviewers for scheduling
- **Seasonality**: Impact of time of year on hiring speed
- **Seniority Level**: Job seniority level (higher = longer time to fill)

### Offer Acceptance Factors

- **Compensation vs Market**: How the offer compares to market rates
- **Candidate Engagement**: Level of candidate engagement throughout the process
- **Interview Feedback**: Average interview feedback scores
- **Candidate Experience Score**: Candidate satisfaction scores from surveys
- **Time in Process**: Total time candidate has been in the hiring process
- **Counter-Offer Risk**: Likelihood of candidate receiving a counter-offer
- **Average Response Time**: How quickly the team responds to candidate communications

## Notes

- Predictions are based on historical data and machine learning models
- Confidence intervals represent the uncertainty in predictions
- Factor impacts show how each feature influences the final prediction
- Recommendations are generated based on identified risk factors
- Predictions update automatically as new data becomes available

## Future Enhancements

- Real-time prediction updates via WebSocket
- Custom model training per organization
- Additional prediction types (candidate quality, retention, etc.)
- SHAP values for enhanced explainability
- A/B testing framework for model improvements
