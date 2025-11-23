import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CareerSiteService } from './career-site.service';
import { ApplicationFormService } from './application-form.service';
import { PublicCareerSiteService } from './public-career-site.service';
import { CandidatePortalService } from './candidate-portal.service';
import {
  CreateCareerSiteDto,
  UpdateCareerSiteDto,
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
  PublicJobListingQueryDto,
  SubmitApplicationDto,
} from './dto';
import { CandidatePortalLoginDto, CandidatePortalRegisterDto } from './dto/candidate-portal-login.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('career-sites')
export class CareerSiteController {
  constructor(
    private readonly careerSiteService: CareerSiteService,
    private readonly applicationFormService: ApplicationFormService,
    private readonly publicCareerSiteService: PublicCareerSiteService,
    private readonly candidatePortalService: CandidatePortalService,
  ) {}

  // Admin endpoints (authenticated)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() createDto: CreateCareerSiteDto) {
    return this.careerSiteService.create(req.user.organizationId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.careerSiteService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.careerSiteService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCareerSiteDto,
  ) {
    return this.careerSiteService.update(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.careerSiteService.remove(id, req.user.organizationId);
    return { message: 'Career site deleted successfully' };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Request() req: any, @Param('id') id: string) {
    return this.careerSiteService.publish(id, req.user.organizationId);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublish(@Request() req: any, @Param('id') id: string) {
    return this.careerSiteService.unpublish(id, req.user.organizationId);
  }

  // Application form endpoints
  @Post('application-forms')
  @UseGuards(JwtAuthGuard)
  async createForm(@Request() req: any, @Body() createDto: CreateApplicationFormDto) {
    return this.applicationFormService.create(req.user.organizationId, createDto);
  }

  @Get('application-forms')
  @UseGuards(JwtAuthGuard)
  async findAllForms(@Request() req: any) {
    return this.applicationFormService.findAll(req.user.organizationId);
  }

  @Get('application-forms/:id')
  @UseGuards(JwtAuthGuard)
  async findOneForm(@Request() req: any, @Param('id') id: string) {
    return this.applicationFormService.findOne(id, req.user.organizationId);
  }

  @Put('application-forms/:id')
  @UseGuards(JwtAuthGuard)
  async updateForm(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationFormDto,
  ) {
    return this.applicationFormService.update(id, req.user.organizationId, updateDto);
  }

  @Delete('application-forms/:id')
  @UseGuards(JwtAuthGuard)
  async removeForm(@Request() req: any, @Param('id') id: string) {
    await this.applicationFormService.remove(id, req.user.organizationId);
    return { message: 'Application form deleted successfully' };
  }

  // Public endpoints (no authentication required)
  @Get('public/:slug')
  @Public()
  async getPublicCareerSite(@Param('slug') slug: string) {
    return this.publicCareerSiteService.getCareerSite(slug);
  }

  @Get('public/:slug/jobs')
  @Public()
  async getPublicJobs(
    @Param('slug') slug: string,
    @Query() query: PublicJobListingQueryDto,
  ) {
    return this.publicCareerSiteService.getPublicJobs(slug, query);
  }

  @Get('public/:slug/jobs/:jobId')
  @Public()
  async getPublicJob(@Param('slug') slug: string, @Param('jobId') jobId: string) {
    return this.publicCareerSiteService.getPublicJob(slug, jobId);
  }

  @Get('public/:slug/jobs/:jobId/application-form')
  @Public()
  async getPublicApplicationForm(
    @Param('slug') slug: string,
    @Param('jobId') jobId: string,
  ) {
    return this.publicCareerSiteService.getApplicationForm(slug, jobId);
  }

  @Post('public/:slug/applications')
  @Public()
  async submitPublicApplication(
    @Param('slug') slug: string,
    @Body() submitDto: SubmitApplicationDto,
  ) {
    return this.publicCareerSiteService.submitApplication(slug, submitDto);
  }

  // Candidate portal endpoints
  @Post('portal/register')
  @Public()
  async registerPortalUser(@Body() registerDto: CandidatePortalRegisterDto) {
    return this.candidatePortalService.register(registerDto);
  }

  @Post('portal/login')
  @Public()
  async loginPortalUser(@Body() loginDto: CandidatePortalLoginDto) {
    return this.candidatePortalService.login(loginDto);
  }

  @Get('portal/applications')
  @UseGuards(JwtAuthGuard)
  async getPortalApplications(@Request() req: any) {
    return this.candidatePortalService.getApplications(req.user.candidateId);
  }

  @Get('portal/interviews')
  @UseGuards(JwtAuthGuard)
  async getPortalInterviews(@Request() req: any) {
    return this.candidatePortalService.getInterviews(req.user.candidateId);
  }

  @Post('portal/documents')
  @UseGuards(JwtAuthGuard)
  async uploadPortalDocument(
    @Request() req: any,
    @Body() body: { documentType: string; documentUrl: string },
  ) {
    await this.candidatePortalService.uploadDocument(
      req.user.candidateId,
      body.documentType,
      body.documentUrl,
    );
    return { message: 'Document uploaded successfully' };
  }
}
