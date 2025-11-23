# Bias Detection Quick Start Guide

## Overview

This guide will help you quickly integrate bias detection into your recruiting workflow.

## Setup

### 1. Module is Already Integrated

The Bias Detection module is already integrated into the application. No additional setup required.

### 2. Environment Variables

No specific environment variables are required for basic functionality. Optional configuration:

```env
# Bias score thresholds (0-100)
BIAS_WARNING_THRESHOLD=25
BIAS_BLOCKING_THRESHOLD=75

# Statistical disparity threshold (4/5ths rule)
DISPARITY_THRESHOLD=0.8

# Minimum sample size for statistical analysis
MIN_SAMPLE_SIZE=5
```

## Basic Usage

### 1. Check Feedback for Bias (Real-time)

```typescript
import { biasDetectionService } from './services/bias-detection';

// In your feedback form component
const handleFeedbackChange = async (text: string) => {
  const result = await biasDetectionService.checkFeedback({
    strengths: text,
  });

  if (result.shouldWarn) {
    // Show warning to user
    showBiasWarning(result.biasedTerms, result.recommendations);
  }

  if (result.shouldBlock) {
    // Prevent submission
    setCanSubmit(false);
  }
};
```

### 2. Generate Bias Report

```typescript
// Generate report for a specific job
const report = await biasDetectionService.generateReport({
  jobId: 'job-uuid',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

console.log(`Total alerts: ${report.summary.totalAlerts}`);
console.log(`Critical alerts: ${report.summary.criticalAlerts}`);
```

### 3. Display Bias Dashboard

```tsx
import { BiasReportingDashboard } from './components/bias-detection';

function BiasPage() {
  return (
    <BiasReportingDashboard
      organizationId="org-123"
      jobId="job-456" // optional
    />
  );
}
```

### 4. Add Bias Checker to Feedback Form

```tsx
import { FeedbackBiasChecker } from './components/bias-detection';

function FeedbackForm() {
  const [feedback, setFeedback] = useState({
    strengths: '',
    concerns: '',
    notes: '',
  });

  return (
    <div>
      <textarea
        value={feedback.strengths}
        onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
        placeholder="Strengths..."
      />
      
      <textarea
        value={feedback.concerns}
        onChange={(e) => setFeedback({ ...feedback, concerns: e.target.value })}
        placeholder="Concerns..."
      />

      {/* Real-time bias checking */}
      <FeedbackBiasChecker
        feedbackText={feedback}
        onBiasDetected={(check) => {
          if (check.shouldBlock) {
            alert('Please revise your feedback before submitting');
          }
        }}
      />
    </div>
  );
}
```

## Common Scenarios

### Scenario 1: Prevent Biased Feedback Submission

```typescript
async function submitFeedback(feedbackData: FeedbackDto) {
  // Check for bias before submission
  const biasCheck = await biasDetectionService.checkFeedback(feedbackData);

  if (biasCheck.shouldBlock) {
    throw new Error(
      'Feedback contains severe bias. Please revise before submitting.'
    );
  }

  if (biasCheck.shouldWarn) {
    // Log warning but allow submission
    console.warn('Bias detected in feedback:', biasCheck.biasedTerms);
  }

  // Proceed with submission
  return await saveFeedback(feedbackData);
}
```

### Scenario 2: Monitor Job for Bias

```typescript
async function monitorJobBias(jobId: string) {
  const alerts = await biasDetectionService.getJobAlerts(jobId);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  
  if (criticalAlerts.length > 0) {
    // Send notification to hiring manager
    await notificationService.send({
      to: hiringManagerEmail,
      subject: 'Critical Bias Alert',
      body: `${criticalAlerts.length} critical bias alerts detected for job ${jobId}`,
    });
  }
}
```

### Scenario 3: Weekly Bias Report

