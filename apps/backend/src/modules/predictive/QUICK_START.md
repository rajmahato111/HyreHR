# Predictive Analytics Quick Start

This guide will help you get started with the Predictive Analytics module.

## Overview

The Predictive Analytics module provides AI-powered predictions for:
- **Time to Fill**: How long it will take to fill a job opening
- **Offer Acceptance**: Probability that a candidate will accept an offer

## Prerequisites

- Job data with historical hiring information
- Application data with stage transitions
- Interview feedback data
- Offer data

## Getting Started

### 1. Backend Setup

The module is automatically registered in the application. No additional setup required.

### 2. API Usage

#### Get Time to Fill Prediction

```typescript
// GET /predictive/time-to-fill/:jobId
const response = await fetch(`/api/predictive/time-to-fill/${jobId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const prediction = await response.json();
console.log(`Expected to fill in ${prediction.predictedDays} days`);
console.log(`Range: ${prediction.confidenceInterval.lower}-${prediction.confidenceInterval.upper} days`);
```

#### Get Offer Acceptance Prediction

```typescript
// GET /predictive/offer-acceptance/:offerId
const response = await fetch(`/api/predictive/offer-acceptance/${offerId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const prediction = await response.json();
console.log(`Acceptance probability: ${prediction.acceptanceProbability}%`);
console.log(`Risk level: ${prediction.riskLevel}`);
console.log('Recommendations:', prediction.recommendations);
```

### 3. Frontend Integration

#### Time to Fill Component

```tsx
import { TimeToFillPredictionComponent } from '../components/jobs/TimeToFillPrediction';

function JobPage({ jobId }) {
  return (
    <div>
      <TimeToFillPredictionComponent jobId={jobId} />
    </div>
  );
}
```

#### Offer Acceptance Component

```tsx
import { OfferAcceptancePredictionComponent } from '../components/offers/OfferAcceptancePrediction';

function OfferPage({ offerId }) {
  return (
    <div>
      <OfferAcceptancePredictionComponent offerId={offerId} />
    </div>
  );
}
```

## Understanding Predictions

### Time to Fill

The prediction is based on:
- Historical hiring data from your organization
- Department-specific metrics
- Job characteristics (seniority, compensation, location)
- Current market conditions (seasonality)
- Team responsiveness and availability

**Interpreting Results:**
- `predictedDays`: Most likely number of days to fill
- `confidenceInterval`: Range of likely outcomes (e.g., 35-49 days)
- `factors`: Key drivers of the prediction with their impact

**Example:**
```json
{
  "predictedDays": 42,
  "confidenceInterval": { "lower": 35, "upper": 49 },
  "factors": [
    {
      "name": "Historical Average",
      "impact": 0.15,
      "value": "45 days"
    }
  ]
}
```

### Offer Acceptance

The prediction is based on:
- Compensation competitiveness
- Candidate engagement throughout the process
- Interview feedback scores
- Candidate experience survey responses
- Time in hiring process
- Counter-offer risk factors

**Interpreting Results:**
- `acceptanceProbability`: Likelihood of acceptance (0-100%)
- `riskLevel`: Overall risk assessment (low/medium/high)
- `recommendations`: Actionable steps to improve acceptance probability
- `factors`: Key drivers with their impact in percentage points

**Example:**
```json
{
  "acceptanceProbability": 75,
  "riskLevel": "low",
  "recommendations": [
    "Strong acceptance indicators - maintain momentum and close quickly"
  ],
  "factors": [
    {
      "name": "Compensation vs Market",
      "impact": 12.5,
      "value": "Above market"
    }
  ]
}
```

## Best Practices

### 1. Data Quality

Predictions are only as good as your data:
- Ensure accurate timestamps for all hiring events
- Collect interview feedback consistently
- Track candidate survey responses
- Maintain up-to-date compensation data

### 2. When to Use Predictions

**Time to Fill:**
- When opening a new job requisition
- During workforce planning
- To set realistic expectations with hiring managers
- To identify bottlenecks in the hiring process

**Offer Acceptance:**
- Before extending an offer
- When negotiating compensation
- To identify at-risk offers
- To prioritize follow-up actions

### 3. Acting on Predictions

**Low Time to Fill Prediction (< 30 days):**
- Prepare interview panels in advance
- Streamline approval processes
- Have offer templates ready

**High Time to Fill Prediction (> 60 days):**
- Consider increasing compensation
- Expand sourcing channels
- Review job requirements
- Improve hiring manager responsiveness

**Low Offer Acceptance Probability (< 50%):**
- Review compensation package
- Schedule additional sell calls
- Address candidate concerns proactively
- Highlight non-monetary benefits

**High Offer Acceptance Probability (> 70%):**
- Move quickly to close
- Maintain regular communication
- Prepare onboarding materials

## Troubleshooting

### Prediction Not Available

If predictions are not available:
1. Check that the job/offer exists
2. Ensure sufficient historical data (minimum 6 months recommended)
3. Verify that required data fields are populated

### Unexpected Predictions

If predictions seem off:
1. Review the factor breakdown to understand the reasoning
2. Check data quality for the specific job/offer
3. Consider organization-specific factors not captured by the model

### Performance Issues

If predictions are slow:
1. Ensure database indexes are in place
2. Check for large volumes of historical data
3. Consider caching predictions for frequently accessed jobs/offers

## Next Steps

- Review the [API Documentation](./API.md) for detailed endpoint specifications
- Read the [README](./README.md) for implementation details
- Explore factor importance to understand prediction drivers
- Provide feedback to improve model accuracy

## Support

For questions or issues:
- Check the API documentation
- Review the implementation code
- Contact the development team
