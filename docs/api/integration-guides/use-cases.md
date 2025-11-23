# Common Use Cases and Integration Patterns

This guide provides practical examples for common recruiting workflows and integration scenarios.

## Table of Contents

1. [Automated Candidate Sourcing](#automated-candidate-sourcing)
2. [Application Processing Pipeline](#application-processing-pipeline)
3. [Interview Scheduling Automation](#interview-scheduling-automation)
4. [Offer Management Workflow](#offer-management-workflow)
5. [Analytics and Reporting](#analytics-and-reporting)
6. [HRIS Integration](#hris-integration)
7. [Job Board Posting](#job-board-posting)
8. [Email Campaign Management](#email-campaign-management)

## Automated Candidate Sourcing

### Use Case
Automatically source candidates from LinkedIn, parse their resumes, and add them to relevant talent pools.

### Implementation

```javascript
const RecruitingPlatform = require('@recruiting-platform/sdk');
const client = new RecruitingPlatform({ apiKey: process.env.API_KEY });

async function sourceCandidateFromLinkedIn(linkedinUrl) {
  try {
    // 1. Extract profile data (using Chrome extension or scraping)
    const profileData = await extractLinkedInProfile(linkedinUrl);
    
    // 2. Check for duplicates
    const existingCandidates = await client.candidates.search({
      q: profileData.email,
      limit: 1
    });
    
    if (existingCandidates.items.length > 0) {
      console.log('Candidate already exists');
      return existingCandidates.items[0];
    }
    
    // 3. Create candidate
    const candidate = await client.candidates.create({
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      linkedinUrl: linkedinUrl,
      currentTitle: profileData.currentTitle,
      currentCompany: profileData.currentCompany,
      location: profileData.location,
      tags: profileData.skills,
      source: {
        type: 'linkedin',
        details: { url: linkedinUrl }
      }
    });
    
    // 4. Find matching jobs
    const matchingJobs = await findMatchingJobs(candidate);
    
    // 5. Add to relevant talent pools
    for (const job of matchingJobs) {
      const talentPool = await getTalentPoolForJob(job.id);
      if (talentPool) {
        await client.talentPools.addCandidate(talentPool.id, candidate.id);
      }
    }
    
    // 6. Send outreach email if high match
    if (matchingJobs.length > 0 && matchingJobs[0].matchScore >= 80) {
      await sendOutreachEmail(candidate, matchingJobs[0]);
    }
    
    return candidate;
  } catch (error) {
    console.error('Error sourcing candidate:', error);
    throw error;
  }
}

async function findMatchingJobs(candidate) {
  const openJobs = await client.jobs.list({ status: 'open' });
  const matches = [];
  
  for (const job of openJobs.items) {
    const matchScore = await client.ai.calculateMatch({
      candidateId: candidate.id,
      jobId: job.id
    });
    
    if (matchScore.overall >= 70) {
      matches.push({ ...job, matchScore: matchScore.overall });
    }
  }
  
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

async function sendOutreachEmail(candidate, job) {
  const emailContent = await client.ai.generateEmail({
    type: 'outreach',
    candidateId: candidate.id,
    jobId: job.id,
    tone: 'professional'
  });
  
  await client.communication.sendEmail({
    candidateId: candidate.id,
    subject: emailContent.subject,
    body: emailContent.body,
    from: 'recruiter@company.com'
  });
}
```

## Application Processing Pipeline

### Use Case
Automatically process incoming applications, parse resumes, calculate match scores, and route to appropriate stages.

### Implementation

```javascript
async function processNewApplication(applicationData) {
  try {
    // 1. Create or update candidate
    let candidate = await findOrCreateCandidate(applicationData);
    
    // 2. Parse resume if provided
    if (applicationData.resumeFile) {
      const parsedData = await client.ai.parseResume({
        candidateId: candidate.id,
        file: applicationData.resumeFile
      });
      
      // Update candidate with parsed data
      if (parsedData.confidence.overall >= 0.8) {
        candidate = await client.candidates.update(candidate.id, {
          ...parsedData.parsedData,
          resumeUrls: [parsedData.resumeUrl]
        });
      }
    }
    
    // 3. Create application
    const application = await client.applications.create({
      candidateId: candidate.id,
      jobId: applicationData.jobId,
      source: applicationData.source,
      customFields: applicationData.customFields
    });
    
    // 4. Calculate match score
    const matchScore = await client.ai.calculateMatch({
      candidateId: candidate.id,
      jobId: applicationData.jobId
    });
    
    // 5. Auto-route based on match score
    let targetStage;
    if (matchScore.overall >= 85) {
      targetStage = await getStageByName(applicationData.jobId, 'Phone Screen');
      await notifyRecruiter(application, 'High match candidate!');
    } else if (matchScore.overall >= 70) {
      targetStage = await getStageByName(applicationData.jobId, 'Review');
    } else {
      targetStage = await getStageByName(applicationData.jobId, 'Applied');
    }
    
    if (targetStage) {
      await client.applications.move(application.id, {
        stageId: targetStage.id,
        notes: `Auto-routed based on match score: ${matchScore.overall}%`
      });
    }
    
    // 6. Send confirmation email to candidate
    await client.communication.sendEmail({
      candidateId: candidate.id,
      templateId: 'application-confirmation',
      variables: {
        candidateName: candidate.firstName,
        jobTitle: applicationData.jobTitle
      }
    });
    
    // 7. Log analytics event
    await logEvent('application_processed', {
      applicationId: application.id,
      matchScore: matchScore.overall,
      autoRouted: true
    });
    
    return { application, matchScore };
  } catch (error) {
    console.error('Error processing application:', error);
    throw error;
  }
}

async function findOrCreateCandidate(applicationData) {
  // Check for existing candidate by email
  const existing = await client.candidates.search({
    q: applicationData.email,
    limit: 1
  });
  
  if (existing.items.length > 0) {
    return existing.items[0];
  }
  
  // Create new candidate
  return await client.candidates.create({
    email: applicationData.email,
    firstName: applicationData.firstName,
    lastName: applicationData.lastName,
    phone: applicationData.phone,
    source: applicationData.source
  });
}
```

## Interview Scheduling Automation

### Use Case
Automatically schedule interviews based on interviewer availability and send calendar invites.

### Implementation

```javascript
async function scheduleInterviewAutomatically(applicationId, interviewType) {
  try {
    // 1. Get application and job details
    const application = await client.applications.get(applicationId);
    const job = await client.jobs.get(application.jobId);
    const candidate = await client.candidates.get(application.candidateId);
    
    // 2. Get interview plan for job
    const interviewPlan = await client.interviews.getInterviewPlan(job.interviewPlanId);
    const interviewStage = interviewPlan.stages.find(s => s.type === interviewType);
    
    if (!interviewStage) {
      throw new Error(`Interview stage ${interviewType} not found`);
    }
    
    // 3. Find available interviewers
    const interviewers = await getAvailableInterviewers(
      interviewStage.interviewerIds,
      interviewStage.durationMinutes
    );
    
    if (interviewers.length === 0) {
      throw new Error('No available interviewers found');
    }
    
    // 4. Find common availability
    const availableSlots = await findCommonAvailability(
      interviewers,
      interviewStage.durationMinutes,
      { daysAhead: 14, workingHoursOnly: true }
    );
    
    if (availableSlots.length === 0) {
      throw new Error('No available time slots found');
    }
    
    // 5. Generate scheduling link for candidate
    const schedulingLink = await client.interviews.createSchedulingLink({
      applicationId: application.id,
      interviewStageId: interviewStage.id,
      availableSlots: availableSlots.slice(0, 10), // Top 10 slots
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    // 6. Send scheduling link to candidate
    await client.communication.sendEmail({
      candidateId: candidate.id,
      templateId: 'interview-scheduling-link',
      variables: {
        candidateName: candidate.firstName,
        jobTitle: job.title,
        interviewType: interviewStage.name,
        schedulingLink: schedulingLink.url,
        expiresAt: schedulingLink.expiresAt
      }
    });
    
    return schedulingLink;
  } catch (error) {
    console.error('Error scheduling interview:', error);
    throw error;
  }
}

async function findCommonAvailability(interviewers, durationMinutes, options) {
  const slots = [];
  const startDate = new Date();
  const endDate = new Date(Date.now() + options.daysAhead * 24 * 60 * 60 * 1000);
  
  // Get availability for all interviewers
  const availabilities = await Promise.all(
    interviewers.map(interviewer =>
      client.interviews.getAvailability(interviewer.id, {
        startDate,
        endDate,
        durationMinutes
      })
    )
  );
  
  // Find overlapping slots
  const firstInterviewerSlots = availabilities[0];
  
  for (const slot of firstInterviewerSlots) {
    const allAvailable = availabilities.every(availability =>
      availability.some(s =>
        s.start === slot.start && s.end === slot.end
      )
    );
    
    if (allAvailable) {
      slots.push(slot);
    }
  }
  
  return slots;
}

// Webhook handler for when candidate selects a time
async function handleInterviewScheduled(webhookData) {
  const { interviewId, applicationId, scheduledAt } = webhookData;
  
  // Move application to next stage
  const interviewStage = await getStageByName(
    webhookData.jobId,
    'Interview Scheduled'
  );
  
  await client.applications.move(applicationId, {
    stageId: interviewStage.id,
    notes: `Interview scheduled for ${scheduledAt}`
  });
  
  // Send confirmation to candidate
  await client.communication.sendEmail({
    candidateId: webhookData.candidateId,
    templateId: 'interview-confirmation',
    variables: {
      interviewDate: scheduledAt,
      interviewType: webhookData.interviewType
    }
  });
  
  // Notify interviewers
  for (const interviewer of webhookData.interviewers) {
    await sendNotification(interviewer.id, {
      type: 'interview_scheduled',
      message: `Interview scheduled with ${webhookData.candidateName}`,
      interviewId: interviewId
    });
  }
}
```

## Offer Management Workflow

### Use Case
Create offers, route through approval workflow, send for e-signature, and trigger onboarding.

### Implementation

```javascript
async function createAndSendOffer(applicationId, offerDetails) {
  try {
    // 1. Create offer
    const offer = await client.offers.create({
      applicationId: applicationId,
      salary: offerDetails.salary,
      currency: offerDetails.currency,
      bonus: offerDetails.bonus,
      equity: offerDetails.equity,
      startDate: offerDetails.startDate,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      customFields: offerDetails.customFields
    });
    
    // 2. Route through approval workflow
    const approvalWorkflow = await getApprovalWorkflow(offerDetails.salary);
    
    for (const approver of approvalWorkflow) {
      await client.offers.requestApproval(offer.id, {
        approverId: approver.id,
        notes: `Offer requires ${approver.role} approval`
      });
      
      // Wait for approval (in practice, this would be event-driven)
      await waitForApproval(offer.id, approver.id);
    }
    
    // 3. Generate offer letter from template
    const offerLetter = await client.offers.generateDocument(offer.id, {
      templateId: offerDetails.templateId
    });
    
    // 4. Send for e-signature
    const docusignEnvelope = await client.offers.sendForSignature(offer.id, {
      provider: 'docusign',
      signers: [
        {
          email: offerDetails.candidateEmail,
          name: offerDetails.candidateName,
          role: 'candidate'
        },
        {
          email: offerDetails.hiringManagerEmail,
          name: offerDetails.hiringManagerName,
          role: 'hiring_manager'
        }
      ]
    });
    
    // 5. Notify candidate
    await client.communication.sendEmail({
      candidateId: offerDetails.candidateId,
      templateId: 'offer-sent',
      variables: {
        candidateName: offerDetails.candidateName,
        jobTitle: offerDetails.jobTitle,
        offerLink: docusignEnvelope.signingUrl
      }
    });
    
    return { offer, docusignEnvelope };
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
}

// Webhook handler for offer acceptance
async function handleOfferAccepted(webhookData) {
  const { offerId, applicationId, candidateId } = webhookData;
  
  try {
    // 1. Update application status
    await client.applications.hire(applicationId);
    
    // 2. Transfer to HRIS
    const candidate = await client.candidates.get(candidateId);
    const offer = await client.offers.get(offerId);
    
    await client.integrations.hris.createEmployee({
      provider: 'bamboohr',
      data: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        jobTitle: offer.jobTitle,
        department: offer.department,
        startDate: offer.startDate,
        salary: offer.salary,
        employmentType: offer.employmentType
      }
    });
    
    // 3. Trigger onboarding workflow
    await triggerOnboardingWorkflow(candidateId, offer);
    
    // 4. Send welcome email
    await client.communication.sendEmail({
      candidateId: candidateId,
      templateId: 'welcome-onboarding',
      variables: {
        candidateName: candidate.firstName,
        startDate: offer.startDate,
        onboardingPortalUrl: process.env.ONBOARDING_PORTAL_URL
      }
    });
    
    // 5. Close job if filled
    const job = await client.jobs.get(offer.jobId);
    if (job.openings === 1) {
      await client.jobs.update(job.id, { status: 'closed' });
    }
    
  } catch (error) {
    console.error('Error handling offer acceptance:', error);
    throw error;
  }
}
```

## Analytics and Reporting

### Use Case
Generate custom reports and dashboards for recruiting metrics.

### Implementation

```javascript
async function generateRecruitingMetrics(dateRange) {
  try {
    // 1. Get funnel metrics
    const funnelMetrics = await client.analytics.getMetrics({
      type: 'funnel',
      startDate: dateRange.start,
      endDate: dateRange.end,
      groupBy: 'job'
    });
    
    // 2. Calculate time to fill
    const timeToFillData = await client.analytics.getMetrics({
      type: 'time_to_fill',
      startDate: dateRange.start,
      endDate: dateRange.end,
      groupBy: 'department'
    });
    
    // 3. Get quality metrics
    const qualityMetrics = await client.analytics.getMetrics({
      type: 'quality',
      startDate: dateRange.start,
      endDate: dateRange.end,
      metrics: ['offer_acceptance_rate', 'retention_rate']
    });
    
    // 4. Diversity metrics
    const diversityMetrics = await client.analytics.getMetrics({
      type: 'diversity',
      startDate: dateRange.start,
      endDate: dateRange.end,
      groupBy: 'stage'
    });
    
    // 5. Create custom report
    const report = await client.analytics.createReport({
      name: `Recruiting Metrics - ${dateRange.start} to ${dateRange.end}`,
      sections: [
        {
          title: 'Funnel Analysis',
          data: funnelMetrics,
          visualizations: ['funnel_chart', 'conversion_table']
        },
        {
          title: 'Time to Fill',
          data: timeToFillData,
          visualizations: ['bar_chart', 'trend_line']
        },
        {
          title: 'Quality Metrics',
          data: qualityMetrics,
          visualizations: ['scorecard', 'gauge_chart']
        },
        {
          title: 'Diversity & Inclusion',
          data: diversityMetrics,
          visualizations: ['stacked_bar', 'heatmap']
        }
      ]
    });
    
    // 6. Export report
    const pdfReport = await client.analytics.exportReport(report.id, {
      format: 'pdf'
    });
    
    // 7. Schedule recurring report
    await client.analytics.scheduleReport({
      reportId: report.id,
      frequency: 'weekly',
      recipients: ['leadership@company.com'],
      format: 'pdf'
    });
    
    return { report, pdfReport };
  } catch (error) {
    console.error('Error generating metrics:', error);
    throw error;
  }
}

// Real-time dashboard updates
async function setupRealtimeDashboard() {
  const ws = new WebSocket('wss://api.platform.com/ws');
  
  ws.on('open', () => {
    // Subscribe to metrics updates
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'analytics',
      filters: {
        metrics: ['applications_today', 'interviews_scheduled', 'offers_pending']
      }
    }));
  });
  
  ws.on('message', (data) => {
    const update = JSON.parse(data);
    
    if (update.type === 'metrics.updated') {
      updateDashboard(update.data);
    }
  });
}
```

## HRIS Integration

### Use Case
Sync employee data with HRIS systems when candidates are hired.

### Implementation

```javascript
async function syncWithHRIS(candidateId, offerId) {
  try {
    const candidate = await client.candidates.get(candidateId);
    const offer = await client.offers.get(offerId);
    const application = await client.applications.get(offer.applicationId);
    const job = await client.jobs.get(application.jobId);
    
    // Prepare employee data
    const employeeData = {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address,
      jobTitle: job.title,
      department: job.department,
      location: job.location,
      startDate: offer.startDate,
      salary: offer.salary,
      employmentType: job.employmentType,
      manager: job.hiringManagerId,
      customFields: {
        recruitingSource: application.source.type,
        applicationDate: application.appliedAt,
        hireDate: application.hiredAt
      }
    };
    
    // Sync to BambooHR
    const bambooEmployee = await client.integrations.hris.createEmployee({
      provider: 'bamboohr',
      data: employeeData
    });
    
    // Sync to Workday (if configured)
    if (await isIntegrationEnabled('workday')) {
      const workdayEmployee = await client.integrations.hris.createEmployee({
        provider: 'workday',
        data: employeeData
      });
    }
    
    // Store integration references
    await client.candidates.update(candidateId, {
      customFields: {
        bamboohrId: bambooEmployee.id,
        workdayId: workdayEmployee?.id
      }
    });
    
    return { bambooEmployee, workdayEmployee };
  } catch (error) {
    console.error('Error syncing with HRIS:', error);
    throw error;
  }
}
```

## Job Board Posting

### Use Case
Automatically post jobs to multiple job boards and track applications.

### Implementation

```javascript
async function postJobToBoards(jobId, boards = ['linkedin', 'indeed', 'glassdoor']) {
  try {
    const job = await client.jobs.get(jobId);
    const postings = [];
    
    for (const board of boards) {
      const posting = await client.integrations.jobBoards.post({
        provider: board,
        jobId: jobId,
        data: {
          title: job.title,
          description: job.description,
          location: job.location,
          employmentType: job.employmentType,
          salaryRange: job.salaryRange,
          applyUrl: `https://careers.company.com/jobs/${job.id}/apply`
        }
      });
      
      postings.push(posting);
    }
    
    // Track posting status
    await client.jobs.update(jobId, {
      customFields: {
        jobBoardPostings: postings.map(p => ({
          board: p.provider,
          externalId: p.externalId,
          url: p.url,
          postedAt: p.postedAt
        }))
      }
    });
    
    return postings;
  } catch (error) {
    console.error('Error posting to job boards:', error);
    throw error;
  }
}

// Track applications from job boards
async function trackJobBoardApplication(source, externalData) {
  const jobBoardMapping = {
    linkedin: 'LinkedIn',
    indeed: 'Indeed',
    glassdoor: 'Glassdoor'
  };
  
  const application = await processNewApplication({
    ...externalData,
    source: {
      type: 'job_board',
      details: {
        board: jobBoardMapping[source],
        externalId: externalData.externalApplicationId
      }
    }
  });
  
  // Update job board posting stats
  await updateJobBoardStats(source, externalData.jobId);
  
  return application;
}
```

## Email Campaign Management

### Use Case
Run nurture campaigns for talent pools with automated follow-ups.

### Implementation

```javascript
async function createNurtureCampaign(talentPoolId, jobId) {
  try {
    // 1. Create email sequence
    const sequence = await client.emailSequences.create({
      name: `Nurture Campaign - ${jobId}`,
      talentPoolId: talentPoolId,
      steps: [
        {
          order: 1,
          delayDays: 0,
          templateId: 'initial-outreach',
          subject: 'Exciting opportunity at {{companyName}}',
          variables: { jobId: jobId }
        },
        {
          order: 2,
          delayDays: 3,
          templateId: 'follow-up-1',
          subject: 'Following up on {{jobTitle}} opportunity',
          condition: {
            type: 'not_responded',
            previousStep: 1
          }
        },
        {
          order: 3,
          delayDays: 7,
          templateId: 'follow-up-2',
          subject: 'Last chance to apply for {{jobTitle}}',
          condition: {
            type: 'not_responded',
            previousStep: 2
          }
        }
      ]
    });
    
    // 2. Enroll candidates from talent pool
    const talentPool = await client.talentPools.get(talentPoolId);
    const candidates = await client.talentPools.getCandidates(talentPoolId);
    
    for (const candidate of candidates) {
      await client.emailSequences.enroll({
        sequenceId: sequence.id,
        candidateId: candidate.id,
        variables: {
          companyName: 'TechCorp',
          jobTitle: 'Senior Engineer'
        }
      });
    }
    
    // 3. Monitor campaign performance
    const stats = await client.emailSequences.getStats(sequence.id);
    console.log('Campaign stats:', stats);
    
    return sequence;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

// Handle email responses
async function handleEmailResponse(webhookData) {
  const { candidateId, sequenceId, sentiment } = webhookData;
  
  if (sentiment === 'interested') {
    // Move to active pipeline
    const sequence = await client.emailSequences.get(sequenceId);
    const application = await client.applications.create({
      candidateId: candidateId,
      jobId: sequence.jobId,
      source: {
        type: 'email_sequence',
        details: { sequenceId: sequenceId }
      }
    });
    
    // Unenroll from sequence
    await client.emailSequences.unenroll(sequenceId, candidateId);
    
    // Notify recruiter
    await sendNotification(sequence.ownerId, {
      type: 'interested_candidate',
      message: `Candidate responded positively to outreach`,
      applicationId: application.id
    });
  } else if (sentiment === 'not_interested') {
    // Unenroll and mark
    await client.emailSequences.unenroll(sequenceId, candidateId);
    await client.candidates.update(candidateId, {
      tags: [...candidate.tags, 'not_interested']
    });
  }
}
```

## Best Practices

### Error Handling
Always implement comprehensive error handling:

```javascript
async function robustApiCall(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        await sleep(error.retryAfter * 1000);
      } else if (error.status >= 500) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

### Batch Operations
Use batch operations for better performance:

```javascript
// Instead of individual updates
for (const app of applications) {
  await client.applications.move(app.id, { stageId: newStageId });
}

// Use bulk operation
await client.applications.bulk({
  action: 'move',
  applicationIds: applications.map(a => a.id),
  stageId: newStageId
});
```

### Webhook Reliability
Implement idempotency for webhook handlers:

```javascript
const processedEvents = new Set();

async function handleWebhook(event) {
  // Check if already processed
  if (processedEvents.has(event.id)) {
    return;
  }
  
  try {
    await processEvent(event);
    processedEvents.add(event.id);
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error; // Return 500 to trigger retry
  }
}
```

## Next Steps

- Review [API Reference](../README.md) for complete endpoint documentation
- Explore [Integration Patterns](./integration-patterns.md) for architectural guidance
- Check [Security Best Practices](./security.md) for secure integration
- Join [Developer Community](https://community.platform.com) for support
