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
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly workflowEngineService: WorkflowEngineService,
    private readonly workflowTemplatesService: WorkflowTemplatesService,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: any },
    @Body() createDto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(
      req.user.organizationId,
      req.user.id,
      createDto,
    );
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: any },
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.workflowsService.findAll(
      req.user.organizationId,
      activeOnly === 'true',
    );
  }

  @Get(':id')
  async findOne(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.workflowsService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Req() req: Request & { user: any }, @Param('id') id: string) {
    await this.workflowsService.remove(id, req.user.organizationId);
    return { message: 'Workflow deleted successfully' };
  }

  @Post(':id/activate')
  async activate(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.workflowsService.activate(id, req.user.organizationId);
  }

  @Post(':id/deactivate')
  async deactivate(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
  ) {
    return this.workflowsService.deactivate(id, req.user.organizationId);
  }

  @Get(':id/executions')
  async getExecutions(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.workflowsService.getExecutions(
      id,
      req.user.organizationId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id/statistics')
  async getStatistics(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
  ) {
    return this.workflowsService.getStatistics(id, req.user.organizationId);
  }

  @Get('executions/:executionId')
  async getExecution(
    @Req() req: Request & { user: any },
    @Param('executionId') executionId: string,
  ) {
    return this.workflowEngineService.getExecution(executionId);
  }

  // Template endpoints

  @Get('templates/list')
  async getTemplates() {
    return this.workflowTemplatesService.getTemplates();
  }

  @Get('templates/categories')
  async getTemplateCategories() {
    return this.workflowTemplatesService.getCategories();
  }

  @Get('templates/:name')
  async getTemplateByName(@Param('name') name: string) {
    return this.workflowTemplatesService.getTemplateByName(name);
  }

  @Post('templates/:name/create')
  async createFromTemplate(
    @Req() req: Request & { user: any },
    @Param('name') name: string,
    @Body() customizations?: Partial<CreateWorkflowDto>,
  ) {
    const template = this.workflowTemplatesService.getTemplateByName(name);
    
    if (!template) {
      throw new Error(`Template ${name} not found`);
    }

    const workflowDto: CreateWorkflowDto = {
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      triggerType: template.triggerType,
      triggerConfig: customizations?.triggerConfig || template.triggerConfig,
      conditions: customizations?.conditions || template.conditions,
      actions: customizations?.actions || template.actions,
      active: customizations?.active !== undefined ? customizations.active : true,
    };

    return this.workflowsService.create(
      req.user.organizationId,
      req.user.id,
      workflowDto,
    );
  }
}
