import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IntegrationProvider } from '../../database/entities';
import { IntegrationConfigService } from './integration-config.service';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: Date;
  tokenType?: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly configs: Map<IntegrationProvider, OAuthConfig>;

  constructor(
    private configService: ConfigService,
    private integrationConfigService: IntegrationConfigService,
  ) {
    this.configs = new Map();
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // Google Calendar OAuth
    this.configs.set(IntegrationProvider.GOOGLE_CALENDAR, {
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    // Microsoft Calendar OAuth
    this.configs.set(IntegrationProvider.MICROSOFT_CALENDAR, {
      clientId: this.configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: this.configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('MICROSOFT_REDIRECT_URI'),
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Calendars.ReadWrite', 'offline_access'],
    });

    // LinkedIn OAuth
    this.configs.set(IntegrationProvider.LINKEDIN, {
      clientId: this.configService.get<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: this.configService.get<string>('LINKEDIN_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('LINKEDIN_REDIRECT_URI'),
      authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['r_organization_social', 'w_organization_social'],
    });

    // Gmail OAuth
    this.configs.set(IntegrationProvider.GMAIL, {
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });

    // Outlook OAuth
    this.configs.set(IntegrationProvider.OUTLOOK, {
      clientId: this.configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: this.configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('MICROSOFT_REDIRECT_URI'),
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Mail.Send', 'Mail.Read', 'offline_access'],
    });
  }

  getAuthorizationUrl(
    provider: IntegrationProvider,
    state?: string,
  ): string {
    const config = this.configs.get(provider);
    if (!config) {
      throw new BadRequestException(`OAuth not supported for provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    if (state) {
      params.append('state', state);
    }

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    provider: IntegrationProvider,
    code: string,
  ): Promise<OAuthTokens> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new BadRequestException(`OAuth not supported for provider: ${provider}`);
    }

    try {
      const response = await axios.post(
        config.tokenUrl,
        {
          grant_type: 'authorization_code',
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const tokens: OAuthTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };

      if (tokens.expiresIn) {
        tokens.expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      }

      this.logger.log(`Successfully exchanged code for tokens for provider: ${provider}`);
      return tokens;
    } catch (error) {
      this.logger.error(`Failed to exchange code for tokens: ${provider}`, error);
      throw new BadRequestException('Failed to authenticate with provider');
    }
  }

  async refreshAccessToken(
    provider: IntegrationProvider,
    refreshToken: string,
  ): Promise<OAuthTokens> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new BadRequestException(`OAuth not supported for provider: ${provider}`);
    }

    try {
      const response = await axios.post(
        config.tokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const tokens: OAuthTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };

      if (tokens.expiresIn) {
        tokens.expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      }

      this.logger.log(`Successfully refreshed access token for provider: ${provider}`);
      return tokens;
    } catch (error) {
      this.logger.error(`Failed to refresh access token: ${provider}`, error);
      throw new BadRequestException('Failed to refresh access token');
    }
  }

  async handleCallback(
    integrationId: string,
    organizationId: string,
    code: string,
  ): Promise<void> {
    const integration = await this.integrationConfigService.findOne(
      integrationId,
      organizationId,
    );

    const tokens = await this.exchangeCodeForTokens(integration.provider, code);

    await this.integrationConfigService.updateCredentials(
      integrationId,
      organizationId,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt?.toISOString(),
        tokenType: tokens.tokenType,
      },
    );

    await this.integrationConfigService.updateStatus(
      integrationId,
      organizationId,
      'active' as any,
    );

    this.logger.log(`OAuth callback handled for integration ${integrationId}`);
  }

  async ensureValidToken(
    integrationId: string,
    organizationId: string,
  ): Promise<string> {
    const integration = await this.integrationConfigService.findOne(
      integrationId,
      organizationId,
    );

    const credentials = await this.integrationConfigService.getCredentials(
      integrationId,
      organizationId,
    );

    // Check if token is expired
    if (credentials.expiresAt) {
      const expiresAt = new Date(credentials.expiresAt);
      const now = new Date();

      // Refresh if expired or expiring in next 5 minutes
      if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        this.logger.log(`Token expired or expiring soon, refreshing for integration ${integrationId}`);

        const tokens = await this.refreshAccessToken(
          integration.provider,
          credentials.refreshToken,
        );

        await this.integrationConfigService.updateCredentials(
          integrationId,
          organizationId,
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt?.toISOString(),
            tokenType: tokens.tokenType,
          },
        );

        return tokens.accessToken;
      }
    }

    return credentials.accessToken;
  }
}
