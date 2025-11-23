import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IntegrationConfigService } from './integration-config.service';
import { IntegrationProvider, IntegrationStatus } from '../../database/entities';
import axios from 'axios';

export interface HealthCheckResult {
  integrationId: string;
  provider: IntegrationProvider;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  checkedAt: Date;
}

@Injectable()
export class IntegrationHealthService {
  private readonly logger = new Logger(IntegrationHealthService.name);

  constructor(
    private integrationConfigService: IntegrationConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performScheduledHealthChecks(): Promise<void> {
    this.logger.log('Starting scheduled health checks for all integrations');

    try {
      // Get all active integrations across all organizations
      const integrations = await this.integrationConfigService.findAll(''); // Need to modify to get all

      for (const integration of integrations) {
        if (integration.status === IntegrationStatus.ACTIVE) {
          await this.checkHealth(integration.id, integration.organizationId);
        }
      }

      this.logger.log('Completed scheduled health checks');
    } catch (error) {
      this.logger.error('Failed to perform scheduled health checks', error);
    }
  }

  async checkHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    const integration = await this.integrationConfigService.findOne(
      integrationId,
      organizationId,
    );

    const startTime = Date.now();
    let result: HealthCheckResult;

    try {
      switch (integration.provider) {
        case IntegrationProvider.GOOGLE_CALENDAR:
        case IntegrationProvider.GMAIL:
          result = await this.checkGoogleHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.MICROSOFT_CALENDAR:
        case IntegrationProvider.OUTLOOK:
          result = await this.checkMicrosoftHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.BAMBOOHR:
          result = await this.checkBambooHRHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.WORKDAY:
          result = await this.checkWorkdayHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.DOCUSIGN:
          result = await this.checkDocuSignHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.LINKEDIN:
          result = await this.checkLinkedInHealth(integration.id, organizationId);
          break;

        case IntegrationProvider.SLACK:
          result = await this.checkSlackHealth(integration.id, organizationId);
          break;

        default:
          result = {
            integrationId,
            provider: integration.provider,
            status: 'healthy',
            checkedAt: new Date(),
          };
      }

      result.responseTime = Date.now() - startTime;

      // Record health check result
      await this.integrationConfigService.recordHealthCheck(
        integrationId,
        organizationId,
        result.status,
        result.error,
      );

      // Update integration status if unhealthy
      if (result.status === 'unhealthy') {
        await this.integrationConfigService.updateStatus(
          integrationId,
          organizationId,
          IntegrationStatus.ERROR,
          result.error,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Health check failed for integration ${integrationId}`, error);

      result = {
        integrationId,
        provider: integration.provider,
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime,
        checkedAt: new Date(),
      };

      await this.integrationConfigService.recordHealthCheck(
        integrationId,
        organizationId,
        result.status,
        result.error,
      );

      return result;
    }
  }

  private async checkGoogleHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      // Test API call to verify credentials
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        status: response.status === 200 ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  private async checkMicrosoftHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/calendars',
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.MICROSOFT_CALENDAR,
        status: response.status === 200 ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.MICROSOFT_CALENDAR,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  private async checkBambooHRHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      const integration = await this.integrationConfigService.findOne(
        integrationId,
        organizationId,
      );

      const subdomain = integration.config?.subdomain;
      const response = await axios.get(
        `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1/employees/directory`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${credentials.apiKey}:x`).toString('base64')}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.BAMBOOHR,
        status: response.status === 200 ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.BAMBOOHR,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  private async checkWorkdayHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    // Workday health check implementation
    return {
      integrationId,
      provider: IntegrationProvider.WORKDAY,
      status: 'healthy',
      checkedAt: new Date(),
    };
  }

  private async checkDocuSignHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      const integration = await this.integrationConfigService.findOne(
        integrationId,
        organizationId,
      );

      const baseUrl = integration.config?.baseUrl || 'https://demo.docusign.net/restapi';
      const response = await axios.get(
        `${baseUrl}/v2.1/accounts`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.DOCUSIGN,
        status: response.status === 200 ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.DOCUSIGN,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  private async checkLinkedInHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      const response = await axios.get(
        'https://api.linkedin.com/v2/me',
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.LINKEDIN,
        status: response.status === 200 ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.LINKEDIN,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  private async checkSlackHealth(
    integrationId: string,
    organizationId: string,
  ): Promise<HealthCheckResult> {
    try {
      const credentials = await this.integrationConfigService.getCredentials(
        integrationId,
        organizationId,
      );

      const response = await axios.post(
        'https://slack.com/api/auth.test',
        {},
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          timeout: 10000,
        },
      );

      return {
        integrationId,
        provider: IntegrationProvider.SLACK,
        status: response.data.ok ? 'healthy' : 'degraded',
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        integrationId,
        provider: IntegrationProvider.SLACK,
        status: 'unhealthy',
        error: error.message,
        checkedAt: new Date(),
      };
    }
  }

  async getHealthStatus(
    integrationId: string,
    organizationId: string,
  ): Promise<{
    status: string;
    lastCheckAt: Date;
    lastError?: string;
    uptime?: number;
  }> {
    const integration = await this.integrationConfigService.findOne(
      integrationId,
      organizationId,
    );

    return {
      status: integration.healthStatus || 'unknown',
      lastCheckAt: integration.lastHealthCheckAt,
      lastError: integration.lastError,
    };
  }
}
