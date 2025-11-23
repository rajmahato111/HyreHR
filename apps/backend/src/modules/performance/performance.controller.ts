import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MaterializedViewService } from '../../common/services/materialized-view.service';
import { PerformanceMonitorService } from '../../common/services/performance-monitor.service';
import { CacheService } from '../../common/services/cache.service';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(
    private readonly materializedViewService: MaterializedViewService,
    private readonly performanceMonitorService: PerformanceMonitorService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('metrics')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get performance metrics (Admin only)' })
  async getMetrics() {
    return this.performanceMonitorService.getMetrics();
  }

  @Get('database-stats')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get database statistics (Admin only)' })
  async getDatabaseStats() {
    return this.performanceMonitorService.getDatabaseStats();
  }

  @Get('slow-queries')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get slow queries (Admin only)' })
  async getSlowQueries(@Query('limit') limit = 10) {
    return this.performanceMonitorService.getSlowQueries(limit);
  }

  @Get('table-bloat')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get table bloat information (Admin only)' })
  async getTableBloat() {
    return this.performanceMonitorService.getTableBloat();
  }

  @Get('missing-indexes')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get missing index suggestions (Admin only)' })
  async getMissingIndexes() {
    return this.performanceMonitorService.getMissingIndexes();
  }

  @Post('vacuum-analyze')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Run VACUUM ANALYZE on database (Admin only)' })
  async vacuumAnalyze(@Query('table') tableName?: string) {
    await this.performanceMonitorService.vacuumAnalyze(tableName);
    return { message: 'VACUUM ANALYZE completed successfully' };
  }

  @Post('refresh-materialized-views')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Refresh all materialized views (Admin only)' })
  async refreshMaterializedViews() {
    await this.materializedViewService.refreshAll();
    return { message: 'Materialized views refreshed successfully' };
  }

  @Post('refresh-materialized-views/:view')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Refresh specific materialized view (Admin only)' })
  async refreshSpecificView(@Param('view') view: string) {
    switch (view) {
      case 'job-metrics':
        await this.materializedViewService.refreshJobMetrics();
        break;
      case 'pipeline-metrics':
        await this.materializedViewService.refreshPipelineMetrics();
        break;
      case 'candidate-engagement':
        await this.materializedViewService.refreshCandidateEngagement();
        break;
      default:
        return { error: 'Invalid view name' };
    }
    return { message: `Materialized view ${view} refreshed successfully` };
  }

  @Post('clear-cache')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear all cache (Admin only)' })
  async clearCache() {
    await this.cacheService.invalidatePattern('*');
    return { message: 'Cache cleared successfully' };
  }

  @Post('clear-cache/:pattern')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear cache by pattern (Admin only)' })
  async clearCachePattern(@Param('pattern') pattern: string) {
    await this.cacheService.invalidatePattern(pattern);
    return { message: `Cache pattern ${pattern} cleared successfully` };
  }
}
