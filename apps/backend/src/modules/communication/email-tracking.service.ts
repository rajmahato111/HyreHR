import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication, CommunicationStatus } from '../../database/entities';

@Injectable()
export class EmailTrackingService {
  private readonly logger = new Logger(EmailTrackingService.name);

  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
  ) {}

  /**
   * Generate tracking pixel URL for email opens
   */
  generateTrackingPixel(communicationId: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/communication/track/open/${communicationId}`;
  }

  /**
   * Generate tracked link for click tracking
   */
  generateTrackedLink(communicationId: string, originalUrl: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${baseUrl}/api/v1/communication/track/click/${communicationId}?url=${encodedUrl}`;
  }

  /**
   * Inject tracking pixel into email body
   */
  injectTrackingPixel(emailBody: string, communicationId: string): string {
    const trackingPixelUrl = this.generateTrackingPixel(communicationId);
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`;
    
    // Insert tracking pixel before closing body tag
    if (emailBody.includes('</body>')) {
      return emailBody.replace('</body>', `${trackingPixel}</body>`);
    }
    
    // If no body tag, append at the end
    return `${emailBody}${trackingPixel}`;
  }

  /**
   * Replace links in email body with tracked links
   */
  injectTrackedLinks(emailBody: string, communicationId: string): string {
    // Regular expression to find all href attributes
    const linkRegex = /href=["']([^"']+)["']/gi;
    
    return emailBody.replace(linkRegex, (match, url) => {
      // Skip tracking pixel and mailto links
      if (url.includes('/track/') || url.startsWith('mailto:')) {
        return match;
      }
      
      const trackedUrl = this.generateTrackedLink(communicationId, url);
      return `href="${trackedUrl}"`;
    });
  }

  /**
   * Record email open event
   */
  async recordEmailOpen(communicationId: string): Promise<void> {
    try {
      const communication = await this.communicationRepository.findOne({
        where: { id: communicationId },
      });

      if (!communication) {
        this.logger.warn(`Communication not found: ${communicationId}`);
        return;
      }

      // Only record the first open
      if (!communication.openedAt) {
        communication.openedAt = new Date();
        communication.status = CommunicationStatus.OPENED;
        await this.communicationRepository.save(communication);
        
        this.logger.log(`Email opened: ${communicationId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to record email open: ${error.message}`);
    }
  }

  /**
   * Record email click event
   */
  async recordEmailClick(communicationId: string, url: string): Promise<void> {
    try {
      const communication = await this.communicationRepository.findOne({
        where: { id: communicationId },
      });

      if (!communication) {
        this.logger.warn(`Communication not found: ${communicationId}`);
        return;
      }

      // Record the first click
      if (!communication.clickedAt) {
        communication.clickedAt = new Date();
        communication.status = CommunicationStatus.CLICKED;
        await this.communicationRepository.save(communication);
        
        this.logger.log(`Email link clicked: ${communicationId} - ${url}`);
      }

      // Store click data in metadata
      const clicks = communication.metadata?.clicks || [];
      clicks.push({
        url,
        timestamp: new Date(),
      });
      
      communication.metadata = {
        ...communication.metadata,
        clicks,
      };
      
      await this.communicationRepository.save(communication);
    } catch (error) {
      this.logger.error(`Failed to record email click: ${error.message}`);
    }
  }

  /**
   * Get email tracking statistics
   */
  async getTrackingStats(communicationId: string): Promise<any> {
    try {
      const communication = await this.communicationRepository.findOne({
        where: { id: communicationId },
      });

      if (!communication) {
        return null;
      }

      return {
        sent: !!communication.sentAt,
        sentAt: communication.sentAt,
        delivered: !!communication.deliveredAt,
        deliveredAt: communication.deliveredAt,
        opened: !!communication.openedAt,
        openedAt: communication.openedAt,
        clicked: !!communication.clickedAt,
        clickedAt: communication.clickedAt,
        clicks: communication.metadata?.clicks || [],
        status: communication.status,
      };
    } catch (error) {
      this.logger.error(`Failed to get tracking stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Get aggregate tracking statistics for multiple emails
   */
  async getAggregateStats(communicationIds: string[]): Promise<any> {
    try {
      const communications = await this.communicationRepository
        .createQueryBuilder('comm')
        .where('comm.id IN (:...ids)', { ids: communicationIds })
        .getMany();

      const total = communications.length;
      const sent = communications.filter((c) => c.sentAt).length;
      const delivered = communications.filter((c) => c.deliveredAt).length;
      const opened = communications.filter((c) => c.openedAt).length;
      const clicked = communications.filter((c) => c.clickedAt).length;

      return {
        total,
        sent,
        delivered,
        opened,
        clicked,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
        clickToOpenRate: opened > 0 ? (clicked / opened) * 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get aggregate stats: ${error.message}`);
      return null;
    }
  }
}
