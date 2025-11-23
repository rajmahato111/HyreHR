# Job Management Guide

Learn how to create, manage, and optimize job postings in the Recruiting Platform.

## Overview

The Job Management module allows you to:
- Create and publish job requisitions
- Manage job lifecycle (draft → open → closed)
- Configure interview plans and pipelines
- Post to multiple job boards
- Track job performance metrics
- Collaborate with hiring teams

## Creating a Job

### Basic Information

1. Navigate to **Jobs** → **+ New Job**
2. Fill in required fields:

**Job Details**
- **Title**: Be specific (e.g., "Senior Backend Engineer - Python")
- **Department**: Select from your org structure
- **Location**: Add one or multiple locations
- **Remote**: Toggle if remote work is allowed
- **Employment Type**: Full-time, Part-time, Contract, Internship

**Compensation**
- **Salary Range**: Min and max (e.g., $120,000 - $180,000)
- **Currency**: USD, EUR, GBP, etc.
- **Display on Job Board**: Toggle to show/hide publicly

**Description**
Use the rich text editor to format your job description:
- Company overview
- Role responsibilities
- Required qualifications
- Preferred qualifications
- Benefits and perks
- Application instructions

### Advanced Settings

**Hiring Team**
- **Hiring Manager**: Primary decision maker
- **Recruiters**: Team members who can manage applications
- **Coordinators**: Schedule interviews and manage logistics

**Visibility**
- **Public**: Visible on career site and job boards
- **Internal**: Only visible to employees
- **Confidential**: Hidden from public, limited internal access

**Application Settings**
- **Custom Application Form**: Add screening questions
- **Required Documents**: Resume, cover letter, portfolio
- **Auto-response Email**: Confirmation message to applicants

### Interview Plan

Configure your interview process:

1. Click **Interview Plan** tab
2. Add interview stages:

**Example Interview Plan**
```
Stage 1: Phone Screen (30 min)
- Interviewer: Recruiter
- Scorecard: Initial Screening
- Focus: Culture fit, basic qualifications

Stage 2: Technical Interview (60 min)
- Interviewers: 2 Engineers
- Scorecard: Technical Skills
- Focus: Coding, problem-solving

Stage 3: System Design (90 min)
- Interviewers: Senior Engineer, Architect
- Scorecard: Architecture
- Focus: System design, scalability

Stage 4: Final Interview (45 min)
- Interviewers: Hiring Manager, Team Lead
- Scorecard: Leadership & Culture
- Focus: Team fit, career goals
```

3. Create scorecards for each stage
4. Assign default interviewers
5. Set interview instructions

### Pipeline Stages

Customize your application pipeline:

1. Click **Pipeline** tab
2. Add/edit stages:

**Default Stages**
- Applied
- Phone Screen
- Technical Interview
- Final Interview
- Offer
- Hired

**Custom Stages**
- Take-home Assignment
- Reference Check
- Background Check
- Onboarding

3. Set stage order
4. Configure auto-transitions (optional)
5. Add stage-specific email templates

## Publishing Jobs

### Internal Review

Before publishing:
1. Click **Preview** to see how it looks
2. Share draft link with hiring team
3. Collect feedback and make edits
4. Get approval if required

### Publishing Options

**Option 1: Career Site Only**
1. Click **Publish**
2. Job appears on your career site
3. Share direct link: `careers.company.com/jobs/[job-id]`

**Option 2: Job Boards**
1. Click **Post to Job Boards**
2. Select boards:
   - ✅ LinkedIn
   - ✅ Indeed
   - ✅ Glassdoor
   - ✅ Custom boards
3. Review posting details
4. Click **Publish to Selected Boards**

**Option 3: Scheduled Publishing**
1. Click **Schedule**
2. Set publish date and time
3. Job automatically goes live

### Tracking Job Board Posts

View posting status:
- **Posted**: Successfully published
- **Pending**: Awaiting approval
- **Failed**: Error occurred (click for details)
- **Expired**: Posting period ended

