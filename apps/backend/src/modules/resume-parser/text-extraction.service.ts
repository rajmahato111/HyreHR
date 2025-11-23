import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface ExtractedText {
  text: string;
  pageCount?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  private readonly SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain',
  ];

  /**
   * Extract text from a resume file based on its type
   */
  async extractText(file: Express.Multer.File): Promise<ExtractedText> {
    this.validateFile(file);

    try {
      switch (file.mimetype) {
        case 'application/pdf':
          return await this.extractFromPdf(file.buffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractFromWord(file.buffer);
        
        case 'text/plain':
          return this.extractFromText(file.buffer);
        
        default:
          throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
      }
    } catch (error) {
      this.logger.error(`Text extraction failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF using pdf-parse
   */
  private async extractFromPdf(buffer: Buffer): Promise<ExtractedText> {
    try {
      const data = await pdfParse(buffer);
      
      this.logger.log(`Extracted ${data.text.length} characters from PDF (${data.numpages} pages)`);
      
      return {
        text: this.cleanText(data.text),
        pageCount: data.numpages,
        metadata: {
          info: data.info,
          version: data.version,
        },
      };
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`);
      
      // If PDF extraction fails, it might be a scanned document
      // In production, this would trigger OCR processing
      throw new BadRequestException(
        'Failed to extract text from PDF. The document may be scanned or corrupted. ' +
        'OCR processing is not yet implemented.'
      );
    }
  }

  /**
   * Extract text from Word documents using mammoth
   */
  private async extractFromWord(buffer: Buffer): Promise<ExtractedText> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages.length > 0) {
        this.logger.warn(`Word extraction warnings: ${JSON.stringify(result.messages)}`);
      }
      
      this.logger.log(`Extracted ${result.value.length} characters from Word document`);
      
      return {
        text: this.cleanText(result.value),
        metadata: {
          warnings: result.messages,
        },
      };
    } catch (error) {
      this.logger.error(`Word extraction failed: ${error.message}`);
      throw new BadRequestException('Failed to extract text from Word document');
    }
  }

  /**
   * Extract text from plain text files
   */
  private extractFromText(buffer: Buffer): ExtractedText {
    const text = buffer.toString('utf-8');
    
    this.logger.log(`Extracted ${text.length} characters from text file`);
    
    return {
      text: this.cleanText(text),
    };
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Validate file before processing
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    if (!this.SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. ` +
        `Supported types: PDF, DOC, DOCX, TXT`
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      );
    }
  }

  /**
   * Check if a file type is supported
   */
  isSupportedFileType(mimetype: string): boolean {
    return this.SUPPORTED_MIME_TYPES.includes(mimetype);
  }

  /**
   * Get list of supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.pdf', '.doc', '.docx', '.txt'];
  }
}
