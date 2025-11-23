# CRM UI Quick Start Guide

## Overview
The CRM UI provides powerful tools for managing talent pools and running automated email campaigns to engage candidates for future opportunities.

## Talent Pools

### Creating a Talent Pool

1. Navigate to **Talent Pools** from the main navigation
2. Click **Create Pool**
3. Enter basic information:
   - Pool name (required)
   - Description (optional)
   - Tags for organization
4. Choose pool type:
   - **Static Pool**: Manually add and remove candidates
   - **Dynamic Pool**: Auto-updates based on criteria
5. For dynamic pools, configure criteria:
   - Skills (comma-separated)
   - Years of experience (min/max)
   - Location
   - Current title
   - Current company
   - Tags
6. Click **Create Pool**

### Managing Pool Members

**Static Pools:**
- Click on a pool to view details
- Click **Add Candidates** to manually add members
- Select candidates and click **Remove** to remove them

**Dynamic Pools:**
- Click **Sync Pool** to refresh membership based on criteria
- Pool automatically updates when candidates match criteria
- Cannot manually add/remove candidates

### Viewing Pool Analytics

Navigate to the **Analytics** tab in pool detail view to see:
- Email performance (sent, opened, replied)
- Conversion metrics (applications, hires)
- Engagement rates
- Open and reply rates

## Email Sequences

### Creating an Email Sequence

1. Navigate to **Sequences** from the main navigation
2. Click **Create Sequence**
3. Enter sequence information:
   - Sequence name (required)
   - Description (optional)
4. Configure email steps:
   - Add multiple steps using **+ Add Step**
   - For each step, enter:
     - Email subject
     - Email body (supports variables)
     - Delay after previous step (days and hours)
5. Use variables in email content:
   - `{{firstName}}` - Candidate's first name
   - `{{lastName}}` - Candidate's last name
   - `{{company}}` - Your company name
   - `{{jobTitle}}` - Job title
6. Reorder steps using up/down arrows
7. Click **Create Sequence**

### Activating a Sequence

1. Open the sequence detail view
2. Click **Activate** to start the sequence
3. Sequence must be active to enroll candidates

### Enrolling Candidates

1. Open an active sequence
2. Click **Enroll Candidates** (feature to be added)
3. Select candidates from a talent pool or search
4. Candidates will automatically receive emails based on the sequence schedule

### Monitoring Sequence Performance

Navigate to the **Performance** tab to view:
- Email metrics (open rate, reply rate, completion rate)
- Average response time
- Response sentiment breakdown
- Enrollment status distribution

### Managing Enrollments

In the **Enrollments** tab:
- View all enrolled candidates
- See current step and progress
- Track email opens and replies
- Unenroll candidates if needed

## Best Practices

### Talent Pools

1. **Use Dynamic Pools** for ongoing talent sourcing
   - Set broad criteria to capture qualified candidates automatically
   - Regularly review and refine criteria

2. **Use Static Pools** for specific campaigns
   - Curate high-value candidates manually
   - Create pools for specific roles or projects

3. **Tag Pools** for easy organization
   - Use consistent tagging conventions
   - Examples: "engineering", "senior", "remote"

4. **Monitor Analytics** regularly
   - Track engagement rates
   - Identify high-performing pools
   - Adjust strategies based on data

### Email Sequences

1. **Start with 2-3 Steps**
   - Don't overwhelm candidates with too many emails
   - Test and optimize before adding more steps

2. **Space Out Steps Appropriately**
   - Wait 2-3 days between initial emails
   - Increase delays for later steps
   - Respect candidate time and inbox

3. **Personalize Content**
   - Use variables to customize emails
   - Reference specific skills or experience
   - Make it relevant to the candidate

4. **Test Before Activating**
   - Review all steps carefully
   - Check for typos and formatting
   - Ensure variables are correct

5. **Monitor and Optimize**
   - Track open and reply rates
   - A/B test subject lines
   - Refine content based on responses

6. **Respect Unsubscribes**
   - Honor unenroll requests immediately
   - Don't re-enroll candidates who opted out

## Common Workflows

### Workflow 1: Building a Talent Pipeline

1. Create a dynamic talent pool with criteria for your target role
2. Let the pool auto-populate with matching candidates
3. Create an email sequence for initial outreach
4. Activate the sequence
5. Enroll pool members in the sequence
6. Monitor responses and engagement
7. Move interested candidates to active job applications

### Workflow 2: Re-engaging Past Candidates

1. Create a static pool of past candidates
2. Manually add candidates from previous applications
3. Create a re-engagement email sequence
4. Activate and enroll candidates
5. Track responses and schedule interviews

### Workflow 3: Nurturing Passive Candidates

1. Create a dynamic pool for passive candidates (e.g., not actively applying)
2. Create a long-term nurture sequence (4-6 steps over 2-3 months)
3. Share company updates, culture content, and opportunities
4. Monitor engagement and identify interested candidates
5. Reach out personally to highly engaged candidates

## Troubleshooting

### Pool Not Syncing
- Verify criteria are correctly configured
- Check that candidates exist matching the criteria
- Try manually syncing the pool

### Sequence Not Sending
- Ensure sequence is activated (not draft or paused)
- Verify candidates are enrolled
- Check that delays are configured correctly

### Low Open Rates
- Improve subject lines (be specific and compelling)
- Send at optimal times (Tuesday-Thursday, 10am-2pm)
- Ensure emails aren't too long
- Personalize content

### Low Reply Rates
- Make emails more conversational
- Include clear call-to-action
- Ask specific questions
- Reduce email length
- Improve value proposition

## Tips for Success

1. **Segment Your Pools** - Create specific pools for different roles, seniority levels, or locations
2. **Test and Iterate** - Continuously improve your sequences based on performance data
3. **Keep It Personal** - Even automated emails should feel personal and relevant
4. **Track Everything** - Use analytics to understand what works and what doesn't
5. **Be Patient** - Building relationships takes time; don't expect immediate results
6. **Stay Compliant** - Respect privacy laws and candidate preferences
7. **Integrate with ATS** - Move engaged candidates into active job pipelines

## Next Steps

- Explore the Communication module for one-off emails
- Use the Chrome extension to quickly add candidates to pools
- Set up saved searches to identify candidates for dynamic pools
- Review analytics regularly to optimize your approach

## Support

For questions or issues:
- Check the main documentation
- Contact your system administrator
- Submit feedback through the platform