## Managing Active Jobs

### Job Dashboard

View key metrics for each job:
- **Applications**: Total received
- **Active Candidates**: In pipeline
- **Interviews Scheduled**: Upcoming
- **Offers Extended**: Pending/accepted
- **Time to Fill**: Days since opening
- **Source Breakdown**: Where candidates come from

### Bulk Actions

Select multiple jobs to:
- Change status (Open → On Hold)
- Update hiring team
- Duplicate jobs
- Export data
- Archive jobs

### Job Status Management

**Draft**
- Not visible publicly
- Can be edited freely
- Share with team for review

**Open**
- Accepting applications
- Visible on career site
- Posted to job boards

**On Hold**
- Temporarily paused
- No new applications accepted
- Existing candidates remain active

**Closed**
- Position filled
- No longer accepting applications
- Historical data preserved

**Cancelled**
- Position no longer needed
- All applications archived
- Can be reopened if needed

## Collaboration Features

### Comments and @Mentions

1. Open any job
2. Click **Comments** tab
3. Add comment
4. Use @username to notify team members
5. Attach files if needed

### Activity Feed

Track all job-related activities:
- Applications received
- Status changes
- Team member actions
- Interview scheduled
- Offers extended

### Sharing and Permissions

**Share Job**
- Copy public link
- Share draft for review
- Email to hiring team

**Permissions**
- **Owner**: Full control
- **Editor**: Can edit and manage
- **Viewer**: Read-only access
- **Applicant**: Can apply only

## Job Templates

### Creating Templates

Save time with reusable templates:

1. Create a job with common details
2. Click **Save as Template**
3. Name your template (e.g., "Engineering Role Template")
4. Select fields to include:
   - Description
   - Requirements
   - Interview plan
   - Pipeline stages
   - Email templates

### Using Templates

1. Click **+ New Job**
2. Select **Use Template**
3. Choose template
4. Customize as needed
5. Publish

## Application Forms

### Custom Questions

Add screening questions:

1. Open job → **Application Form** tab
2. Click **+ Add Question**
3. Choose question type:
   - Short text
   - Long text
   - Multiple choice
   - Yes/No
   - File upload
   - Dropdown

**Example Questions**
```
Q: Are you authorized to work in the US?
Type: Yes/No
Required: Yes

Q: What is your expected salary range?
Type: Short text
Required: No

Q: Why are you interested in this role?
Type: Long text
Required: Yes

Q: Upload your portfolio
Type: File upload
Required: No
```

### EEO Compliance

Add optional demographic questions:
- Gender
- Ethnicity
- Veteran status
- Disability status

**Important**: These are voluntary and not visible to hiring team during review.

## Job Board Integration

### Supported Boards

**Free Boards**
- LinkedIn (requires company page)
- Indeed (organic posting)
- Google for Jobs (automatic)

**Paid Boards**
- LinkedIn Sponsored
- Indeed Sponsored
- Glassdoor
- ZipRecruiter
- Monster
- CareerBuilder

### Posting Best Practices

**Optimize for Search**
- Use clear, specific job titles
- Include relevant keywords
- Add location information
- Specify employment type

**Write Compelling Descriptions**
- Start with company overview
- Highlight unique benefits
- Be specific about requirements
- Include salary range (increases applications by 30%)

**Use Rich Media**
- Add company photos
- Include team videos
- Link to culture page
- Showcase office/remote setup

### Tracking Performance

Monitor job board effectiveness:

| Board | Applications | Quality Score | Cost per Hire |
|-------|-------------|---------------|---------------|
| LinkedIn | 45 | 8.2/10 | $850 |
| Indeed | 120 | 6.5/10 | $420 |
| Referrals | 15 | 9.1/10 | $200 |
| Career Site | 30 | 7.8/10 | $0 |

## Analytics and Reporting

### Job Metrics

