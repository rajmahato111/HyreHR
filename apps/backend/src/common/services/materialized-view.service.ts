import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MaterializedViewService {
  private readonly logger = new Logger(MaterializedViewService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Refresh all materialized views
   */
  async refreshAll(): Promise<void> {
    this.logger.log('Refreshing all materialized views');
    try {
      await this.dataSource.query('SELECT refresh_materialized_views()');
      this.logger.log('Successfully refreshed all materialized views');
    } catch (error) {
      this.logger.error('Failed to refresh materialized views', error);
      throw error;
    }
  }

  /**
   * Refresh job metrics materialized view
   */
  async refreshJobMetrics(): Promise<void> {
    this.logger.log('Refreshing job metrics materialized view');
    try {
      await this.dataSource.query(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_metrics',
      );
      this.logger.log('Successfully refreshed job metrics');
    } catch (error) {
      this.logger.error('Failed to refresh job metrics', error);
      throw error;
    }
  }

  /**
   * Refresh pipeline metrics materialized view
   */
  async refreshPipelineMetrics(): Promise<void> {
    this.logger.log('Refreshing pipeline metrics materialized view');
    try {
      await this.dataSource.query(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_metrics',
      );
      this.logger.log('Successfully refreshed pipeline metrics');
    } catch (error) {
      this.logger.error('Failed to refresh pipeline metrics', error);
      throw error;
    }
  }

  /**
   * Refresh candidate engagement materialized view
   */
  async refreshCandidateEngagement(): Promise<void> {
    this.logger.log('Refreshing candidate engagement materialized view');
    try {
      await this.dataSource.query(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_candidate_engagement',
      );
      this.logger.log('Successfully refreshed candidate engagement');
    } catch (error) {
      this.logger.error('Failed to refresh candidate engagement', error);
      throw error;
    }
  }

  /**
   * Scheduled job to refresh materialized views every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledRefresh(): Promise<void> {
    this.logger.log('Running scheduled materialized view refresh');
    await this.refreshAll();
  }

  /**
   * Get job metrics from materialized view
   */
  async getJobMetrics(organizationId: string, jobId?: string): Promise<any[]> {
    const query = `
      SELECT * FROM mv_job_metrics 
      WHERE organization_id = $1
      ${jobId ? 'AND job_id = $2' : ''}
      ORDER BY created_at DESC
    `;
    const params = jobId ? [organizationId, jobId] : [organizationId];
    const result = await this.dataSource.query(query, params);
    return result;
  }

  /**
   * Get pipeline metrics from materialized view
   */
  async getPipelineMetrics(
    organizationId: string,
    jobId?: string,
  ): Promise<any[]> {
    const query = `
      SELECT * FROM mv_pipeline_metrics 
      WHERE organization_id = $1
      ${jobId ? 'AND job_id = $2' : ''}
      ORDER BY order_index ASC
    `;
    const params = jobId ? [organizationId, jobId] : [organizationId];
    const result = await this.dataSource.query(query, params);
    return result;
  }

  /**
   * Get candidate engagement metrics from materialized view
   */
  async getCandidateEngagement(
    organizationId: string,
    candidateId?: string,
  ): Promise<any[]> {
    const query = `
      SELECT * FROM mv_candidate_engagement 
      WHERE organization_id = $1
      ${candidateId ? 'AND candidate_id = $2' : ''}
      ORDER BY last_communication_at DESC NULLS LAST
    `;
    const params = candidateId ? [organizationId, candidateId] : [organizationId];
    const result = await this.dataSource.query(query, params);
    return result;
  }
}
