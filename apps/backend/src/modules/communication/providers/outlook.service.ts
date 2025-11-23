import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { EmailMessage, EmailTrackingInfo } from './gmail.service';

@Injectable()
export class OutlookService {
  private readonly logger = new Logger(OutlookService.name);
  private client: Client;

  /**
   * Set access token for Microsoft Graph API
   */
  setAccessToken(accessToken: string): void {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Send an email via Microsoft Graph API
   */
  async sendEmail(message: EmailMessage): Promise<EmailTrackingInfo> {
    try {
      const emailPayload = {
        message: {
          subject: message.subject,
          body: {
            contentType: 'HTML',
            content: message.body,
          },
          toRecipients: message.to.map((email) => ({
            emailAddress: { address: email },
          })),
          ccRecipients: message.cc?.map((email) => ({
            emailAddress: { address: email },
          })) || [],
          bccRecipients: message.bcc?.map((email) => ({
            emailAddress: { address: email },
          })) || [],
        },
        saveToSentItems: true,
      };

      const response = await this.client
        .api('/me/sendMail')
        .post(emailPayload);

      this.logger.log('Email sent successfully via Outlook');

      // Note: Microsoft Graph sendMail doesn't return message ID directly
      // We need to fetch it from sent items
      const sentMessage = await this.getLastSentMessage();

      return {
        messageId: sentMessage?.id || '',
        threadId: sentMessage?.conversationId || '',
        labelIds: [],
      };
    } catch (error) {
      this.logger.error(`Failed to send email via Outlook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch emails from Outlook
   */
  async fetchEmails(
    maxResults: number = 10,
    filter?: string,
  ): Promise<any[]> {
    try {
      let request = this.client
        .api('/me/messages')
        .top(maxResults)
        .orderby('receivedDateTime DESC');

      if (filter) {
        request = request.filter(filter);
      }

      const response = await request.get();

      return response.value.map((message) => this.parseOutlookMessage(message));
    } catch (error) {
      this.logger.error(`Failed to fetch emails from Outlook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get email thread (conversation)
   */
  async getThread(conversationId: string): Promise<any> {
    try {
      const response = await this.client
        .api('/me/messages')
        .filter(`conversationId eq '${conversationId}'`)
        .orderby('receivedDateTime ASC')
        .get();

      return {
        id: conversationId,
        messages: response.value.map((msg) => this.parseOutlookMessage(msg)),
      };
    } catch (error) {
      this.logger.error(`Failed to get thread from Outlook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track email opens using read receipt
   */
  async trackEmailOpen(messageId: string): Promise<boolean> {
    try {
      const message = await this.client
        .api(`/me/messages/${messageId}`)
        .select('isRead')
        .get();

      return message.isRead || false;
    } catch (error) {
      this.logger.error(`Failed to track email open: ${error.message}`);
      return false;
    }
  }

  /**
   * Get last sent message
   */
  private async getLastSentMessage(): Promise<any> {
    try {
      const response = await this.client
        .api('/me/mailFolders/SentItems/messages')
        .top(1)
        .orderby('sentDateTime DESC')
        .get();

      return response.value[0];
    } catch (error) {
      this.logger.error(`Failed to get last sent message: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse Outlook message to standard format
   */
  private parseOutlookMessage(message: any): any {
    return {
      id: message.id,
      threadId: message.conversationId,
      from: message.from?.emailAddress?.address || '',
      to: message.toRecipients?.map((r) => r.emailAddress.address).join(', ') || '',
      cc: message.ccRecipients?.map((r) => r.emailAddress.address).join(', ') || '',
      subject: message.subject || '',
      body: message.body?.content || '',
      date: message.receivedDateTime,
      inReplyTo: message.internetMessageId,
      isRead: message.isRead,
    };
  }

  /**
   * Setup Outlook webhook for push notifications
   */
  async setupPushNotifications(notificationUrl: string): Promise<void> {
    try {
      const subscription = {
        changeType: 'created,updated',
        notificationUrl,
        resource: '/me/messages',
        expirationDateTime: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 3 days
        clientState: 'recruiting-platform-secret',
      };

      await this.client.api('/subscriptions').post(subscription);

      this.logger.log('Outlook push notifications setup successfully');
    } catch (error) {
      this.logger.error(
        `Failed to setup Outlook push notifications: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Reply to an email
   */
  async replyToEmail(
    messageId: string,
    replyBody: string,
  ): Promise<EmailTrackingInfo> {
    try {
      const replyPayload = {
        message: {
          body: {
            contentType: 'HTML',
            content: replyBody,
          },
        },
      };

      await this.client
        .api(`/me/messages/${messageId}/reply`)
        .post(replyPayload);

      this.logger.log('Reply sent successfully via Outlook');

      // Fetch the sent reply
      const sentMessage = await this.getLastSentMessage();

      return {
        messageId: sentMessage?.id || '',
        threadId: sentMessage?.conversationId || '',
        labelIds: [],
      };
    } catch (error) {
      this.logger.error(`Failed to reply to email via Outlook: ${error.message}`);
      throw error;
    }
  }
}
