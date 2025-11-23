# Predictive Analytics Module

This module provides AI-powered predictive analytics for recruiting metrics, including time-to-fill predictions and offer acceptance probability.

## Features

### Time to Fill Prediction

Predicts how long it will take to fill a job opening based on:
- Historical hiring data
- Department-specific metrics
- Expected applicant volume
- Compensation competitiveness
- Location competitiveness
- Hiring manager responsiveness
- Interviewer availability
- Seasonality factors
- Seniority level

**Endpoint:** `GET /predictive/time-to-fill/:jobId`

**Response:**
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
      "name": "Compensation Competitiveness",
      "impact": -0.08,
      "value": "High"
    }
  ]
}
```

### Offer Acceptance Prediction

Predicts the probability that a candidate will accept an offer based on:
- Compensation vs market rate
- Candidate engagement throughout process
- Interview feedback scores
- Candidate experience survey scores
- Time in hiring process
- Counter-offer risk
- Response time metrics

**Endpoint:** `GET /predictive/offer-acceptance/:offerId`

**Response:**
```json
{
  "acceptanceProbability": 75,
  "factors": [
    {
      "name": "Compensation vs Market",
      "impact": 0.12,
      "value": "Above market"
    },
    {
      "name": "Candidate Engagement",
      "impact": 0.08,
      "value": "Highly engaged"
    }
  ],
  "riskLevel": "low",
  "recommendations": [
    "Strong acceptance indicators - maintain momentum and close quickly"
  ]
}
```

## Implementation Details

### Feature Engineering

The `FeatureEngineeringService` extracts relevant features from historical data:

- **Time to Fill Features:** Analyzes past hiring patterns, department metrics, and current job characteristics
- **Offer Acceptance Features:** Evaluates candidate engagement, feedback, and offer competitiveness

### Prediction Models

Currently uses weighted linear models and logistic regression. In production, these should be replaced with trained ML models:

- **Time to Fill:** Random Forest or XGBoost for regression
- **Offer Acceptance:** Logistic Regression or Neural Network for classification

### Model Training (Future Enhancement)

To train production models:

1. Collect historical data (minimum 6-12 months)
2. Feature engineering and normalization
3. Train models using scikit-learn or TensorFlow
4. Evaluate model performance (RMSE for time-to-fill, AUC-ROC for offer acceptance)
5. Deploy models via API endpoint or embed in service

### Confidence Intervals

Time-to-fill predictions include confidence intervals based on:
- Data availability and quality
- Historical variance
- Seasonal factors
- Job characteristics

## Usage Example

```typescript
// Get time to fill prediction
const prediction = await predictiveService.predictTimeToFill(jobId);
console.log(`Expected to fill in ${prediction.predictedDays} days`);
console.log(`Range: ${prediction.confidenceInterval.lower}-${prediction.confidenceInterval.upper} days`);

// Get offer acceptance prediction
const offerPrediction = await predictiveService.predictOfferAcceptance(offerId);
console.log(`Acceptance probability: ${offerPrediction.acceptanceProbability}%`);
console.log(`Risk level: ${offerPrediction.riskLevel}`);
console.log('Recommendations:', offerPrediction.recommendations);
```

## Future Enhancements

1. **ML Model Integration:** Replace heuristic models with trained ML models
2. **Real-time Updates:** Update predictions as new data becomes available
3. **A/B Testing:** Test different model versions and features
4. **Explainability:** Enhanced SHAP values for factor importance
5. **Additional Predictions:**
   - Candidate quality score
   - Interview success probability
   - Retention prediction
   - Sourcing channel effectiveness

## Requirements Mapping

- **Requirement 23.1:** Time to fill prediction based on historical data
- **Requirement 23.2:** Offer acceptance probability prediction
- **Requirement 23.3:** Confidence intervals and factor importance
- **Requirement 23.4:** Predictions displayed in UI
- **Requirement 23.5:** Prediction explanations and factors