Track performance:
- **Application Rate**: Applications per view
- **Conversion Rate**: Applied → Hired
- **Time to Fill**: Days to hire
- **Source Effectiveness**: Best sources
- **Drop-off Analysis**: Where candidates exit

### Custom Reports

Create job-specific reports:

1. Navigate to **Analytics** → **Reports**
2. Click **+ New Report**
3. Select **Jobs** as data source
4. Add filters:
   - Date range
   - Department
   - Status
   - Location
5. Choose metrics and visualizations
6. Save and schedule

## Best Practices

### Writing Job Descriptions

**Do's**
✅ Be specific about role and requirements
✅ Highlight company culture and values
✅ Include salary range
✅ Use inclusive language
✅ Keep it concise (500-800 words)
✅ Add clear call-to-action

**Don'ts**
❌ Use jargon or acronyms
❌ List too many requirements
❌ Make unrealistic demands
❌ Use biased language
❌ Copy from other companies
❌ Forget to proofread

### Optimizing for Diversity

- Use gender-neutral language
- Avoid age-related terms
- Focus on skills, not years of experience
- Highlight diversity initiatives
- Show diverse team photos
- Partner with diversity-focused boards

### Managing High-Volume Roles

For roles with 100+ applications:

1. **Use AI Screening**
   - Set minimum match score (e.g., 70%)
   - Auto-reject below threshold
   - Auto-advance high scorers

2. **Implement Knockout Questions**
   - Must-have requirements
   - Auto-disqualify if not met
   - Save recruiter time

3. **Batch Processing**
   - Review applications in batches
   - Use bulk actions
   - Set aside dedicated time

4. **Leverage Automation**
   - Auto-send confirmations
   - Schedule screening calls automatically
   - Use email sequences for nurturing

## Troubleshooting

### Job Not Appearing on Career Site

**Check:**
- Job status is "Open"
- Visibility is set to "Public"
- Career site is published
- Clear browser cache

### Job Board Posting Failed

**Common Issues:**
- Invalid credentials
- Missing required fields
- Character limit exceeded
- Duplicate posting

**Solution:**
1. Review error message
2. Update job details
3. Reconnect integration if needed
4. Retry posting

### Low Application Rate

**Possible Causes:**
- Unclear job title
- Missing salary range
- Too many requirements
- Poor job description
- Limited visibility

**Solutions:**
- Optimize job title for search
- Add salary range
- Reduce requirements to must-haves
- Improve description
- Post to more boards
- Promote on social media

## Advanced Features

### Job Requisition Approval

Set up approval workflows:

1. **Settings** → **Workflows** → **Job Approval**
2. Configure approval chain:
   - Hiring Manager → Department Head → Finance
3. Set approval criteria:
   - Salary above $150K requires CFO approval
   - New headcount requires CEO approval
4. Enable notifications

### Confidential Searches

For sensitive roles:

1. Enable **Confidential** mode
2. Use generic job title externally
3. Reveal details after screening
4. Limit internal visibility
5. Use code names in communications

### Multi-Location Posting

For roles in multiple locations:

1. Create parent job
2. Add all locations
3. Option to create separate postings per location
4. Track applications by location
5. Assign location-specific recruiters

## FAQ

**Q: Can I edit a job after publishing?**
A: Yes, but changes may take time to reflect on job boards. Major changes may require reposting.

**Q: How long should I keep a job open?**
A: Average is 30-45 days. Close when you have enough qualified candidates or position is filled.

**Q: Can I reopen a closed job?**
A: Yes, change status back to "Open". Previous applications remain accessible.

**Q: How do I handle internal candidates?**
A: Mark job as "Internal" or use "Internal Applicants Only" setting.

**Q: Can I post the same job to multiple locations?**
A: Yes, add multiple locations or create separate jobs per location.

## Next Steps

- [Candidate Management](./candidate-management.md)
- [Application Pipeline](./application-pipeline.md)
- [Interview Scheduling](./interview-scheduling.md)
- [Analytics](./analytics.md)

---

**Need Help?** Contact support at support@platform.com or use in-app chat.
