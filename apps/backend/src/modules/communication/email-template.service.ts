import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate, TemplateCategory } from '../../database/entities';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from './dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  /**
   * Create a new email template
   */
  async createTemplate(
    dto: CreateEmailTemplateDto,
    userId: string,
    organizationId: string,
  ): Promise<EmailTemplate> {
    // Extract variables from template
    const variables = this.extractVariables(dto.subject + ' ' + dto.body);

    const template = this.emailTemplateRepository.create({
      ...dto,
      variables: dto.variables || variables,
      organizationId,
      createdBy: userId,
    });

    await this.emailTemplateRepository.save(template);

    this.logger.log(`Email template created: ${template.id}`);
    return template;
  }

  /**
   * Get all templates for an organization
   */
  async getTemplates(
    organizationId: string,
    category?: TemplateCategory,
  ): Promise<EmailTemplate[]> {
    const query = this.emailTemplateRepository
      .createQueryBuilder('template')
      .where('template.organizationId = :organizationId', { organizationId });

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    query.orderBy('template.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Get template by ID
   */
  async getTemplateById(
    id: string,
    organizationId: string,
  ): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, organizationId },
      relations: ['creator'],
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  /**
   * Update email template
   */
  async updateTemplate(
    id: string,
    dto: UpdateEmailTemplateDto,
    organizationId: string,
  ): Promise<EmailTemplate> {
    const template = await this.getTemplateById(id, organizationId);

    // Cast dto to access optional properties
    const updateData = dto as Partial<CreateEmailTemplateDto>;

    // Update variables if subject or body changed
    if (updateData.subject || updateData.body) {
      const text = (updateData.subject || template.subject) + ' ' + (updateData.body || template.body);
      const variables = this.extractVariables(text);
      updateData.variables = updateData.variables || variables;
    }

    Object.assign(template, updateData);
    await this.emailTemplateRepository.save(template);

    this.logger.log(`Email template updated: ${template.id}`);
    return template;
  }

  /**
   * Delete email template
   */
  async deleteTemplate(id: string, organizationId: string): Promise<void> {
    const template = await this.getTemplateById(id, organizationId);
    await this.emailTemplateRepository.remove(template);

    this.logger.log(`Email template deleted: ${id}`);
  }

  /**
   * Duplicate email template
   */
  async duplicateTemplate(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<EmailTemplate> {
    const original = await this.getTemplateById(id, organizationId);

    const duplicate = this.emailTemplateRepository.create({
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body: original.body,
      category: original.category,
      variables: original.variables,
      shared: false,
      organizationId,
      createdBy: userId,
    });

    await this.emailTemplateRepository.save(duplicate);

    this.logger.log(`Email template duplicated: ${duplicate.id}`);
    return duplicate;
  }

  /**
   * Share template with organization
   */
  async shareTemplate(
    id: string,
    organizationId: string,
    shared: boolean,
  ): Promise<EmailTemplate> {
    const template = await this.getTemplateById(id, organizationId);
    template.shared = shared;
    await this.emailTemplateRepository.save(template);

    this.logger.log(`Email template share status updated: ${id} - ${shared}`);
    return template;
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(
    organizationId: string,
  ): Promise<Record<string, EmailTemplate[]>> {
    const templates = await this.getTemplates(organizationId);

    const grouped: Record<string, EmailTemplate[]> = {};

    for (const template of templates) {
      const category = template.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    }

    return grouped;
  }

  /**
   * Preview template with variables
   */
  async previewTemplate(
    id: string,
    variables: Record<string, any>,
    organizationId: string,
  ): Promise<{ subject: string; body: string }> {
    const template = await this.getTemplateById(id, organizationId);

    const subject = this.applyVariables(template.subject, variables);
    const body = this.applyVariables(template.body, variables);

    return { subject, body };
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(
    template: EmailTemplate,
    variables: Record<string, any>,
  ): { valid: boolean; missingVariables: string[] } {
    const missingVariables = template.variables.filter(
      (variable) => !(variable in variables),
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Extract variables from template text
   * Variables are in the format {{variableName}}
   */
  private extractVariables(text: string): string[] {
    const regex = /{{\\s*([a-zA-Z0-9_]+)\\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Apply variables to template text
   */
  private applyVariables(
    text: string,
    variables: Record<string, any>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value || '');
    }

    return result;
  }

  /**
   * Get default templates for new organizations
   */
  async createDefaultTemplates(
    organizationId: string,
    userId: string,
  ): Promise<EmailTemplate[]> {
    const defaultTemplates = [
      {
        name: 'Initial Outreach',
        subject: 'Exciting opportunity at {{companyName}}',
        body: `Hi {{candidateName}},

I came across your profile and was impressed by your experience in {{skills}}. We have an exciting opportunity for a {{jobTitle}} position at {{companyName}} that I think would be a great fit for your background.

{{jobDescription}}

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss.

Best regards,
{{recruiterName}}`,
        category: TemplateCategory.OUTREACH,
      },
      {
        name: 'Interview Invitation',
        subject: 'Interview invitation for {{jobTitle}} at {{companyName}}',
        body: `Hi {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}. We'd like to invite you for an interview.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Duration: {{duration}} minutes
- Location: {{location}}
- Interviewer: {{interviewerName}}

Please confirm your availability by replying to this email.

Looking forward to speaking with you!

Best regards,
{{recruiterName}}`,
        category: TemplateCategory.INTERVIEW,
      },
      {
        name: 'Rejection - Not a fit',
        subject: 'Update on your application for {{jobTitle}}',
        body: `Hi {{candidateName}},

Thank you for taking the time to apply for the {{jobTitle}} position at {{companyName}} and for speaking with our team.

After careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.

We were impressed by your background and encourage you to apply for future opportunities that match your skills and experience.

We wish you the best in your job search.

Best regards,
{{recruiterName}}`,
        category: TemplateCategory.REJECTION,
      },
      {
        name: 'Offer Letter',
        subject: 'Job offer for {{jobTitle}} at {{companyName}}',
        body: `Hi {{candidateName}},

We're excited to extend an offer for the {{jobTitle}} position at {{companyName}}!

Offer Details:
- Position: {{jobTitle}}
- Start Date: {{startDate}}
- Salary: {{salary}}
- Benefits: {{benefits}}

Please review the attached offer letter and let us know if you have any questions. We'd love to have you join our team!

Best regards,
{{recruiterName}}`,
        category: TemplateCategory.OFFER,
      },
      {
        name: 'Follow-up',
        subject: 'Following up on {{jobTitle}} opportunity',
        body: `Hi {{candidateName}},

I wanted to follow up on my previous email about the {{jobTitle}} position at {{companyName}}.

Are you still interested in learning more about this opportunity? I'd be happy to answer any questions you might have.

Best regards,
{{recruiterName}}`,
        category: TemplateCategory.FOLLOW_UP,
      },
    ];

    const templates = [];

    for (const templateData of defaultTemplates) {
      const variables = this.extractVariables(
        templateData.subject + ' ' + templateData.body,
      );

      const template = this.emailTemplateRepository.create({
        ...templateData,
        variables,
        shared: true,
        organizationId,
        createdBy: userId,
      });

      await this.emailTemplateRepository.save(template);
      templates.push(template);
    }

    this.logger.log(
      `Created ${templates.length} default templates for organization ${organizationId}`,
    );
    return templates;
  }
}
