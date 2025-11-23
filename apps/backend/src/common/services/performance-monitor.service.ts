import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface QueryPerformance {
  query: string;
  executionTime: number;
  rowCount: number;
  timestamp: Date;
}

export interface PerformanceMetrics {
  slowQueries: QueryPerformance[];
  avgQueryTime: number;
  totalQueries: number;
  cacheHitRate: number;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private queryLog: QueryPerformance[] = [];
  private readonly slowQueryThreshold = 1000; // 1 second
  private readonly maxLogSize = 1000;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Log query execution time
   */
  logQuery(query: string, executionTime: number, rowCount: number): void {
    const queryPerf: QueryPerformance = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowCount,
      timestamp: new Date(),
    };

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      this.logger.warn(
        `Slow query detected (${executionTime}ms): ${queryPerf.query.substring(0, 100)}...`,
      );
    }

    // Keep log size manageable
    this.queryLog.push(queryPerf);
    if (this.queryLog.length > this.maxLogSize) {
      this.queryLog.shift();
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const totalQueries = this.queryLog.length;
    const slowQueries = this.queryLog.filter(
      q => q.executionTime > this.slowQueryThreshold,
    );
    const avgQueryTime =
      totalQueries > 0
        ? this.queryLog.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries
        : 0;

    return {
      slowQueries: slowQueries.slice(-10), // Last 10 slow queries
      avgQueryTime,
      totalQueries,
      cacheHitRate: 0, // Would be calculated from cache service
    };
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      // Get table sizes
      const tableSizes = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10;
      `);

      // Get index usage
      const indexUsage = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 10;
      `);

      // Get cache hit ratio
      const cacheHitRatio = await this.dataSource.query(`
        SELECT 
          sum(heap_blks_read) as heap_read,
          sum(heap_blks_hit) as heap_hit,
          sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
        FROM pg_statio_user_tables;
      `);

      // Get connection stats
      const connections = await this.dataSource.query(`
        SELECT 
          count(*) as total,
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity
        WHERE datname = current_database();
      `);

      return {
        tableSizes,
        indexUsage,
        cacheHitRatio: cacheHitRatio[0],
        connections: connections[0],
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error);
      throw error;
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQuery(query: string): Promise<any> {
    try {
      const explainResult = await this.dataSource.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`,
      );
      return explainResult[0]['QUERY PLAN'];
    } catch (error) {
      this.logger.error('Failed to analyze query', error);
      throw error;
    }
  }

  /**
   * Get slow queries from PostgreSQL logs
   */
  async getSlowQueries(limit = 10): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time,
          rows
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_time DESC
        LIMIT $1;
      `, [limit]);
      return result;
    } catch (error) {
      // pg_stat_statements extension might not be enabled
      this.logger.warn('pg_stat_statements extension not available');
      return [];
    }
  }

  /**
   * Get table bloat information
   */
  async getTableBloat(): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `);
      return result;
    } catch (error) {
      this.logger.error('Failed to get table bloat', error);
      throw error;
    }
  }

  /**
   * Vacuum analyze tables for optimization
   */
  async vacuumAnalyze(tableName?: string): Promise<void> {
    try {
      if (tableName) {
        await this.dataSource.query(`VACUUM ANALYZE ${tableName}`);
        this.logger.log(`Vacuumed and analyzed table: ${tableName}`);
      } else {
        await this.dataSource.query('VACUUM ANALYZE');
        this.logger.log('Vacuumed and analyzed all tables');
      }
    } catch (error) {
      this.logger.error('Failed to vacuum analyze', error);
      throw error;
    }
  }

  /**
   * Get missing indexes suggestions
   */
  async getMissingIndexes(): Promise<any[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public'
          AND n_distinct > 100
          AND correlation < 0.1
        ORDER BY n_distinct DESC
        LIMIT 20;
      `);
      return result;
    } catch (error) {
      this.logger.error('Failed to get missing indexes', error);
      throw error;
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove parameter values
    return query.replace(/\$\d+/g, '?').substring(0, 500);
  }

  /**
   * Clear query log
   */
  clearLog(): void {
    this.queryLog = [];
    this.logger.log('Query log cleared');
  }
}
