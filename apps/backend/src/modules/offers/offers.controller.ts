import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { OffersService } from './offers.service';
import { OfferTemplateService } from './offer-template.service';
import { HRISIntegrationService, HRISProvider } from './hris/hris-integration.service';
import {
  CreateOfferDto,
  UpdateOfferDto,
  ApproveOfferDto,
  RejectOfferDto,
  SendOfferDto,
  CreateOfferTemplateDto,
  UpdateOfferTemplateDto,
} from './dto';

@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly offerTemplateService: OfferTemplateService,
    private readonly hrisIntegrationService: HRISIntegrationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  async create(@Body() createOfferDto: CreateOfferDto, @CurrentUser() user: User) {
    return this.offersService.create(createOfferDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  @ApiResponse({ status: 200, description: 'Returns all offers' })
  async findAll(@CurrentUser() user: User) {
    return this.offersService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Returns the offer' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get offer by application ID' })
  @ApiResponse({ status: 200, description: 'Returns the offer' })
  async findByApplication(@Param('applicationId') applicationId: string) {
    return this.offersService.findByApplication(applicationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an offer' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an offer' })
  @ApiResponse({ status: 200, description: 'Offer approved successfully' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.offersService.approve(id, user.id, approveDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an offer' })
  @ApiResponse({ status: 200, description: 'Offer rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.offersService.reject(id, user.id, rejectDto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send an offer to candidate' })
  @ApiResponse({ status: 200, description: 'Offer sent successfully' })
  async send(@Param('id') id: string, @Body() sendDto: SendOfferDto) {
    return this.offersService.send(id, sendDto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an offer (candidate action)' })
  @ApiResponse({ status: 200, description: 'Offer accepted successfully' })
  async accept(@Param('id') id: string) {
    return this.offersService.accept(id);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline an offer (candidate action)' })
  @ApiResponse({ status: 200, description: 'Offer declined successfully' })
  async decline(@Param('id') id: string) {
    return this.offersService.decline(id);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an offer' })
  @ApiResponse({ status: 200, description: 'Offer withdrawn successfully' })
  async withdraw(@Param('id') id: string) {
    return this.offersService.withdraw(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiResponse({ status: 204, description: 'Offer deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.offersService.delete(id);
  }

  // Offer Templates
  @Post('templates')
  @ApiOperation({ summary: 'Create an offer template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body() createDto: CreateOfferTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.offerTemplateService.create(
      user.organizationId,
      user.id,
      createDto,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all offer templates' })
  @ApiResponse({ status: 200, description: 'Returns all templates' })
  async findAllTemplates(@CurrentUser() user: User) {
    return this.offerTemplateService.findAll(user.organizationId);
  }

  @Get('templates/active')
  @ApiOperation({ summary: 'Get active offer templates' })
  @ApiResponse({ status: 200, description: 'Returns active templates' })
  async findActiveTemplates(@CurrentUser() user: User) {
    return this.offerTemplateService.findActive(user.organizationId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Returns the template' })
  async findOneTemplate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.offerTemplateService.findOne(id, user.organizationId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update an offer template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateDto: UpdateOfferTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.offerTemplateService.update(id, user.organizationId, updateDto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an offer template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.offerTemplateService.delete(id, user.organizationId);
  }

  // DocuSign Integration
  @Post(':id/send-docusign')
  @ApiOperation({ summary: 'Send offer via DocuSign' })
  @ApiResponse({ status: 200, description: 'Offer sent via DocuSign successfully' })
  async sendWithDocuSign(@Param('id') id: string, @Body() sendDto: SendOfferDto) {
    return this.offersService.sendWithDocuSign(id, sendDto);
  }

  @Post('webhooks/docusign')
  @ApiOperation({ summary: 'DocuSign webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async docusignWebhook(@Body() payload: any) {
    const envelopeId = payload.data?.envelopeSummary?.envelopeId;
    const status = payload.data?.envelopeSummary?.status;

    if (envelopeId && status) {
      await this.offersService.updateDocuSignStatus(envelopeId, status);
    }

    return { received: true };
  }

  // HRIS Integration
  @Post(':id/handoff-hris')
  @ApiOperation({ summary: 'Handoff accepted offer to HRIS for onboarding' })
  @ApiResponse({ status: 200, description: 'Offer handed off to HRIS successfully' })
  async handoffToHRIS(
    @Param('id') id: string,
    @Query('provider') provider: HRISProvider,
  ) {
    return this.hrisIntegrationService.handoffToHRIS(id, provider);
  }

  @Get(':id/hris-status')
  @ApiOperation({ summary: 'Get HRIS handoff status' })
  @ApiResponse({ status: 200, description: 'Returns HRIS handoff status' })
  async getHRISStatus(@Param('id') id: string) {
    return this.hrisIntegrationService.getHandoffStatus(id);
  }

  @Get(':id/hris-employee')
  @ApiOperation({ summary: 'Get employee data from HRIS' })
  @ApiResponse({ status: 200, description: 'Returns employee data from HRIS' })
  async getHRISEmployee(@Param('id') id: string) {
    return this.hrisIntegrationService.getEmployeeFromHRIS(id);
  }

  @Put(':id/sync-hris')
  @ApiOperation({ summary: 'Sync employee data to HRIS' })
  @ApiResponse({ status: 200, description: 'Employee data synced successfully' })
  async syncToHRIS(@Param('id') id: string, @Body() updates: any) {
    await this.hrisIntegrationService.syncEmployeeData(id, updates);
    return { success: true };
  }
}
