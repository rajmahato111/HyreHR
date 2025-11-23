# AI-Powered Features Guide

Leverage artificial intelligence to streamline your recruiting process and make better hiring decisions.

## Overview

The Recruiting Platform includes several AI-powered features:

- 🤖 **Resume Parsing**: Automatically extract structured data from resumes
- 🎯 **Candidate Matching**: Calculate fit scores between candidates and jobs
- ✉️ **Email Assistant**: Generate personalized outreach and response emails
- 📊 **Predictive Analytics**: Forecast time to fill and offer acceptance
- 🎤 **Interview Transcription**: Real-time transcription and analysis
- 🔍 **Bias Detection**: Identify potential bias in job descriptions and feedback

## Resume Parsing

### How It Works

Our AI-powered resume parser uses natural language processing (NLP) to extract:
- Personal information (name, email, phone)
- Work experience (companies, titles, dates, descriptions)
- Education (schools, degrees, dates)
- Skills and certifications
- Languages

### Using Resume Parsing

**Automatic Parsing**
1. Upload resume when creating/editing candidate
2. AI automatically extracts data
3. Review parsed information
4. Confirm or edit as needed

**Confidence Scores**
Each field shows a confidence score:
- 🟢 **High (90-100%)**: Very confident, likely accurate
- 🟡 **Medium (70-89%)**: Fairly confident, review recommended
- 🔴 **Low (<70%)**: Low confidence, manual review required

**Example Output**
```
Name: John Doe ✓ (98% confidence)
Email: john.doe@email.com ✓ (99% confidence)
Phone: +1 (555) 123-4567 ✓ (95% confidence)

Experience:
- Senior Software Engineer at Tech Corp
  Jan 2020 - Present ✓ (92% confidence)
  • Led team of 5 engineers
  • Built microservices architecture
  • Improved performance by 40%

Skills: JavaScript, React, Node.js, AWS ✓ (88% confidence)
```

### Best Practices

**For Best Results:**
- Use standard resume formats (PDF, DOCX)
- Ensure text is selectable (not scanned images)
- Use clear section headers (Experience, Education, Skills)
- Avoid complex layouts or graphics

**Handling Low Confidence:**
- Review and manually correct
- Re-upload if resume is poorly formatted
- Add missing information manually

## Candidate Matching

### Match Score Calculation

AI calculates a match score (0-100%) based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills | 40% | Required and preferred skills match |
| Experience | 25% | Years and relevance of experience |
| Education | 15% | Degree requirements and school prestige |
| Location | 10% | Geographic fit and remote flexibility |
| Title | 10% | Job title similarity and progression |

### Viewing Match Scores

**In Pipeline View**
- Match score badge on each candidate card
- Color-coded: 🟢 High (80+), 🟡 Medium (60-79), 🔴 Low (<60)
- Sort by match score

**In Candidate Profile**
- Detailed breakdown by factor
- Skill gap analysis
- Match reasons and explanations

**Example Match Report**
```
Overall Match: 85% 🟢

Breakdown:
✓ Skills: 90% - Strong match on React, Node.js, TypeScript
✓ Experience: 85% - 6 years meets 5+ requirement
✓ Education: 80% - BS Computer Science from top university
✓ Location: 100% - Based in San Francisco, target location
✓ Title: 75% - Current title aligns with role level

Skill Gaps:
⚠️ Missing: Kubernetes, GraphQL
✓ Has: All required skills + Python, Go

Why This Candidate Matches:
• Strong technical skills in required stack
• Proven experience at scale (1M+ users)
• Located in target market
• Career progression shows growth
```

### Using Match Scores

**Auto-Routing**
Set up workflows to automatically route candidates:
- 85%+ → Phone Screen
- 70-84% → Review
- <70% → Applied (manual review)

**Prioritization**
Focus on high-match candidates first:
1. Sort pipeline by match score
2. Review 80%+ candidates immediately
3. Batch review 60-79% candidates
4. Auto-reject <50% if high volume

**Calibration**
Adjust weights based on your priorities:
- Technical roles: Increase skills weight
- Leadership roles: Increase experience weight
- Entry-level: Decrease experience weight

## AI Email Assistant

### Generating Outreach Emails

**Step 1: Select Context**
1. Open candidate profile
2. Click **Compose Email**
3. Click **AI Assistant** button
4. Select email type: "Outreach"

**Step 2: Choose Tone**
- **Professional**: Formal, business-like
- **Friendly**: Warm, conversational
- **Casual**: Relaxed, informal

**Step 3: Review and Edit**
AI generates personalized email:

