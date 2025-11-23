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
import { SlaService } from './sla.service';
import { SlaMonitoringService } from './sla-monitoring.service';
import {
  CreateSlaRuleDto,
  UpdateSlaRuleDto,
  FilterSlaRuleDto,
  FilterViolationDto,
  UpdateViolationDto,
} from './dto';

@Controller('sla')
@UseGuards(JwtAuthGuard)
export class SlaController {
  constructor(
    private readonly slaService: SlaService,
    private readonly slaMonitoringService: SlaMonitoringService,
  ) {}

  // SLA Rules endpoints
  @Post('rules')
  async createRule(@Request() req: any, @Body() createDto: CreateSlaRuleDto) {
    return this.slaService.createRule(req.user.organizationId, createDto);
  }

  @Get('rules')
  async findAllRules(@Request() req: any, @Query() filters: FilterSlaRuleDto) {
    return this.slaService.findAllRules(req.user.organizationId, filters);
  }

  @Get('rules/:id')
  async findRuleById(@Request() req: any, @Param('id') id: string) {
    return this.slaService.findRuleById(id, req.user.organizationId);
  }

  @Put('rules/:id')
  async updateRule(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateSlaRuleDto,
  ) {
    return this.slaService.updateRule(id, req.user.organizationId, updateDto);
  }

  @Delete('rules/:id')
  async deleteRule(@Request() req: any, @Param('id') id: string) {
    await this.slaService.deleteRule(id, req.user.organizationId);
    return { message: 'SLA rule deleted successfully' };
  }

  // SLA Violations endpoints
  @Get('violations')
  async findAllViolations(
    @Request() req: any,
    @Query() filters: FilterViolationDto,
  ) {
    return this.slaService.findAllViolations(req.user.organizationId, filters);
  }

  @Get('violations/:id')
  async findViolationById(@Request() req: any, @Param('id') id: string) {
    return this.slaService.findViolationById(id, req.user.organizationId);
  }

  @Put('violations/:id/acknowledge')
  async acknowledgeViolation(@Request() req: any, @Param('id') id: string) {
    return this.slaMonitoringService.acknowledgeViolation(id, req.user.id);
  }

  @Put('violations/:id/resolve')
  async resolveViolation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateViolationDto,
  ) {
    return this.slaMonitoringService.resolveViolation(
      id,
      req.user.id,
      updateDto.notes,
    );
  }

  // Metrics endpoints
  @Get('metrics/compliance')
  async getComplianceMetrics(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.slaService.getComplianceMetrics(
      req.user.organizationId,
      start,
      end,
    );
  }
}
