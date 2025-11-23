import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class CDNService {
  private readonly logger = new Logger(CDNService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnDomain: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get('AWS_S3_BUCKET') || 'recruiting-platform';
    this.cdnDomain = this.configService.get('CDN_DOMAIN') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload file to S3 with CDN-friendly settings
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    cacheControl = 'public, max-age=31536000', // 1 year
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: cacheControl,
        // Enable server-side encryption
        ServerSideEncryption: 'AES256',
      });

      await this.s3Client.send(command);

      return this.getCDNUrl(key);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}`, error);
      throw error;
    }
  }

  /**
   * Upload resume with appropriate cache settings
   */
  async uploadResume(
    candidateId: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const key = `resumes/${candidateId}/${Date.now()}-${filename}`;
    // Resumes should have shorter cache time as they may be updated
    return this.uploadFile(key, buffer, contentType, 'private, max-age=3600');
  }

  /**
   * Upload avatar with long cache time
   */
  async uploadAvatar(
    userId: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const key = `avatars/${userId}/${Date.now()}.jpg`;
    return this.uploadFile(key, buffer, contentType, 'public, max-age=31536000');
  }

  /**
   * Upload company logo with long cache time
   */
  async uploadLogo(
    organizationId: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const key = `logos/${organizationId}/${Date.now()}.png`;
    return this.uploadFile(key, buffer, contentType, 'public, max-age=31536000');
  }

  /**
   * Get CDN URL for a file
   */
  getCDNUrl(key: string): string {
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }
    // Fallback to S3 URL if CDN not configured
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Generate presigned URL for private files
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}`, error);
      throw error;
    }
  }

  /**
   * Get optimized image URL with CloudFront transformations
   * (requires CloudFront with Lambda@Edge or CloudFront Functions)
   */
  getOptimizedImageUrl(
    key: string,
    width?: number,
    height?: number,
    format?: 'webp' | 'jpeg' | 'png',
  ): string {
    const baseUrl = this.getCDNUrl(key);
    const params = new URLSearchParams();

    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (format) params.append('f', format);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Set cache headers for static assets
   */
  getCacheHeaders(assetType: 'static' | 'dynamic' | 'private'): Record<string, string> {
    switch (assetType) {
      case 'static':
        // Long cache for immutable assets (with versioned URLs)
        return {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Expires': new Date(Date.now() + 31536000000).toUTCString(),
        };
      case 'dynamic':
        // Short cache for frequently changing content
        return {
          'Cache-Control': 'public, max-age=300, must-revalidate',
          'Expires': new Date(Date.now() + 300000).toUTCString(),
        };
      case 'private':
        // No cache for private/sensitive content
        return {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        };
      default:
        return {
          'Cache-Control': 'no-cache',
        };
    }
  }
}
