import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MetricsCalculationService } from './metrics-calculation.service';
import {
  DashboardType,
  DashboardResponse,
  DashboardWidget,
  GetDashboardDto,
} from './dto/dashboard.dto';
import { MetricType, TimeRange } from './dto/metrics.dto';

@Injectable()
export class DashboardService {
  constructor(
    private metricsCalculationService: MetricsCalculationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async getDashboard(
    organizationId: string,
    dashboardDto: GetDashboardDto,
  ): Promise<DashboardResponse> {
    // Check cache first
    const cacheKey = this.generateCacheKey(organizationId, dashboardDto);
    const cached = await this.cacheManager.get<DashboardResponse>(cacheKey);

    if (cached) {
      return {
        ...cached,
        cachedAt: new Date(),
      };
    }

    // Generate dashboard based on type
    let dashboard: DashboardResponse;

    switch (dashboardDto.type) {
      case DashboardType.RECRUITING_FUNNEL:
        dashboard = await this.generateRecruitingFunnelDashboard(organizationId, dashboardDto);
        break;
      case DashboardType.EFFICIENCY:
        dashboard = await this.generateEfficiencyDashboard(organizationId, dashboardDto);
        break;
      case DashboardType.DEI:
        dashboard = await this.generateDEIDashboard(organizationId, dashboardDto);
        break;
      case DashboardType.EXECUTIVE_SUMMARY:
        dashboard = await this.generateExecutiveSummaryDashboard(organizationId, dashboardDto);
        break;
      default:
        dashboard = await this.generateRecruitingFunnelDashboard(organizationId, dashboardDto);
    }

    // Cache the dashboard for 1 hour
    await this.cacheManager.set(cacheKey, dashboard, 3600000);

    return dashboard;
  }

  private async generateRecruitingFunnelDashboard(
    organizationId: string,
    dashboardDto: GetDashboardDto,
  ): Promise<DashboardResponse> {
    const funnelMetrics = await this.metricsCalculationService.calculateFunnelMetrics(
      organizationId,
      {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      },
    );

    const widgets: DashboardWidget[] = [
      {
        id: 'funnel-overview',
        type: 'funnel-chart',
        title: 'Recruiting Funnel',
        data: {
          stages: [
            { name: 'Applications', value: funnelMetrics.totalApplications },
            { name: 'Screening Passed', value: funnelMetrics.screeningPassed },
            { name: 'Interviews Scheduled', value: funnelMetrics.interviewsScheduled },
            { name: 'Interviews Completed', value: funnelMetrics.interviewsCompleted },
            { name: 'Offers Extended', value: funnelMetrics.offersExtended },
            { name: 'Offers Accepted', value: funnelMetrics.offersAccepted },
          ],
        },
      },
      {
        id: 'conversion-rates',
        type: 'metric-cards',
        title: 'Conversion Rates',
        data: {
          metrics: [
            {
              label: 'Application to Screening',
              value: funnelMetrics.conversionRates.applicationToScreening,
              format: 'percentage',
            },
            {
              label: 'Screening to Interview',
              value: funnelMetrics.conversionRates.screeningToInterview,
              format: 'percentage',
            },
            {
              label: 'Interview to Offer',
              value: funnelMetrics.conversionRates.interviewToOffer,
              format: 'percentage',
            },
            {
              label: 'Offer to Acceptance',
              value: funnelMetrics.conversionRates.offerToAcceptance,
              format: 'percentage',
            },
          ],
        },
      },
      {
        id: 'drop-off-analysis',
        type: 'bar-chart',
        title: 'Drop-off Analysis',
        data: {
          categories: funnelMetrics.dropOffAnalysis.map(d => d.stage),
          series: [
            {
              name: 'Drop-off Count',
              data: funnelMetrics.dropOffAnalysis.map(d => d.count),
            },
            {
              name: 'Drop-off Percentage',
              data: funnelMetrics.dropOffAnalysis.map(d => d.percentage),
            },
          ],
        },
      },
    ];

    return {
      id: 'recruiting-funnel',
      type: DashboardType.RECRUITING_FUNNEL,
      title: 'Recruiting Funnel Dashboard',
      description: 'Overview of candidate progression through the hiring pipeline',
      widgets,
      period: {
        startDate: dashboardDto.startDate ? new Date(dashboardDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: dashboardDto.endDate ? new Date(dashboardDto.endDate) : new Date(),
      },
      generatedAt: new Date(),
    };
  }

  private async generateEfficiencyDashboard(
    organizationId: string,
    dashboardDto: GetDashboardDto,
  ): Promise<DashboardResponse> {
    const efficiencyMetrics = await this.metricsCalculationService.calculateEfficiencyMetrics(
      organizationId,
      {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      },
    );

    const widgets: DashboardWidget[] = [
      {
        id: 'key-metrics',
        type: 'metric-cards',
        title: 'Key Efficiency Metrics',
        data: {
          metrics: [
            {
              label: 'Average Time to Fill',
              value: efficiencyMetrics.averageTimeToFill,
              format: 'days',
            },
            {
              label: 'Average Time to Hire',
              value: efficiencyMetrics.averageTimeToHire,
              format: 'days',
            },
            {
              label: 'Interviews per Hire',
              value: efficiencyMetrics.interviewsPerHire,
              format: 'number',
            },
            {
              label: 'Application Response Time',
              value: efficiencyMetrics.applicationResponseTime,
              format: 'days',
            },
          ],
        },
      },
      {
        id: 'time-in-stage',
        type: 'bar-chart',
        title: 'Average Time in Each Stage',
        data: {
          categories: efficiencyMetrics.averageTimeInStage.map(s => s.stage),
          series: [
            {
              name: 'Days',
              data: efficiencyMetrics.averageTimeInStage.map(s => s.averageDays),
            },
          ],
        },
      },
    ];

    return {
      id: 'efficiency',
      type: DashboardType.EFFICIENCY,
      title: 'Efficiency Metrics Dashboard',
      description: 'Track hiring speed and process efficiency',
      widgets,
      period: {
        startDate: dashboardDto.startDate ? new Date(dashboardDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: dashboardDto.endDate ? new Date(dashboardDto.endDate) : new Date(),
      },
      generatedAt: new Date(),
    };
  }

  private async generateDEIDashboard(
    organizationId: string,
    dashboardDto: GetDashboardDto,
  ): Promise<DashboardResponse> {
    const diversityMetrics = await this.metricsCalculationService.calculateDiversityMetrics(
      organizationId,
      {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      },
    );

    const widgets: DashboardWidget[] = [
      {
        id: 'demographic-breakdown',
        type: 'pie-chart',
        title: 'Demographic Breakdown',
        data: {
          series: diversityMetrics.demographicBreakdown.map(d => ({
            name: `${d.category}: ${d.value}`,
            value: d.count,
          })),
        },
      },
      {
        id: 'hiring-diversity',
        type: 'bar-chart',
        title: 'Hiring Diversity',
        data: {
          categories: diversityMetrics.hiringDiversity.map(d => d.value),
          series: [
            {
              name: 'Hires',
              data: diversityMetrics.hiringDiversity.map(d => d.hireCount),
            },
          ],
        },
      },
    ];

    return {
      id: 'dei',
      type: DashboardType.DEI,
      title: 'Diversity, Equity & Inclusion Dashboard',
      description: 'Track diversity metrics and identify potential bias',
      widgets,
      period: {
        startDate: dashboardDto.startDate ? new Date(dashboardDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: dashboardDto.endDate ? new Date(dashboardDto.endDate) : new Date(),
      },
      generatedAt: new Date(),
    };
  }

  private async generateExecutiveSummaryDashboard(
    organizationId: string,
    dashboardDto: GetDashboardDto,
  ): Promise<DashboardResponse> {
    const [funnelMetrics, efficiencyMetrics, qualityMetrics] = await Promise.all([
      this.metricsCalculationService.calculateFunnelMetrics(organizationId, {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      }),
      this.metricsCalculationService.calculateEfficiencyMetrics(organizationId, {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      }),
      this.metricsCalculationService.calculateQualityMetrics(organizationId, {
        timeRange: TimeRange.LAST_30_DAYS,
        startDate: dashboardDto.startDate,
        endDate: dashboardDto.endDate,
        jobId: dashboardDto.jobId,
        departmentId: dashboardDto.departmentId,
        locationIds: dashboardDto.locationIds,
      }),
    ]);

    const widgets: DashboardWidget[] = [
      {
        id: 'executive-summary',
        type: 'metric-cards',
        title: 'Executive Summary',
        data: {
          metrics: [
            {
              label: 'Total Applications',
              value: funnelMetrics.totalApplications,
              format: 'number',
            },
            {
              label: 'Hires',
              value: funnelMetrics.offersAccepted,
              format: 'number',
            },
            {
              label: 'Conversion Rate',
              value: funnelMetrics.conversionRates.overallConversion,
              format: 'percentage',
            },
            {
              label: 'Time to Fill',
              value: efficiencyMetrics.averageTimeToFill,
              format: 'days',
            },
            {
              label: 'Offer Acceptance Rate',
              value: qualityMetrics.offerAcceptanceRate,
              format: 'percentage',
            },
            {
              label: 'Candidate Quality Score',
              value: qualityMetrics.candidateQualityScore,
              format: 'score',
            },
          ],
        },
      },
      {
        id: 'source-effectiveness',
        type: 'table',
        title: 'Source Effectiveness',
        data: {
          columns: ['Source', 'Applications', 'Hires', 'Conversion Rate'],
          rows: qualityMetrics.sourceEffectiveness.map(s => [
            s.source,
            s.applications,
            s.hires,
            `${s.conversionRate.toFixed(1)}%`,
          ]),
        },
      },
    ];

    return {
      id: 'executive-summary',
      type: DashboardType.EXECUTIVE_SUMMARY,
      title: 'Executive Summary Dashboard',
      description: 'High-level overview of recruiting performance',
      widgets,
      period: {
        startDate: dashboardDto.startDate ? new Date(dashboardDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: dashboardDto.endDate ? new Date(dashboardDto.endDate) : new Date(),
      },
      generatedAt: new Date(),
    };
  }

  async invalidateDashboardCache(organizationId: string): Promise<void> {
    // TODO: Implement cache invalidation when cache-manager API is stable
    // For now, cache will expire after TTL
  }

  private generateCacheKey(organizationId: string, dashboardDto: GetDashboardDto): string {
    return `dashboard:${organizationId}:${dashboardDto.type}:${dashboardDto.startDate || 'default'}:${dashboardDto.endDate || 'default'}:${dashboardDto.jobId || 'all'}:${dashboardDto.departmentId || 'all'}`;
  }
}
