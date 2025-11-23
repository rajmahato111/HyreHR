import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface DocuSignConfig {
  accountId: string;
  userId: string;
  integrationKey: string;
  privateKey: string;
  baseUrl: string;
}

export interface DocuSignRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder: string;
}

export interface DocuSignDocument {
  documentBase64: string;
  name: string;
  fileExtension: string;
  documentId: string;
}

export interface EnvelopeStatus {
  status: string;
  sentDateTime?: string;
  deliveredDateTime?: string;
  signedDateTime?: string;
  completedDateTime?: string;
  declinedDateTime?: string;
  voidedDateTime?: string;
}

@Injectable()
export class DocuSignService {
  private readonly logger = new Logger(DocuSignService.name);
  private config: DocuSignConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      accountId: this.configService.get<string>('DOCUSIGN_ACCOUNT_ID'),
      userId: this.configService.get<string>('DOCUSIGN_USER_ID'),
      integrationKey: this.configService.get<string>('DOCUSIGN_INTEGRATION_KEY'),
      privateKey: this.configService.get<string>('DOCUSIGN_PRIVATE_KEY'),
      baseUrl: this.configService.get<string>('DOCUSIGN_BASE_URL') || 'https://demo.docusign.net/restapi',
    };
  }

  private async getAccessToken(): Promise<string> {
    try {
      // JWT Grant authentication
      const jwt = this.generateJWT();

      const response = await axios.post(
        `${this.config.baseUrl}/oauth/token`,
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get DocuSign access token', error);
      throw new Error('DocuSign authentication failed');
    }
  }

  private generateJWT(): string {
    // In production, use a proper JWT library like jsonwebtoken
    // This is a simplified version
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.config.integrationKey,
      sub: this.config.userId,
      aud: 'account-d.docusign.com',
      iat: now,
      exp: now + 3600,
      scope: 'signature impersonation',
    };

    // In production, sign with private key
    // For now, return a placeholder
    return 'JWT_TOKEN_PLACEHOLDER';
  }

  async createEnvelope(
    document: DocuSignDocument,
    recipients: DocuSignRecipient[],
    emailSubject: string,
    emailMessage?: string,
  ): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const envelopeDefinition = {
        emailSubject,
        emailMessage: emailMessage || 'Please review and sign the offer letter',
        documents: [
          {
            documentBase64: document.documentBase64,
            name: document.name,
            fileExtension: document.fileExtension,
            documentId: document.documentId,
          },
        ],
        recipients: {
          signers: recipients.map((recipient) => ({
            email: recipient.email,
            name: recipient.name,
            recipientId: recipient.recipientId,
            routingOrder: recipient.routingOrder,
            tabs: {
              signHereTabs: [
                {
                  documentId: document.documentId,
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '700',
                },
              ],
              dateSignedTabs: [
                {
                  documentId: document.documentId,
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '750',
                },
              ],
            },
          })),
        },
        status: 'sent',
      };

      const response = await axios.post(
        `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes`,
        envelopeDefinition,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`DocuSign envelope created: ${response.data.envelopeId}`);
      return response.data.envelopeId;
    } catch (error) {
      this.logger.error('Failed to create DocuSign envelope', error);
      throw new Error('Failed to send document for signature');
    }
  }

  async getEnvelopeStatus(envelopeId: string): Promise<EnvelopeStatus> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return {
        status: response.data.status,
        sentDateTime: response.data.sentDateTime,
        deliveredDateTime: response.data.deliveredDateTime,
        signedDateTime: response.data.signedDateTime,
        completedDateTime: response.data.completedDateTime,
        declinedDateTime: response.data.declinedDateTime,
        voidedDateTime: response.data.voidedDateTime,
      };
    } catch (error) {
      this.logger.error(`Failed to get envelope status for ${envelopeId}`, error);
      throw new Error('Failed to get document status');
    }
  }

  async downloadDocument(envelopeId: string, documentId: string): Promise<Buffer> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer',
        },
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download document ${documentId} from envelope ${envelopeId}`, error);
      throw new Error('Failed to download signed document');
    }
  }

  async voidEnvelope(envelopeId: string, reason: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      await axios.put(
        `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`,
        {
          status: 'voided',
          voidedReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`DocuSign envelope voided: ${envelopeId}`);
    } catch (error) {
      this.logger.error(`Failed to void envelope ${envelopeId}`, error);
      throw new Error('Failed to void document');
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    // Handle DocuSign webhook events
    const envelopeId = payload.envelopeId;
    const status = payload.status;

    this.logger.log(`DocuSign webhook received for envelope ${envelopeId}: ${status}`);

    // Process based on status
    switch (status) {
      case 'completed':
        this.logger.log(`Envelope ${envelopeId} completed`);
        // Update offer status in database
        break;
      case 'declined':
        this.logger.log(`Envelope ${envelopeId} declined`);
        // Update offer status in database
        break;
      case 'voided':
        this.logger.log(`Envelope ${envelopeId} voided`);
        // Update offer status in database
        break;
      default:
        this.logger.log(`Envelope ${envelopeId} status: ${status}`);
    }
  }
}
