import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { GDPRService } from '../../common/services/gdpr.service';
import { CreateRetentionPolicyDto } from './dto/create-retention-policy.dto';
import { UpdateRetentionPolicyDto } from './dto/update-retention-policy.dto';
import { RecordConsentDto } from './dto/record-consent.dto';

@Controller('gdpr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GDPRController {
  constructor(private readonly gdprService: GDPRService) {}

  @Get('candidates/:candidateId/export')
  @RequirePermissions('candidates:export')
  @HttpCode(HttpStatus.OK)
  async exportCandidateData(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ) {
    return this.gdprService.exportCandidateData(candidateId, user.organizationId);
  }

  @Delete('candidates/:candidateId')
  @RequirePermissions('candidates:delete')
  @HttpCode(HttpStatus.OK)
  async deleteCandidateData(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ) {
    await this.gdprService.deleteCandidateData(
      candidateId,
      user.organizationId,
      user.id,
    );
    
    return {
      message: 'Candidate data has been anonymized',
    };
  }

  @Post('candidates/:candidateId/consent')
  @RequirePermissions('candidates:update')
  @HttpCode(HttpStatus.OK)
  async recordConsent(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
    @Body() dto: RecordConsentDto,
  ) {
    await this.gdprService.recordConsent(
      candidateId,
      user.organizationId,
      dto.consentType,
    );
    
    return {
      message: 'Consent recorded successfully',
    };
  }

  @Delete('candidates/:candidateId/consent')
  @RequirePermissions('candidates:update')
  @HttpCode(HttpStatus.OK)
  async withdrawConsent(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ) {
    await this.gdprService.withdrawConsent(candidateId, user.organizationId);
    
    return {
      message: 'Consent withdrawn successfully',
    };
  }

  @Get('candidates/:candidateId/consent')
  @RequirePermissions('candidates:read')
  @HttpCode(HttpStatus.OK)
  async checkConsent(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ) {
    const hasConsent = await this.gdprService.hasConsent(
      candidateId,
      user.organizationId,
    );
    
    return {
      candidateId,
      hasConsent,
    };
  }

  @Get('candidates/:candidateId/retention')
  @RequirePermissions('candidates:read')
  @HttpCode(HttpStatus.OK)
  async getRetentionStatus(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ) {
    return this.gdprService.getRetentionStatus(candidateId, user.organizationId);
  }

  // Data Retention Policy Management

  @Get('retention-policies')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.OK)
  async getRetentionPolicies(@CurrentUser() user: User) {
    return this.gdprService.getRetentionPolicies(user.organizationId);
  }

  @Post('retention-policies')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.CREATED)
  async createRetentionPolicy(
    @CurrentUser() user: User,
    @Body() policyDto: CreateRetentionPolicyDto,
  ) {
    return this.gdprService.createRetentionPolicy(user.organizationId, policyDto);
  }

  @Post('retention-policies/:policyId')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.OK)
  async updateRetentionPolicy(
    @CurrentUser() user: User,
    @Param('policyId') policyId: string,
    @Body() updates: UpdateRetentionPolicyDto,
  ) {
    return this.gdprService.updateRetentionPolicy(
      policyId,
      user.organizationId,
      updates,
    );
  }

  @Delete('retention-policies/:policyId')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.OK)
  async deleteRetentionPolicy(
    @CurrentUser() user: User,
    @Param('policyId') policyId: string,
  ) {
    await this.gdprService.deleteRetentionPolicy(policyId, user.organizationId);
    return { message: 'Retention policy deleted successfully' };
  }

  @Get('candidates-for-deletion')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.OK)
  async getCandidatesForDeletion(@CurrentUser() user: User) {
    return this.gdprService.getCandidatesForDeletion(user.organizationId);
  }

  @Get('candidates-approaching-deletion')
  @RequirePermissions('admin:manage')
  @HttpCode(HttpStatus.OK)
  async getCandidatesApproachingDeletion(@CurrentUser() user: User) {
    return this.gdprService.getCandidatesApproachingDeletion(user.organizationId);
  }
}