```
Subject: Exciting Senior Engineer Opportunity at TechCorp

Hi John,

I came across your profile and was impressed by your experience 
building scalable microservices at Tech Corp. Your work on 
improving system performance by 40% particularly caught my attention.

We're currently looking for a Senior Software Engineer to join our 
Platform team at TechCorp. Given your strong background in React, 
Node.js, and AWS, I think you'd be a great fit for this role.

The position offers:
• Competitive salary ($150K-$180K)
• Equity package
• Remote-friendly culture
• Opportunity to work on products used by millions

Would you be interested in learning more? I'd love to schedule a 
brief call to discuss the opportunity.

Best regards,
Sarah Johnson
Senior Technical Recruiter
```

**Step 4: Personalize**
- Edit any section
- Add specific details
- Include mutual connections
- Mention recent achievements

**Step 5: Send**
- Review one final time
- Click **Send**
- AI tracks engagement (opens, clicks)

### Generating Response Emails

**For Candidate Questions**
1. Open email thread
2. Click **AI Suggest Response**
3. AI analyzes question and context
4. Generates appropriate response
5. Edit and send

**Example:**
```
Candidate: "What's the interview process like?"

AI Response:
"Great question! Our interview process typically includes:

1. Phone Screen (30 min) - Get to know you and discuss the role
2. Technical Interview (60 min) - Coding and problem-solving
3. System Design (90 min) - Architecture discussion
4. Final Interview (45 min) - Team fit and culture

The entire process usually takes 2-3 weeks. We'll keep you 
updated at every step and are happy to answer any questions 
along the way.

Does this timeline work for you?"
```

### Generating Rejection Emails

**Thoughtful Rejections**
1. Select application
2. Click **Reject**
3. Choose rejection reason
4. Click **Generate Rejection Email**
5. AI creates constructive, empathetic message

**Example:**
```
Subject: Update on Your Application

Hi John,

Thank you for taking the time to interview for the Senior Software 
Engineer position at TechCorp. We really enjoyed learning about 
your experience and accomplishments.

After careful consideration, we've decided to move forward with 
other candidates whose experience more closely aligns with our 
immediate needs, particularly in Kubernetes and distributed systems.

However, we were impressed by your strong React and Node.js skills, 
and we'd love to stay in touch for future opportunities. I've added 
you to our talent pool and will reach out when relevant positions 
open up.

Thank you again for your interest in TechCorp. We wish you the 
best in your job search.

Best regards,
Sarah Johnson
```

### Best Practices

**Do's:**
✅ Always review AI-generated content
✅ Add personal touches
✅ Verify facts and details
✅ Adjust tone for your brand
✅ Use as a starting point, not final copy

**Don'ts:**
❌ Send without reviewing
❌ Use generic content
❌ Ignore candidate context
❌ Over-rely on AI
❌ Forget to personalize

## Predictive Analytics

### Time to Fill Prediction

**How It Works**
AI analyzes historical data to predict how long it will take to fill a position:
- Similar roles in your organization
- Market competitiveness
- Application volume trends
- Seasonal patterns
- Your team's velocity

**Viewing Predictions**
1. Open job
2. Click **Analytics** tab
3. View **Predicted Time to Fill**

**Example:**
```
Predicted Time to Fill: 42 days
Confidence: 85%

Factors:
• Similar roles took 38-45 days
• High market competition for this skill set
• Current application rate: 3 per day
• Your team's average review time: 5 days

Recommendation: Start sourcing proactively to meet timeline
```

### Offer Acceptance Prediction

**How It Works**
AI predicts likelihood of offer acceptance based on:
- Compensation competitiveness
- Candidate engagement level
- Interview feedback sentiment
- Time in process
- Market conditions

**Viewing Predictions**
1. Open application at offer stage
2. View **Acceptance Probability**

**Example:**
```
Offer Acceptance Probability: 78%

Positive Signals:
✓ Compensation above market rate
✓ High engagement (quick responses, asked many questions)
✓ Positive interview feedback
✓ Expressed strong interest in role

Risk Factors:
⚠️ Has other active interviews
⚠️ Longer commute than current job

Recommendations:
• Highlight remote flexibility
• Emphasize career growth opportunities
• Consider expediting offer timeline
```

### Using Predictions

**Resource Planning**
- Forecast hiring timelines
- Plan team capacity
- Budget for recruiting costs

**Risk Mitigation**
- Identify at-risk offers
- Prepare backup candidates
- Adjust compensation if needed

**Process Optimization**
- Identify bottlenecks
- Improve slow stages
- Benchmark against predictions

## Interview Transcription

### Real-Time Transcription

**Setup**
1. Start video interview (Zoom, Google Meet)
2. Enable transcription in platform
3. AI transcribes in real-time
4. Review transcript after interview

