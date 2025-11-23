import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';

export enum EmailTone {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  CASUAL = 'casual',
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  tone: EmailTone;
  tokens: string[];
}

export interface OutreachEmailOptions {
  candidate: Candidate;
  job: Job;
  tone: EmailTone;
  additionalContext?: string;
  recruiterName?: string;
  companyName?: string;
}

export interface ResponseEmailOptions {
  candidateEmail: string;
  candidateHistory: string;
  tone: EmailTone;
  context?: string;
}

export interface RejectionEmailOptions {
  candidateName: string;
  jobTitle: string;
  rejectionReason?: string;
  constructiveFeedback?: string;
  tone: EmailTone;
}

@Injectable()
export class AIEmailService {
  private readonly logger = new Logger(AIEmailService.name);
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. AI email generation will not work.');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
    });
  }

  /**
   * Generate personalized outreach email for candidate
   */
  async generateOutreachEmail(options: OutreachEmailOptions): Promise<GeneratedEmail> {
    const { candidate, job, tone, additionalContext, recruiterName, companyName } = options;

    const toneDescriptions = {
      [EmailTone.PROFESSIONAL]: 'formal and professional',
      [EmailTone.FRIENDLY]: 'warm and friendly while maintaining professionalism',
      [EmailTone.CASUAL]: 'casual and conversational',
    };

    const prompt = this.buildOutreachPrompt(
      candidate,
      job,
      toneDescriptions[tone],
      additionalContext,
      recruiterName,
      companyName,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional recruiter writing personalized outreach emails to potential candidates. 
Your emails should be engaging, personalized, and highlight why the candidate would be a great fit for the role.
Always include a clear call to action.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const content = response.choices[0].message.content;
      const { subject, body } = this.parseEmailContent(content);

      // Extract personalization tokens used
      const tokens = this.extractTokens(candidate, job);

      this.logger.log(`Generated outreach email for candidate ${candidate.id} and job ${job.id}`);

      return {
        subject,
        body,
        tone,
        tokens,
      };
    } catch (error) {
      this.logger.error(`Failed to generate outreach email: ${error.message}`, error.stack);
      throw new Error('Failed to generate AI email. Please try again.');
    }
  }

  /**
   * Generate response draft based on candidate email and context
   */
  async generateResponseDraft(options: ResponseEmailOptions): Promise<GeneratedEmail> {
    const { candidateEmail, candidateHistory, tone, context } = options;

    const toneDescriptions = {
      [EmailTone.PROFESSIONAL]: 'professional and courteous',
      [EmailTone.FRIENDLY]: 'friendly and helpful',
      [EmailTone.CASUAL]: 'casual and approachable',
    };

    const prompt = `
Generate a response email to a candidate with the following details:

Candidate's Email:
${candidateEmail}

Candidate History:
${candidateHistory}

${context ? `Additional Context:\n${context}\n` : ''}

Tone: ${toneDescriptions[tone]}

Requirements:
- Address the candidate's questions or concerns directly
- Be helpful and informative
- Maintain appropriate tone
- Include next steps if applicable
- Keep it concise (under 200 words)

Format your response as:
SUBJECT: [subject line]

BODY:
[email body]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful recruiter responding to candidate inquiries. 
Provide clear, accurate information and maintain a positive candidate experience.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      const { subject, body } = this.parseEmailContent(content);

      this.logger.log('Generated response draft email');

      return {
        subject,
        body,
        tone,
        tokens: [],
      };
    } catch (error) {
      this.logger.error(`Failed to generate response draft: ${error.message}`, error.stack);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  /**
   * Generate rejection email with constructive feedback
   */
  async generateRejectionEmail(options: RejectionEmailOptions): Promise<GeneratedEmail> {
    const { candidateName, jobTitle, rejectionReason, constructiveFeedback, tone } = options;

    const toneDescriptions = {
      [EmailTone.PROFESSIONAL]: 'professional and respectful',
      [EmailTone.FRIENDLY]: 'empathetic and encouraging',
      [EmailTone.CASUAL]: 'warm and supportive',
    };

    const prompt = `
Generate a rejection email for a candidate with the following details:

Candidate Name: ${candidateName}
Job Title: ${jobTitle}
${rejectionReason ? `Rejection Reason: ${rejectionReason}\n` : ''}
${constructiveFeedback ? `Constructive Feedback: ${constructiveFeedback}\n` : ''}

Tone: ${toneDescriptions[tone]}

Requirements:
- Be respectful and empathetic
- Thank them for their time and interest
- ${constructiveFeedback ? 'Include the constructive feedback in a positive way' : 'Keep it brief without specific feedback'}
- Encourage them to apply for future opportunities
- Wish them well in their job search
- Keep it concise (under 150 words)

Format your response as:
SUBJECT: [subject line]

BODY:
[email body]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate recruiter writing rejection emails. 
Your goal is to maintain a positive candidate experience even when delivering disappointing news.
Be respectful, empathetic, and professional.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const content = response.choices[0].message.content;
      const { subject, body } = this.parseEmailContent(content);

      this.logger.log(`Generated rejection email for candidate ${candidateName}`);

      return {
        subject,
        body,
        tone,
        tokens: [],
      };
    } catch (error) {
      this.logger.error(`Failed to generate rejection email: ${error.message}`, error.stack);
      throw new Error('Failed to generate AI rejection email. Please try again.');
    }
  }

  /**
   * Build the prompt for outreach email generation
   */
  private buildOutreachPrompt(
    candidate: Candidate,
    job: Job,
    toneDescription: string,
    additionalContext?: string,
    recruiterName?: string,
    companyName?: string,
  ): string {
    const candidateSkills = candidate.customFields?.skills || [];
    const jobSkills = []; // job.customFields?.requiredSkills || [];

    return `
Generate a personalized recruiting outreach email with the following details:

Candidate Information:
- Name: ${candidate.firstName} ${candidate.lastName}
- Current Role: ${candidate.currentTitle || 'Not specified'} ${candidate.currentCompany ? `at ${candidate.currentCompany}` : ''}
- Skills: ${candidateSkills.length > 0 ? candidateSkills.join(', ') : 'Not specified'}
- Location: ${candidate.locationCity ? `${candidate.locationCity}, ${candidate.locationState || ''}` : 'Not specified'}
${candidate.linkedinUrl ? `- LinkedIn: ${candidate.linkedinUrl}\n` : ''}

Job Opportunity:
- Title: ${job.title}
- Company: ${companyName || 'Our company'}
- Description: ${job.description?.substring(0, 300)}...
- Required Skills: ${jobSkills.length > 0 ? jobSkills.join(', ') : 'Not specified'}
- Location: ${'Not specified'}
- Remote: ${job.remoteOk ? 'Yes' : 'No'}
${job.salaryMin && job.salaryMax ? `- Salary Range: $${job.salaryMin} - $${job.salaryMax}\n` : ''}

${additionalContext ? `Additional Context:\n${additionalContext}\n` : ''}

Tone: ${toneDescription}

Requirements:
- Create an attention-grabbing subject line
- Personalized opening that references their background or experience
- Clear overview of the job opportunity
- Highlight 2-3 specific skill matches between candidate and role
- Explain why they would be a great fit
- Include a clear call to action (e.g., "Are you open to a conversation?")
- Keep it under 200 words
${recruiterName ? `- Sign off with: ${recruiterName}` : ''}

Format your response as:
SUBJECT: [subject line]

BODY:
[email body]
`;
  }

  /**
   * Parse email content from AI response
   */
  private parseEmailContent(content: string): { subject: string; body: string } {
    const lines = content.trim().split('\n');
    let subject = '';
    let body = '';
    let inBody = false;

    for (const line of lines) {
      if (line.startsWith('SUBJECT:')) {
        subject = line.replace('SUBJECT:', '').trim();
      } else if (line.startsWith('BODY:')) {
        inBody = true;
      } else if (inBody) {
        body += line + '\n';
      }
    }

    // Fallback if format is not followed
    if (!subject || !body) {
      const parts = content.split('\n\n');
      if (parts.length >= 2) {
        subject = parts[0].replace('SUBJECT:', '').trim();
        body = parts.slice(1).join('\n\n').replace('BODY:', '').trim();
      } else {
        subject = 'Exciting Opportunity';
        body = content;
      }
    }

    return {
      subject: subject.trim(),
      body: body.trim(),
    };
  }

  /**
   * Extract personalization tokens used in the email
   */
  private extractTokens(candidate: Candidate, job: Job): string[] {
    const tokens: string[] = [];

    if (candidate.firstName) tokens.push('{{firstName}}');
    if (candidate.lastName) tokens.push('{{lastName}}');
    if (candidate.currentTitle) tokens.push('{{currentTitle}}');
    if (candidate.currentCompany) tokens.push('{{currentCompany}}');
    if (job.title) tokens.push('{{jobTitle}}');
    // if (job.customFields?.location) tokens.push('{{jobLocation}}');

    return tokens;
  }
}