```typescript
async function generateWeeklyReport(organizationId: string) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const report = await biasDetectionService.generateReport({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  // Email report to TA leadership
  await emailService.sendReport({
    to: 'ta-leadership@company.com',
    subject: 'Weekly Bias Detection Report',
    report,
  });
}
```

## Best Practices

### 1. Real-time Feedback

- Implement real-time bias checking in feedback forms
- Use debouncing (500ms) to avoid excessive API calls
- Show warnings inline, not as blocking modals

### 2. Education, Not Punishment

- Use bias alerts as teaching moments
- Provide clear explanations and suggestions
- Focus on improvement, not blame

### 3. Regular Monitoring

- Review bias reports weekly or monthly
- Track trends over time
- Adjust processes based on findings

### 4. Diverse Data Collection

- Collect demographic data voluntarily (EEOC compliance)
- Ensure data privacy and security
- Use aggregate data for analysis

### 5. Continuous Improvement

- Update bias patterns based on feedback
- Train interviewers regularly
- Implement structured interviews

## Testing

### Test Bias Detection

```typescript
// Test with known biased terms
const testFeedback = {
  strengths: 'Candidate is young and energetic',
  concerns: 'May not be a culture fit',
  notes: 'She seems very emotional',
};

const result = await biasDetectionService.checkFeedback(testFeedback);

console.log('Bias detected:', result.hasBias);
console.log('Biased terms:', result.biasedTerms);
console.log('Recommendations:', result.recommendations);
```

### Expected Output

```json
{
  "hasBias": true,
  "biasScore": 45,
  "biasedTerms": [
    {
      "term": "young",
      "category": "age",
      "context": "...young and energetic...",
      "suggestion": "Focus on skills and experience rather than age-related terms"
    },
    {
      "term": "culture fit",
      "category": "subjective",
      "context": "...not be a culture fit...",
      "suggestion": "Use specific, job-related criteria instead of vague personality assessments"
    },
    {
      "term": "She",
      "category": "gender",
      "context": "She seems very emotional",
      "suggestion": "Use gender-neutral pronouns (they/them) or refer to the candidate by name"
    },
    {
      "term": "emotional",
      "category": "gender_stereotype",
      "context": "...very emotional",
      "suggestion": "Use objective, behavior-based descriptions"
    }
  ],
  "recommendations": [
    "Focus on skills and experience rather than age-related terms",
    "Use specific, job-related criteria instead of vague personality assessments",
    "Use gender-neutral pronouns (they/them) or refer to the candidate by name",
    "Use objective, behavior-based descriptions",
    "Use structured interview scorecards with specific, job-related criteria",
    "Focus on observable behaviors and measurable skills",
    "Review feedback with a colleague before submitting"
  ],
  "shouldWarn": true,
  "shouldBlock": false
}
```

## Troubleshooting

### Issue: False Positives

**Problem:** Legitimate terms are flagged as biased

**Solution:** 
- Review the context of flagged terms
- Update bias patterns if needed
- Provide feedback to improve detection

### Issue: No Alerts Generated

**Problem:** No bias alerts despite potential issues

**Solution:**
- Ensure sufficient sample size (minimum 5 per group)
- Check that demographic data is being collected
- Verify date range includes relevant data

### Issue: Performance Issues

**Problem:** Bias checking is slow

**Solution:**
- Implement debouncing (500ms) for real-time checks
- Cache bias reports for frequently accessed jobs
- Use background jobs for large-scale analysis

## Next Steps

1. **Integrate into Feedback Forms**: Add `FeedbackBiasChecker` component
2. **Set Up Dashboard**: Create bias detection page for TA leadership
3. **Configure Alerts**: Set up notifications for critical bias alerts
4. **Train Team**: Educate interviewers on bias detection
5. **Monitor Regularly**: Review bias reports weekly

## Support

For questions or issues:
- Check the [README](./README.md) for detailed documentation
- Review the [API documentation](./API.md)
- Contact the development team