**Features**
- Speaker identification
- Timestamp markers
- Key point highlighting
- Sentiment analysis
- Question/answer extraction

**Example Transcript:**
```
[00:02:15] Interviewer: Tell me about your experience with microservices.

[00:02:18] Candidate: At my current role, I architected and built a 
microservices platform that handles over 10 million requests per day. 
We used Docker and Kubernetes for orchestration...

[Key Point] ⭐ Candidate has hands-on experience with microservices at scale

[00:05:30] Interviewer: How do you handle service failures?

[00:05:35] Candidate: We implemented circuit breakers and retry logic...

[Positive Sentiment] 😊 Candidate shows strong technical knowledge
```

### Interview Analysis

**Automatic Insights**
- Technical depth assessment
- Communication skills evaluation
- Red flags detection
- Green flags highlighting
- Suggested follow-up questions

**Feedback Assistance**
AI suggests feedback based on transcript:
```
Suggested Feedback:

Strengths:
• Strong technical knowledge of microservices architecture
• Clear communication and ability to explain complex concepts
• Relevant experience at scale (10M+ requests/day)
• Proactive approach to reliability (circuit breakers, monitoring)

Areas of Concern:
• Limited experience with Kubernetes (mentioned Docker primarily)
• Didn't discuss testing strategies in depth

Overall Recommendation: Strong Yes
Candidate demonstrates solid technical skills and relevant experience.
```

## Bias Detection

### Job Description Analysis

**Automatic Scanning**
AI scans job descriptions for:
- Gender-coded language
- Age-related terms
- Unnecessary requirements
- Exclusive language

**Example Report:**
```
Bias Check Results: ⚠️ 3 issues found

Gender-Coded Language:
⚠️ "Rockstar developer" - Consider "Skilled developer"
⚠️ "Aggressive goals" - Consider "Ambitious goals"

Age Bias:
⚠️ "Digital native" - May exclude older candidates

Recommendations:
✓ Use "Experienced developer" instead of "Rockstar"
✓ Replace "aggressive" with "ambitious" or "challenging"
✓ Remove "digital native" or use "Tech-savvy"
```

### Interview Feedback Analysis

**Statistical Analysis**
AI analyzes feedback patterns:
- Rating disparities by demographic
- Language differences in feedback
- Consistency across interviewers

**Example Alert:**
```
⚠️ Potential Bias Detected

Pattern: Female candidates receive more comments about 
"communication style" and "cultural fit" compared to male 
candidates with similar qualifications.

Recommendation: Review feedback guidelines and provide 
interviewer training on objective evaluation criteria.
```

## Best Practices

### Maximizing AI Effectiveness

**1. Provide Quality Data**
- Upload complete resumes
- Keep candidate profiles updated
- Collect comprehensive feedback
- Track all interactions

**2. Review and Calibrate**
- Regularly review AI suggestions
- Provide feedback on accuracy
- Adjust weights and thresholds
- Monitor for bias

**3. Combine AI with Human Judgment**
- Use AI for efficiency, not replacement
- Apply context and intuition
- Consider factors AI can't measure
- Make final decisions yourself

**4. Stay Transparent**
- Inform candidates about AI use
- Explain how decisions are made
- Provide human contact options
- Respect privacy preferences

### Privacy and Ethics

**Data Usage**
- AI only uses data you provide
- No external data sources
- Compliant with GDPR and privacy laws
- Candidates can opt out

**Bias Mitigation**
- Regular bias audits
- Diverse training data
- Transparent algorithms
- Human oversight required

**Candidate Rights**
- Right to human review
- Right to explanation
- Right to opt out of AI screening
- Right to data deletion

## Troubleshooting

**Resume Parsing Issues**
- Try different file format
- Ensure text is selectable
- Simplify resume layout
- Contact support for help

**Low Match Scores**
- Review job requirements
- Adjust matching weights
- Consider hidden skills
- Look beyond the score

**AI Email Sounds Generic**
- Add more context
- Include specific details
- Personalize manually
- Try different tone

## FAQ

**Q: Is AI screening fair?**
A: We regularly audit for bias and require human review of all decisions. AI is a tool to assist, not replace human judgment.

**Q: Can candidates opt out of AI screening?**
A: Yes, candidates can request human-only review. Contact us to enable this option.

**Q: How accurate is resume parsing?**
A: Average accuracy is 85-95% depending on resume format. Always review parsed data.

**Q: Does AI replace recruiters?**
A: No, AI handles repetitive tasks so recruiters can focus on relationship-building and strategic work.

## Next Steps

- [Candidate Management](./candidate-management.md)
- [Analytics & Reporting](./analytics.md)
- [Workflow Automation](./workflows.md)

---

**Need Help?** Contact support at support@platform.com or use in-app chat.
