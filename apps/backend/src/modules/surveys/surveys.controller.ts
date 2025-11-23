import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveyResponseService } from './survey-response.service';
import { CreateSurveyDto, UpdateSurveyDto, SubmitSurveyResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('surveys')
export class SurveysController {
  constructor(
    private readonly surveysService: SurveysService,
    private readonly surveyResponseService: SurveyResponseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(
      req.user.organizationId,
      req.user.userId,
      createSurveyDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.surveysService.findAll(req.user.organizationId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  getOrganizationAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.surveyResponseService.getOrganizationAnalytics(
      req.user.organizationId,
      start,
      end,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.surveysService.findOne(id, req.user.organizationId);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  getSurveyAnalytics(@Param('id') id: string) {
    return this.surveyResponseService.getAnalytics(id);
  }

  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  getSurveyResponses(@Param('id') id: string) {
    return this.surveyResponseService.findBySurvey(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateSurveyDto: UpdateSurveyDto,
  ) {
    return this.surveysService.update(id, req.user.organizationId, updateSurveyDto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggleActive(@Param('id') id: string, @Request() req) {
    return this.surveysService.toggleActive(id, req.user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.surveysService.remove(id, req.user.organizationId);
  }

  // Public endpoints for candidates
  @Get('response/:token')
  @Public()
  getSurveyByToken(@Param('token') token: string) {
    return this.surveyResponseService.findByToken(token);
  }

  @Post('response/:token/submit')
  @Public()
  submitResponse(
    @Param('token') token: string,
    @Body() submitDto: SubmitSurveyResponseDto,
  ) {
    return this.surveyResponseService.submitResponse(token, submitDto);
  }
}
