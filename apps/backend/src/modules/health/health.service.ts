import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async check(): Promise<HealthCheck> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
    };

    const allHealthy = Object.values(checks).every((check) => check.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }

  async readiness(): Promise<{ status: string; ready: boolean }> {
    const dbCheck = await this.checkDatabase();

    return {
      status: dbCheck.status === 'healthy' ? 'ready' : 'not ready',
      ready: dbCheck.status === 'healthy',
    };
  }

  liveness(): { status: string; alive: boolean } {
    return {
      status: 'alive',
      alive: true,
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
      };
    }
  }

  private checkMemory(): HealthCheckResult {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    // Consider unhealthy if heap usage is above 90%
    const isHealthy = heapUsagePercent < 90;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapUsagePercent.toFixed(1)}%)`,
    };
  }
}
