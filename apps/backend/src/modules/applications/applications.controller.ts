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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import {
  CreatePipelineStageDto,
  UpdatePipelineStageDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  MoveApplicationDto,
  RejectApplicationDto,
  BulkMoveApplicationsDto,
  BulkRejectApplicationsDto,
  FilterApplicationDto,
} from './dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // Pipeline Stage Endpoints

  @Post('pipeline-stages')
  async createPipelineStage(@Req() req: Request & { user: any }, @Body() createDto: CreatePipelineStageDto) {
    return this.applicationsService.createPipelineStage(req.user.organizationId, createDto);
  }

  @Get('pipeline-stages')
  async findAllPipelineStages(@Req() req: Request & { user: any }, @Query('jobId') jobId?: string) {
    return this.applicationsService.findAllPipelineStages(req.user.organizationId, jobId);
  }

  @Get('pipeline-stages/:id')
  async findOnePipelineStage(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.applicationsService.findOnePipelineStage(id, req.user.organizationId);
  }

  @Put('pipeline-stages/:id')
  async updatePipelineStage(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() updateDto: UpdatePipelineStageDto,
  ) {
    return this.applicationsService.updatePipelineStage(id, req.user.organizationId, updateDto);
  }

  @Delete('pipeline-stages/:id')
  async deletePipelineStage(@Req() req: Request & { user: any }, @Param('id') id: string) {
    await this.applicationsService.deletePipelineStage(id, req.user.organizationId);
    return { message: 'Pipeline stage deleted successfully' };
  }

  @Post('pipeline-stages/initialize')
  async initializeDefaultStages(@Req() req: Request & { user: any }) {
    return this.applicationsService.initializeDefaultStages(req.user.organizationId);
  }

  // Application Endpoints

  @Post()
  async createApplication(@Req() req: Request & { user: any }, @Body() createDto: CreateApplicationDto) {
    return this.applicationsService.createApplication(
      req.user.organizationId,
      req.user.id,
      createDto,
    );
  }

  @Get()
  async findAllApplications(@Req() req: Request & { user: any }, @Query() filterDto: FilterApplicationDto) {
    return this.applicationsService.findAllApplications(req.user.organizationId, filterDto);
  }

  @Get(':id')
  async findOneApplication(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.applicationsService.findOneApplication(id, req.user.organizationId);
  }

  @Put(':id')
  async updateApplication(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateApplication(id, req.user.organizationId, updateDto);
  }

  @Post(':id/move')
  async moveApplication(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() moveDto: MoveApplicationDto,
  ) {
    return this.applicationsService.moveApplication(
      id,
      req.user.organizationId,
      req.user.id,
      moveDto,
    );
  }

  @Post(':id/reject')
  async rejectApplication(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() rejectDto: RejectApplicationDto,
  ) {
    return this.applicationsService.rejectApplication(
      id,
      req.user.organizationId,
      req.user.id,
      rejectDto,
    );
  }

  @Get(':id/history')
  async getApplicationHistory(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.applicationsService.getApplicationHistory(id, req.user.organizationId);
  }

  // Bulk Operations

  @Post('bulk/move')
  async bulkMoveApplications(@Req() req: Request & { user: any }, @Body() bulkMoveDto: BulkMoveApplicationsDto) {
    return this.applicationsService.bulkMoveApplications(
      req.user.organizationId,
      req.user.id,
      bulkMoveDto,
    );
  }

  @Post('bulk/reject')
  async bulkRejectApplications(@Req() req: Request & { user: any }, @Body() bulkRejectDto: BulkRejectApplicationsDto) {
    return this.applicationsService.bulkRejectApplications(
      req.user.organizationId,
      req.user.id,
      bulkRejectDto,
    );
  }

  // Rejection Reasons

  @Get('rejection-reasons/list')
  async findAllRejectionReasons(@Req() req: Request & { user: any }) {
    return this.applicationsService.findAllRejectionReasons(req.user.organizationId);
  }
}
