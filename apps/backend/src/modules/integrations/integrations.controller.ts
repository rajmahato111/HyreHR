import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { IntegrationConfigService } from './integration-config.service';
import { OAuthService } from './oauth.service';
import { WebhookService } from './webhook.service';
import { IntegrationHealthService } from './integration-health.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { IntegrationProvider, WebhookEvent } from '../../database/entities';

@Controller('integrations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController {
  constructor(
    private integrationConfigService: IntegrationConfigService,
    private oauthService: OAuthService,
    private webhookService: WebhookService,
    private healthService: IntegrationHealthService,
  ) {}

  // Integration Configuration Endpoints

  @Post()
  @RequirePermissions('integrations:create')
  async createIntegration(
    @Request() req: any,
    @Body() createDto: CreateIntegrationDto,
  ) {
    return this.integrationConfigService.create(
      req.user.organizationId,
      createDto,
    );
  }

  @Get()
  @RequirePermissions('integrations:read')
  async getIntegrations(@Request() req: any) {
    return this.integrationConfigService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('integrations:read')
  async getIntegration(@Request() req: any, @Param('id') id: string) {
    return this.integrationConfigService.findOne(id, req.user.organizationId);
  }

  @Get('provider/:provider')
  @RequirePermissions('integrations:read')
  async getIntegrationsByProvider(
    @Request() req: any,
    @Param('provider') provider: string,
  ) {
    return this.integrationConfigService.findByProvider(
      req.user.organizationId,
      provider,
    );
  }

  @Put(':id')
  @RequirePermissions('integrations:update')
  async updateIntegration(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    return this.integrationConfigService.update(
      id,
      req.user.organizationId,
      updateDto,
    );
  }

  @Delete(':id')
  @RequirePermissions('integrations:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIntegration(@Request() req: any, @Param('id') id: string) {
    await this.integrationConfigService.delete(id, req.user.organizationId);
  }

  // OAuth Endpoints

  @Get(':id/oauth/authorize')
  @RequirePermissions('integrations:update')
  async getOAuthUrl(
    @Request() req: any,
    @Param('id') id: string,
    @Query('state') state?: string,
  ) {
    const integration = await this.integrationConfigService.findOne(
      id,
      req.user.organizationId,
    );

    const authUrl = this.oauthService.getAuthorizationUrl(
      integration.provider,
      state || id,
    );

    return { authUrl };
  }

  @Post(':id/oauth/callback')
  @RequirePermissions('integrations:update')
  async handleOAuthCallback(
    @Request() req: any,
    @Param('id') id: string,
    @Body() callbackDto: OAuthCallbackDto,
  ) {
    if (callbackDto.error) {
      return {
        success: false,
        error: callbackDto.error,
        errorDescription: callbackDto.error_description,
      };
    }

    await this.oauthService.handleCallback(
      id,
      req.user.organizationId,
      callbackDto.code,
    );

    return {
      success: true,
      message: 'OAuth authentication successful',
    };
  }

  @Post(':id/oauth/refresh')
  @RequirePermissions('integrations:update')
  async refreshOAuthToken(@Request() req: any, @Param('id') id: string) {
    const accessToken = await this.oauthService.ensureValidToken(
      id,
      req.user.organizationId,
    );

    return {
      success: true,
      message: 'Token refreshed successfully',
    };
  }

  // Webhook Endpoints

  @Post('webhooks')
  @RequirePermissions('integrations:create')
  async createWebhook(@Request() req: any, @Body() createDto: CreateWebhookDto) {
    return this.webhookService.create(req.user.organizationId, createDto);
  }

  @Get('webhooks')
  @RequirePermissions('integrations:read')
  async getWebhooks(@Request() req: any) {
    return this.webhookService.findAll(req.user.organizationId);
  }

  @Get('webhooks/:id')
  @RequirePermissions('integrations:read')
  async getWebhook(@Request() req: any, @Param('id') id: string) {
    return this.webhookService.findOne(id, req.user.organizationId);
  }

  @Put('webhooks/:id')
  @RequirePermissions('integrations:update')
  async updateWebhook(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateWebhookDto,
  ) {
    return this.webhookService.update(id, req.user.organizationId, updateDto);
  }

  @Delete('webhooks/:id')
  @RequirePermissions('integrations:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(@Request() req: any, @Param('id') id: string) {
    await this.webhookService.delete(id, req.user.organizationId);
  }

  @Post('webhooks/:id/test')
  @RequirePermissions('integrations:update')
  async testWebhook(@Request() req: any, @Param('id') id: string) {
    return this.webhookService.testWebhook(id, req.user.organizationId);
  }

  @Get('webhooks/:id/logs')
  @RequirePermissions('integrations:read')
  async getWebhookLogs(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.webhookService.getLogs(
      id,
      req.user.organizationId,
      limit ? parseInt(limit.toString()) : 100,
    );
  }

  @Get('webhooks/:id/stats')
  @RequirePermissions('integrations:read')
  async getWebhookStats(@Request() req: any, @Param('id') id: string) {
    return this.webhookService.getLogStats(id, req.user.organizationId);
  }

  // Health Monitoring Endpoints

  @Get(':id/health')
  @RequirePermissions('integrations:read')
  async getHealthStatus(@Request() req: any, @Param('id') id: string) {
    return this.healthService.getHealthStatus(id, req.user.organizationId);
  }

  @Post(':id/health/check')
  @RequirePermissions('integrations:update')
  async performHealthCheck(@Request() req: any, @Param('id') id: string) {
    return this.healthService.checkHealth(id, req.user.organizationId);
  }

  // Webhook Trigger Endpoint (for internal use)
  @Post('webhooks/trigger')
  @RequirePermissions('integrations:update')
  async triggerWebhook(
    @Request() req: any,
    @Body() body: { event: WebhookEvent; payload: Record<string, any> },
  ) {
    await this.webhookService.trigger(
      req.user.organizationId,
      body.event,
      body.payload,
    );

    return {
      success: true,
      message: 'Webhook triggered successfully',
    };
  }
}
