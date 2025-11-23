import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Offer } from '../../../database/entities';

export interface BambooHREmployee {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  jobTitle: string;
  department?: string;
  location?: string;
  hireDate: string;
  employmentStatus: string;
  payRate?: string;
  payType?: string;
  payPeriod?: string;
}

@Injectable()
export class BambooHRService {
  private readonly logger = new Logger(BambooHRService.name);
  private apiKey: string;
  private subdomain: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BAMBOOHR_API_KEY');
    this.subdomain = this.configService.get<string>('BAMBOOHR_SUBDOMAIN');
    this.baseUrl = `https://api.bamboohr.com/api/gateway.php/${this.subdomain}/v1`;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.apiKey}:x`).toString('base64')}`;
  }

  async createEmployee(offer: Offer): Promise<string> {
    try {
      const employeeData: BambooHREmployee = {
        firstName: offer.application.candidate.firstName,
        lastName: offer.application.candidate.lastName,
        email: offer.application.candidate.email,
        mobilePhone: offer.application.candidate.phone,
        jobTitle: offer.jobTitle,
        department: offer.application.job.department?.name,
        location: offer.application.job.locations?.[0]?.name,
        hireDate: offer.startDate ? offer.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        employmentStatus: 'Active',
        payRate: offer.salary.toString(),
        payType: 'Salary',
        payPeriod: 'Year',
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

      const employeeId = response.headers.location?.split('/').pop();
      this.logger.log(`Created BambooHR employee: ${employeeId}`);

      return employeeId;
    } catch (error) {
      this.logger.error('Failed to create BambooHR employee', error);
      throw new Error('Failed to create employee in BambooHR');
    }
  }

  async updateEmployee(employeeId: string, updates: Partial<BambooHREmployee>): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/employees/${employeeId}`,
        updates,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Updated BambooHR employee: ${employeeId}`);
    } catch (error) {
      this.logger.error(`Failed to update BambooHR employee ${employeeId}`, error);
      throw new Error('Failed to update employee in BambooHR');
    }
  }

  async getEmployee(employeeId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/employees/${employeeId}`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            Accept: 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get BambooHR employee ${employeeId}`, error);
      throw new Error('Failed to get employee from BambooHR');
    }
  }

  async uploadDocument(employeeId: string, fileName: string, fileContent: Buffer, category: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(fileContent)]), fileName);
      formData.append('category', category);

      await axios.post(
        `${this.baseUrl}/employees/${employeeId}/files`,
        formData,
        {
          headers: {
            Authorization: this.getAuthHeader(),
          },
        },
      );

      this.logger.log(`Uploaded document to BambooHR employee ${employeeId}`);
    } catch (error) {
      this.logger.error(`Failed to upload document to BambooHR employee ${employeeId}`, error);
      throw new Error('Failed to upload document to BambooHR');
    }
  }
}
