import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Offer } from '../../../database/entities';

export interface WorkdayWorker {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  employmentData: {
    jobTitle: string;
    department?: string;
    location?: string;
    hireDate: string;
    employmentType: string;
  };
  compensationData: {
    baseSalary: number;
    currency: string;
    bonus?: number;
  };
}

@Injectable()
export class WorkdayService {
  private readonly logger = new Logger(WorkdayService.name);
  private username: string;
  private password: string;
  private tenant: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.username = this.configService.get<string>('WORKDAY_USERNAME');
    this.password = this.configService.get<string>('WORKDAY_PASSWORD');
    this.tenant = this.configService.get<string>('WORKDAY_TENANT');
    this.baseUrl = `https://wd2-impl-services1.workday.com/ccx/service/${this.tenant}`;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
  }

  async createWorker(offer: Offer): Promise<string> {
    try {
      const workerData: WorkdayWorker = {
        personalData: {
          firstName: offer.application.candidate.firstName,
          lastName: offer.application.candidate.lastName,
          email: offer.application.candidate.email,
          phone: offer.application.candidate.phone,
        },
        employmentData: {
          jobTitle: offer.jobTitle,
          department: offer.application.job.department?.name,
          location: offer.application.job.locations?.[0]?.name,
          hireDate: offer.startDate ? offer.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          employmentType: offer.application.job.employmentType,
        },
        compensationData: {
          baseSalary: offer.salary,
          currency: offer.currency,
          bonus: offer.bonus,
        },
      };

      // Workday uses SOAP/XML API
      const soapRequest = this.buildHireEmployeeRequest(workerData);

      const response = await axios.post(
        `${this.baseUrl}/Human_Resources`,
        soapRequest,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'text/xml',
          },
        },
      );

      // Parse SOAP response to get worker ID
      const workerId = this.parseWorkerIdFromResponse(response.data);
      this.logger.log(`Created Workday worker: ${workerId}`);

      return workerId;
    } catch (error) {
      this.logger.error('Failed to create Workday worker', error);
      throw new Error('Failed to create worker in Workday');
    }
  }

  private buildHireEmployeeRequest(workerData: WorkdayWorker): string {
    // Simplified SOAP request - in production, use a proper SOAP library
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bsvc="urn:com.workday/bsvc">
  <soapenv:Header/>
  <soapenv:Body>
    <bsvc:Hire_Employee_Request>
      <bsvc:Business_Process_Parameters>
        <bsvc:Auto_Complete>true</bsvc:Auto_Complete>
      </bsvc:Business_Process_Parameters>
      <bsvc:Hire_Employee_Data>
        <bsvc:Applicant_Reference>
          <bsvc:ID bsvc:type="Applicant_ID">${workerData.personalData.email}</bsvc:ID>
        </bsvc:Applicant_Reference>
        <bsvc:Hire_Date>${workerData.employmentData.hireDate}</bsvc:Hire_Date>
        <bsvc:Position_Details>
          <bsvc:Job_Posting_Title>${workerData.employmentData.jobTitle}</bsvc:Job_Posting_Title>
        </bsvc:Position_Details>
        <bsvc:Employee_Type_Reference>
          <bsvc:ID bsvc:type="Employee_Type_ID">Regular</bsvc:ID>
        </bsvc:Employee_Type_Reference>
        <bsvc:Proposed_Compensation_Data>
          <bsvc:Compensation_Amount>${workerData.compensationData.baseSalary}</bsvc:Compensation_Amount>
          <bsvc:Currency_Reference>
            <bsvc:ID bsvc:type="Currency_ID">${workerData.compensationData.currency}</bsvc:ID>
          </bsvc:Currency_Reference>
        </bsvc:Proposed_Compensation_Data>
      </bsvc:Hire_Employee_Data>
    </bsvc:Hire_Employee_Request>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private parseWorkerIdFromResponse(xmlResponse: string): string {
    // Simplified XML parsing - in production, use a proper XML parser
    const match = xmlResponse.match(/<wd:Worker_Reference>.*?<wd:ID.*?>(.*?)<\/wd:ID>/);
    return match ? match[1] : 'unknown';
  }

  async updateWorker(workerId: string, updates: Partial<WorkdayWorker>): Promise<void> {
    try {
      // Build update request
      const soapRequest = this.buildUpdateWorkerRequest(workerId, updates);

      await axios.post(
        `${this.baseUrl}/Human_Resources`,
        soapRequest,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'text/xml',
          },
        },
      );

      this.logger.log(`Updated Workday worker: ${workerId}`);
    } catch (error) {
      this.logger.error(`Failed to update Workday worker ${workerId}`, error);
      throw new Error('Failed to update worker in Workday');
    }
  }

  private buildUpdateWorkerRequest(workerId: string, updates: Partial<WorkdayWorker>): string {
    // Simplified - in production, build proper SOAP request based on updates
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bsvc="urn:com.workday/bsvc">
  <soapenv:Header/>
  <soapenv:Body>
    <bsvc:Change_Job_Request>
      <bsvc:Business_Process_Parameters>
        <bsvc:Auto_Complete>true</bsvc:Auto_Complete>
      </bsvc:Business_Process_Parameters>
      <bsvc:Change_Job_Data>
        <bsvc:Worker_Reference>
          <bsvc:ID bsvc:type="Worker_ID">${workerId}</bsvc:ID>
        </bsvc:Worker_Reference>
      </bsvc:Change_Job_Data>
    </bsvc:Change_Job_Request>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  async getWorker(workerId: string): Promise<any> {
    try {
      const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bsvc="urn:com.workday/bsvc">
  <soapenv:Header/>
  <soapenv:Body>
    <bsvc:Get_Workers_Request>
      <bsvc:Request_References>
        <bsvc:Worker_Reference>
          <bsvc:ID bsvc:type="Worker_ID">${workerId}</bsvc:ID>
        </bsvc:Worker_Reference>
      </bsvc:Request_References>
    </bsvc:Get_Workers_Request>
  </soapenv:Body>
</soapenv:Envelope>`;

      const response = await axios.post(
        `${this.baseUrl}/Human_Resources`,
        soapRequest,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'text/xml',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Workday worker ${workerId}`, error);
      throw new Error('Failed to get worker from Workday');
    }
  }
}
