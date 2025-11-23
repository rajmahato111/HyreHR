import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MetricsCalculationService } from './metrics-calculation.service';
import { DashboardService } from './dashboard.service';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Permission } from '../auth/constants/permissions';
import {
  GetMetricsDto,
  MetricType,
  MetricsResponse,
} from './dto/metrics.dto';
import {
  GetDashboardDto,
  DashboardType,
} from './dto/dashboard.dto';
import {
  GenerateReportDto,
  ReportFormat,
  ReportDefinition,
} from './dto/report.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(
    private readonly metricsCalculationService: MetricsCalculationService,
    private readonly dashboardService: DashboardService,
    private readonly reportService: ReportService,
  ) {}

  @Get('metrics')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getMetrics(
    @Query() metricsDto: GetMetricsDto,
    @CurrentUser() user: User,
  ): Promise<MetricsResponse> {
    const { start, end } = this.getDateRange(metricsDto);

    const response: MetricsResponse = {
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    // Calculate requested metrics
    if (!metricsDto.type || metricsDto.type === MetricType.FUNNEL) {
      response.funnel = await this.metricsCalculationService.calculateFunnelMetrics(
        user.organizationId,
        metricsDto,
      );
    }

    if (!metricsDto.type || metricsDto.type === MetricType.EFFICIENCY) {
      response.efficiency = await this.metricsCalculationService.calculateEfficiencyMetrics(
        user.organizationId,
        metricsDto,
      );
    }

    if (!metricsDto.type || metricsDto.type === MetricType.QUALITY) {
      response.quality = await this.metricsCalculationService.calculateQualityMetrics(
        user.organizationId,
        metricsDto,
      );
    }

    if (!metricsDto.type || metricsDto.type === MetricType.DIVERSITY) {
      response.diversity = await this.metricsCalculationService.calculateDiversityMetrics(
        user.organizationId,
        metricsDto,
      );
    }

    return response;
  }

  @Get('dashboards')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getDashboard(
    @Query() dashboardDto: GetDashboardDto,
    @CurrentUser() user: User,
  ) {
    return this.dashboardService.getDashboard(user.organizationId, dashboardDto);
  }

  @Post('dashboards/invalidate-cache')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async invalidateDashboardCache(@CurrentUser() user: User) {
    await this.dashboardService.invalidateDashboardCache(user.organizationId);
    return { message: 'Dashboard cache invalidated successfully' };
  }

  @Post('reports/generate')
  @RequirePermissions(Permission.ANALYTICS_EXPORT)
  async generateReport(
    @Body() reportDto: GenerateReportDto & { definition: ReportDefinition },
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const result = await this.reportService.generateReport(
      user.organizationId,
      reportDto,
      reportDto.definition,
    );

    // If result is a Buffer (CSV, Excel, PDF), send as file download
    if (Buffer.isBuffer(result)) {
      const filename = `report-${Date.now()}`;
      let contentType: string;
      let extension: string;

      switch (reportDto.format) {
        case ReportFormat.CSV:
          contentType = 'text/csv';
          extension = 'csv';
          break;
        case ReportFormat.EXCEL:
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case ReportFormat.PDF:
          contentType = 'application/pdf';
          extension = 'pdf';
          break;
        default:
          contentType = 'application/octet-stream';
          extension = 'bin';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
      res.send(result);
    } else {
      // JSON response
      res.status(HttpStatus.OK).json(result);
    }
  }

  @Get('metrics/funnel')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getFunnelMetrics(
    @Query() metricsDto: GetMetricsDto,
    @CurrentUser() user: User,
  ) {
    return this.metricsCalculationService.calculateFunnelMetrics(
      user.organizationId,
      metricsDto,
    );
  }

  @Get('metrics/efficiency')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getEfficiencyMetrics(
    @Query() metricsDto: GetMetricsDto,
    @CurrentUser() user: User,
  ) {
    return this.metricsCalculationService.calculateEfficiencyMetrics(
      user.organizationId,
      metricsDto,
    );
  }

  @Get('metrics/quality')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getQualityMetrics(
    @Query() metricsDto: GetMetricsDto,
    @CurrentUser() user: User,
  ) {
    return this.metricsCalculationService.calculateQualityMetrics(
      user.organizationId,
      metricsDto,
    );
  }

  @Get('metrics/diversity')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getDiversityMetrics(
    @Query() metricsDto: GetMetricsDto,
    @CurrentUser() user: User,
  ) {
    return this.metricsCalculationService.calculateDiversityMetrics(
      user.organizationId,
      metricsDto,
    );
  }

  private getDateRange(metricsDto: GetMetricsDto): { start: Date; end: Date } {
    const end = metricsDto.endDate ? new Date(metricsDto.endDate) : new Date();
    const start = metricsDto.startDate
      ? new Date(metricsDto.startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { start, end };
  }
}
