import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeParserService } from './resume-parser.service';
import { UploadResumeDto, ParseAndCreateCandidateDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Permission } from '../auth/constants/permissions';
import { CandidatesService } from '../candidates/candidates.service';

@Controller('resume-parser')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ResumeParserController {
  constructor(
    private readonly resumeParserService: ResumeParserService,
    private readonly candidatesService: CandidatesService,
  ) {}

  /**
   * Upload and parse a resume file
   * POST /resume-parser/parse
   */
  @Post('parse')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.CANDIDATES_CREATE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `Unsupported file type: ${file.mimetype}. Supported types: PDF, DOC, DOCX, TXT`,
            ),
            false,
          );
        }
      },
    }),
  )
  async parseResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadResumeDto: UploadResumeDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.resumeParserService.parseResume(
      file,
      uploadResumeDto.candidateId,
    );

    return {
      success: true,
      data: {
        parsedData: result.parsedData,
        fileUrl: result.fileUrl,
        qualityReport: result.qualityReport,
      },
      message: result.parsedData.needsManualReview
        ? 'Resume parsed successfully but requires manual review'
        : 'Resume parsed successfully',
    };
  }

  /**
   * Parse resume and create candidate
   * POST /resume-parser/parse-and-create
   */
  @Post('parse-and-create')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.CANDIDATES_CREATE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `Unsupported file type: ${file.mimetype}. Supported types: PDF, DOC, DOCX, TXT`,
            ),
            false,
          );
        }
      },
    }),
  )
  async parseAndCreateCandidate(
    @UploadedFile() file: Express.Multer.File,
    @Body() parseAndCreateDto: ParseAndCreateCandidateDto,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Parse the resume
    const parseResult = await this.resumeParserService.parseResume(file);

    // Map parsed data to candidate DTO
    const candidateDto = this.resumeParserService.mapParsedDataToCandidateDto(
      parseResult.parsedData,
      {
        sourceType: parseAndCreateDto.sourceType,
        sourceDetails: parseAndCreateDto.sourceDetails,
        gdprConsent: parseAndCreateDto.gdprConsent,
        customFields: parseAndCreateDto.customFields,
      },
    );

    // Check if email was extracted
    if (!candidateDto.email) {
      return {
        success: false,
        error: 'Could not extract email from resume',
        data: {
          parsedData: parseResult.parsedData,
          fileUrl: parseResult.fileUrl,
          qualityReport: parseResult.qualityReport,
          suggestedData: candidateDto,
        },
        message: 'Email is required to create a candidate. Please provide it manually.',
      };
    }

    // Create the candidate
    let candidate;
    try {
      candidate = await this.candidatesService.create(
        candidateDto,
        user.organizationId,
      );

      // Update candidate with resume URL
      await this.candidatesService.update(
        candidate.id,
        {
          customFields: {
            ...candidate.customFields,
            resumeUrls: [parseResult.fileUrl],
          },
        },
        user.organizationId,
      );
    } catch (error) {
      // If candidate creation fails (e.g., duplicate), return parsed data
      if (error.status === 409) {
        return {
          success: false,
          error: 'duplicate_candidate',
          data: {
            parsedData: parseResult.parsedData,
            fileUrl: parseResult.fileUrl,
            qualityReport: parseResult.qualityReport,
            suggestedData: candidateDto,
            duplicates: error.response?.duplicates,
          },
          message: 'A candidate with this email already exists.',
        };
      }
      throw error;
    }

    return {
      success: true,
      data: {
        candidate,
        parsedData: parseResult.parsedData,
        fileUrl: parseResult.fileUrl,
        qualityReport: parseResult.qualityReport,
        confidence: parseResult.parsedData.confidence,
        needsManualReview: parseResult.parsedData.needsManualReview,
      },
      message: parseResult.parsedData.needsManualReview
        ? 'Candidate created successfully but parsed data may need review'
        : 'Candidate created successfully from resume',
    };
  }

  /**
   * Get supported file types
   * GET /resume-parser/supported-types
   */
  @Post('supported-types')
  @HttpCode(HttpStatus.OK)
  getSupportedTypes() {
    return {
      success: true,
      data: {
        extensions: this.resumeParserService.getSupportedExtensions(),
        mimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ],
      },
    };
  }
}
