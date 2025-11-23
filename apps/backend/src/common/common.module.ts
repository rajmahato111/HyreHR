import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheService } from './services/cache.service';
import { CDNService } from './services/cdn.service';
import { MaterializedViewService } from './services/materialized-view.service';
import { PerformanceMonitorService } from './services/performance-monitor.service';

@Global()
@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  providers: [
    CacheService,
    CDNService,
    MaterializedViewService,
    PerformanceMonitorService,
  ],
  exports: [
    CacheService,
    CDNService,
    MaterializedViewService,
    PerformanceMonitorService,
  ],
})
export class CommonModule { }
