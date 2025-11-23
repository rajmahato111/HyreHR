import { Injectable, Logger } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { TextExtractionService } from './text-extraction.service';
import { NlpExtractionService } from './nlp-extraction.service';
import { ConfidenceScoringService } from './confidence-scoring.service';
import { ParsedResumeDto } from './dto';

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly textExtractionService: TextExtractionService,
    private readonly nlpExtractionService: NlpExtractionService,
    private readonly confidenceScoringService: ConfidenceScoringService,
  ) {}

  /**
   * Parse a resume file and extract structured data
   */
  async parseResume(
    file: Express.Multer.File,
    candidateId?: string,
  ): Promise<{
    parsedData: ParsedResumeDto;
    fileUrl: string;
    qualityReport: {
      issues: string[];
      suggestions: string[];
      strengths: string[];
    };
  }> {
    this.logger.log(`Starting resume parsing for file: ${file.originalname}`);

    try {
      // Step 1: Extract text from the file
      this.logger.log('Step 1: Extracting text from file');
      const extractedText = await this.textExtractionService.extractText(file);
      
      if (!extractedText.text || extractedText.text.length < 100) {
        throw new Error('Extracted text is too short or empty. The file may be corrupted or scanned.');
      }

      this.logger.log(`Extracted ${extractedText.text.length} characters from file`);

      // Step 2: Upload file to storage
      this.logger.log('Step 2: Uploading file to storage');
      const fileUrl = await this.fileStorageService.uploadFile(
        file,
        candidateId || 'temp',
      );

      // Step 3: Extract structured data using NLP
      this.logger.log('Step 3: Extracting structured data using NLP');
      const structuredData = await this.nlpExtractionService.extractStructuredData(
        extractedText.text,
      );

      // Step 4: Calculate confidence scores
      this.logger.log('Step 4: Calculating confidence scores');
      const confidence = this.confidenceScoringService.calculateConfidence(structuredData);

      // Step 5: Determine if manual review is needed
      const needsManualReview = this.confidenceScoringService.needsManualReview(confidence);

      // Step 6: Generate quality report
      const qualityReport = this.confidenceScoringService.generateQualityReport(
        structuredData,
        confidence,
      );

      // Combine all data
      const parsedData: ParsedResumeDto = {
        personalInfo: structuredData.personalInfo || {},
        workExperience: structuredData.workExperience || [],
        education: structuredData.education || [],
        skills: structuredData.skills || [],
        certifications: structuredData.certifications || [],
        summary: structuredData.summary,
        rawText: extractedText.text,
        confidence,
        needsManualReview,
      };

      this.logger.log(
        `Resume parsing completed. Confidence: ${confidence.overall}, Manual review: ${needsManualReview}`,
      );

      return {
        parsedData,
        fileUrl,
        qualityReport,
      };
    } catch (error) {
      this.logger.error(`Resume parsing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Re-parse an existing resume from storage
   */
  async reparseResume(fileUrl: string): Promise<ParsedResumeDto> {
    this.logger.log(`Re-parsing resume from URL: ${fileUrl}`);

    try {
      // Extract key from URL and get file from storage
      const key = this.fileStorageService.extractKeyFromUrl(fileUrl);
      const fileBuffer = await this.fileStorageService.getFile(key);

      // Create a mock file object for processing
      const mockFile: Express.Multer.File = {
        buffer: fileBuffer,
        originalname: key.split('/').pop() || 'resume.pdf',
        mimetype: this.getMimetypeFromFilename(key),
        size: fileBuffer.length,
      } as Express.Multer.File;

      const result = await this.parseResume(mockFile);
      return result.parsedData;
    } catch (error) {
      this.logger.error(`Resume re-parsing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate if a file can be parsed
   */
  canParseFile(mimetype: string): boolean {
    return this.textExtractionService.isSupportedFileType(mimetype);
  }

  /**
   * Get list of supported file extensions
   */
  getSupportedExtensions(): string[] {
    return this.textExtractionService.getSupportedExtensions();
  }

  /**
   * Map parsed resume data to candidate creation DTO
   */
  mapParsedDataToCandidateDto(
    parsedData: ParsedResumeDto,
    additionalData?: {
      sourceType?: string;
      sourceDetails?: Record<string, any>;
      gdprConsent?: boolean;
      customFields?: Record<string, any>;
    },
  ): any {
    const { personalInfo, workExperience, skills } = parsedData;

    // Get most recent work experience
    const currentJob = workExperience.find((exp) => exp.current) || workExperience[0];

    return {
      email: personalInfo.email,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phone: personalInfo.phone,
      locationCity: personalInfo.location?.city,
      locationState: personalInfo.location?.state,
      locationCountry: personalInfo.location?.country,
      currentCompany: currentJob?.company,
      currentTitle: currentJob?.title,
      linkedinUrl: personalInfo.linkedinUrl,
      githubUrl: personalInfo.githubUrl,
      portfolioUrl: personalInfo.portfolioUrl,
      tags: skills.slice(0, 10), // Use top 10 skills as tags
      sourceType: additionalData?.sourceType || 'resume_upload',
      sourceDetails: {
        ...additionalData?.sourceDetails,
        resumeParsed: true,
        parsingConfidence: parsedData.confidence.overall,
        parsedAt: new Date().toISOString(),
      },
      gdprConsent: additionalData?.gdprConsent || false,
      customFields: {
        ...additionalData?.customFields,
        skills: skills,
        workExperience: workExperience,
        education: parsedData.education,
        certifications: parsedData.certifications,
        summary: parsedData.summary,
      },
    };
  }

  /**
   * Get mimetype from filename
   */
  private getMimetypeFromFilename(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }
}
