import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly useLocalStorage: boolean;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'recruiting-platform-resumes');
    this.useLocalStorage = this.configService.get<string>('NODE_ENV') === 'development' && 
                           !this.configService.get<string>('AWS_ACCESS_KEY_ID');

    if (!this.useLocalStorage) {
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
      
      if (!accessKeyId || !secretAccessKey) {
        this.logger.warn('AWS credentials not configured. Using local storage.');
        this.useLocalStorage = true;
      } else {
        this.s3Client = new S3Client({
          region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      }
    }
    
    if (this.useLocalStorage) {
      this.logger.warn('Using local storage for development. Configure AWS credentials for production.');
    }
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    candidateId: string,
  ): Promise<string> {
    const key = this.generateFileKey(candidateId, file.originalname);

    if (this.useLocalStorage) {
      // For development, just return a mock URL
      this.logger.log(`Mock upload: ${key}`);
      return `local://${key}`;
    }

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname,
            candidateId: candidateId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      await upload.done();

      const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      this.logger.log(`File uploaded successfully: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Get a file from S3
   */
  async getFile(key: string): Promise<Buffer> {
    if (this.useLocalStorage) {
      throw new Error('Local storage retrieval not implemented');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useLocalStorage) {
      this.logger.log(`Mock delete: ${key}`);
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Generate a unique file key for S3
   */
  private generateFileKey(candidateId: string, originalName: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `resumes/${candidateId}/${timestamp}-${sanitizedName}`;
  }

  /**
   * Extract key from S3 URL
   */
  extractKeyFromUrl(url: string): string {
    if (url.startsWith('local://')) {
      return url.replace('local://', '');
    }
    
    const urlParts = url.split('.s3.amazonaws.com/');
    if (urlParts.length === 2) {
      return urlParts[1];
    }
    
    throw new Error('Invalid S3 URL format');
  }
}
