import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Offer } from '../../../database/entities';

export interface RipplingEmployee {
  firstName: string;
  lastName: string;
  email: string;
  personalEmail?: string;
  phone?: string;
  jobTitle: string;
  department?: string;
  location?: string;
  startDate: string;
  employmentType: string;
  compensation: {
    amount: number;
    currency: string;
    period: string;
  };
  manager?: string;
}

@Injectable()
export class RipplingService {
  private readonly logger = new Logger(RipplingService.name);
  private apiKey: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RIPPLING_API_KEY');
    this.baseUrl = this.configService.get<string>('RIPPLING_BASE_URL') || 'https://api.rippling.com/v1';
  }

  private getAuthHeader(): string {
    return `Bearer ${this.apiKey}`;
  }

  async createEmployee(offer: Offer): Promise<string> {
    try {
      const employeeData: RipplingEmployee = {
        firstName: offer.application.candidate.firstName,
        lastName: offer.application.candidate.lastName,
        email: offer.application.candidate.email,
        personalEmail: offer.application.candidate.email,
        phone: offer.application.candidate.phone,
        jobTitle: offer.jobTitle,
        department: offer.application.job.department?.name,
        location: offer.application.job.locations?.[0]?.name,
        startDate: offer.startDate ? offer.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        employmentType: this.mapEmploymentType(offer.application.job.employmentType),
        compensation: {
          amount: offer.salary,
          currency: offer.currency,
          period: 'ANNUAL',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/employees`,
        employeeData,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      const employeeId = response.data.id;
      this.logger.log(`Created Rippling employee: ${employeeId}`);

      return employeeId;
    } catch (error) {
      this.logger.error('Failed to create Rippling employee', error);
      throw new Error('Failed to create employee in Rippling');
    }
  }

  private mapEmploymentType(type: string): string {
    const mapping: Record<string, string> = {
      full_time: 'FULL_TIME',
      part_time: 'PART_TIME',
      contract: 'CONTRACTOR',
      internship: 'INTERN',
    };
    return mapping[type] || 'FULL_TIME';
  }

  async updateEmployee(employeeId: string, updates: Partial<RipplingEmployee>): Promise<void> {
    try {
      await axios.patch(
        `${this.baseUrl}/employees/${employeeId}`,
        updates,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Updated Rippling employee: ${employeeId}`);
    } catch (error) {
      this.logger.error(`Failed to update Rippling employee ${employeeId}`, error);
      throw new Error('Failed to update employee in Rippling');
    }
  }

  async getEmployee(employeeId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/employees/${employeeId}`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Rippling employee ${employeeId}`, error);
      throw new Error('Failed to get employee from Rippling');
    }
  }

  async createOnboardingTask(employeeId: string, task: {
    title: string;
    description?: string;
    dueDate?: string;
    assignee?: string;
  }): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/employees/${employeeId}/onboarding-tasks`,
        task,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      const taskId = response.data.id;
      this.logger.log(`Created onboarding task for Rippling employee ${employeeId}: ${taskId}`);

      return taskId;
    } catch (error) {
      this.logger.error(`Failed to create onboarding task for Rippling employee ${employeeId}`, error);
      throw new Error('Failed to create onboarding task in Rippling');
    }
  }

  async triggerOnboarding(employeeId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/employees/${employeeId}/onboarding/start`,
        {},
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Triggered onboarding for Rippling employee: ${employeeId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger onboarding for Rippling employee ${employeeId}`, error);
      throw new Error('Failed to trigger onboarding in Rippling');
    }
  }
}
