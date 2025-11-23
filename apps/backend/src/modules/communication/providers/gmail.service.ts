import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  threadId?: string;
  inReplyTo?: string;
}

export interface EmailTrackingInfo {
  messageId: string;
  threadId: string;
  labelIds: string[];
}

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Set OAuth2 credentials for a user
   */
  setCredentials(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Send an email via Gmail API
   */
  async sendEmail(message: EmailMessage): Promise<EmailTrackingInfo> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Create email message in RFC 2822 format
      const emailLines = [];
      emailLines.push(`To: ${message.to.join(', ')}`);
      
      if (message.cc && message.cc.length > 0) {
        emailLines.push(`Cc: ${message.cc.join(', ')}`);
      }
      
      if (message.bcc && message.bcc.length > 0) {
        emailLines.push(`Bcc: ${message.bcc.join(', ')}`);
      }
      
      emailLines.push(`Subject: ${message.subject}`);
      emailLines.push('Content-Type: text/html; charset=utf-8');
      emailLines.push('MIME-Version: 1.0');
      
      if (message.inReplyTo) {
        emailLines.push(`In-Reply-To: ${message.inReplyTo}`);
        emailLines.push(`References: ${message.inReplyTo}`);
      }
      
      emailLines.push('');
      emailLines.push(message.body);

      const email = emailLines.join('\r\n');
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const requestBody: any = {
        raw: encodedEmail,
      };

      if (message.threadId) {
        requestBody.threadId = message.threadId;
      }

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody,
      });

      this.logger.log(`Email sent successfully: ${response.data.id}`);

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
        labelIds: response.data.labelIds || [],
      };
    } catch (error) {
      this.logger.error(`Failed to send email via Gmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails(
    maxResults: number = 10,
    query?: string,
  ): Promise<any[]> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: query,
      });

      if (!response.data.messages) {
        return [];
      }

      // Fetch full message details
      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });
          return this.parseGmailMessage(details.data);
        }),
      );

      return messages;
    } catch (error) {
      this.logger.error(`Failed to fetch emails from Gmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get email thread
   */
  async getThread(threadId: string): Promise<any> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      return {
        id: response.data.id,
        messages: response.data.messages.map((msg) =>
          this.parseGmailMessage(msg),
        ),
      };
    } catch (error) {
      this.logger.error(`Failed to get thread from Gmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track email opens using Gmail API
   */
  async trackEmailOpen(messageId: string): Promise<boolean> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata',
        metadataHeaders: ['X-Gmail-Labels'],
      });

      // Check if message has been read
      const labels = response.data.labelIds || [];
      return !labels.includes('UNREAD');
    } catch (error) {
      this.logger.error(`Failed to track email open: ${error.message}`);
      return false;
    }
  }

  /**
   * Parse Gmail message to standard format
   */
  private parseGmailMessage(message: any): any {
    const headers = message.payload?.headers || [];
    
    const getHeader = (name: string) => {
      const header = headers.find(
        (h) => h.name.toLowerCase() === name.toLowerCase(),
      );
      return header?.value || '';
    };

    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      const textPart = message.payload.parts.find(
        (part) => part.mimeType === 'text/html' || part.mimeType === 'text/plain',
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      subject: getHeader('Subject'),
      body,
      date: getHeader('Date'),
      inReplyTo: getHeader('In-Reply-To'),
      references: getHeader('References'),
      labelIds: message.labelIds || [],
    };
  }

  /**
   * Setup Gmail webhook for push notifications
   */
  async setupPushNotifications(topicName: string): Promise<void> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName,
          labelIds: ['INBOX'],
        },
      });

      this.logger.log('Gmail push notifications setup successfully');
    } catch (error) {
      this.logger.error(
        `Failed to setup Gmail push notifications: ${error.message}`,
      );
      throw error;
    }
  }
}
