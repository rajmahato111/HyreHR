import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Interview } from '../../database/entities/interview.entity';
import { Job } from '../../database/entities/job.entity';
import {
  ReportDefinition,
  ReportResult,
  ReportFilter,
  GenerateReportDto,
  ReportFormat,
} from './dto/report.dto';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) { }

  async generateReport(
    organizationId: string,
    reportDto: GenerateReportDto,
    definition: ReportDefinition,
  ): Promise<ReportResult | Buffer> {
    const startDate = reportDto.startDate ? new Date(reportDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = reportDto.endDate ? new Date(reportDto.endDate) : new Date();

    // Build query based on data source
    const data = await this.executeQuery(organizationId, definition, startDate, endDate, reportDto.filters);

    const result: ReportResult = {
      id: reportDto.reportId,
      name: 'Custom Report',
      data,
      metadata: {
        totalRows: data.length,
        generatedAt: new Date(),
        period: {
          startDate,
          endDate,
        },
        filters: reportDto.filters || {},
      },
    };

    // Export in requested format
    switch (reportDto.format) {
      case ReportFormat.CSV:
        return this.exportToCSV(result, definition);
      case ReportFormat.EXCEL:
        return this.exportToExcel(result, definition);
      case ReportFormat.PDF:
        return this.exportToPDF(result, definition);
      case ReportFormat.JSON:
      default:
        return result;
    }
  }

  private async executeQuery(
    organizationId: string,
    definition: ReportDefinition,
    startDate: Date,
    endDate: Date,
    additionalFilters?: Record<string, any>,
  ): Promise<any[]> {
    let queryBuilder: SelectQueryBuilder<any>;

    // Select data source
    switch (definition.dataSource) {
      case 'applications':
        queryBuilder = this.applicationRepository
          .createQueryBuilder('app')
          .leftJoinAndSelect('app.candidate', 'candidate')
          .leftJoinAndSelect('app.job', 'job')
          .leftJoinAndSelect('app.stage', 'stage')
          .where('job.organizationId = :organizationId', { organizationId })
          .andWhere('app.appliedAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        break;

      case 'candidates':
        queryBuilder = this.candidateRepository
          .createQueryBuilder('candidate')
          .where('candidate.organizationId = :organizationId', { organizationId })
          .andWhere('candidate.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        break;

      case 'interviews':
        queryBuilder = this.interviewRepository
          .createQueryBuilder('interview')
          .leftJoinAndSelect('interview.application', 'application')
          .leftJoinAndSelect('application.candidate', 'candidate')
          .leftJoinAndSelect('application.job', 'job')
          .where('job.organizationId = :organizationId', { organizationId })
          .andWhere('interview.scheduledAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        break;

      case 'jobs':
        queryBuilder = this.jobRepository
          .createQueryBuilder('job')
          .leftJoinAndSelect('job.department', 'department')
          .leftJoinAndSelect('job.owner', 'owner')
          .where('job.organizationId = :organizationId', { organizationId })
          .andWhere('job.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        break;

      default:
        throw new Error(`Unsupported data source: ${definition.dataSource}`);
    }

    // Apply filters
    if (definition.filters) {
      for (const filter of definition.filters) {
        this.applyFilter(queryBuilder, filter, definition.dataSource);
      }
    }

    // Apply additional filters
    if (additionalFilters) {
      for (const [field, value] of Object.entries(additionalFilters)) {
        if (value !== undefined && value !== null) {
          queryBuilder.andWhere(`${definition.dataSource}.${field} = :${field}`, { [field]: value });
        }
      }
    }

    // Apply grouping
    if (definition.groupBy && definition.groupBy.length > 0) {
      for (const groupField of definition.groupBy) {
        queryBuilder.addGroupBy(`${definition.dataSource}.${groupField}`);
      }
    }

    // Apply ordering
    if (definition.orderBy && definition.orderBy.length > 0) {
      for (const order of definition.orderBy) {
        queryBuilder.addOrderBy(`${definition.dataSource}.${order.column}`, order.direction);
      }
    }

    const results = await queryBuilder.getMany();

    // Transform results to include only selected columns
    return results.map(row => {
      const transformed: any = {};
      for (const column of definition.columns) {
        const value = this.getNestedValue(row, column.field);
        transformed[column.label] = this.formatValue(value, column.type, column.format);
      }

      // Add aggregations if specified
      if (definition.aggregations) {
        for (const agg of definition.aggregations) {
          // Aggregations would be calculated in a separate query or post-processing
          transformed[agg.label] = null; // Placeholder
        }
      }

      return transformed;
    });
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<any>,
    filter: ReportFilter,
    dataSource: string,
  ): void {
    const field = `${dataSource}.${filter.field}`;
    const paramName = filter.field.replace('.', '_');

    switch (filter.operator) {
      case 'equals':
        queryBuilder.andWhere(`${field} = :${paramName}`, { [paramName]: filter.value });
        break;
      case 'not_equals':
        queryBuilder.andWhere(`${field} != :${paramName}`, { [paramName]: filter.value });
        break;
      case 'contains':
        queryBuilder.andWhere(`${field} ILIKE :${paramName}`, { [paramName]: `%${filter.value}%` });
        break;
      case 'greater_than':
        queryBuilder.andWhere(`${field} > :${paramName}`, { [paramName]: filter.value });
        break;
      case 'less_than':
        queryBuilder.andWhere(`${field} < :${paramName}`, { [paramName]: filter.value });
        break;
      case 'between':
        queryBuilder.andWhere(`${field} BETWEEN :${paramName}Start AND :${paramName}End`, {
          [`${paramName}Start`]: filter.value[0],
          [`${paramName}End`]: filter.value[1],
        });
        break;
      case 'in':
        queryBuilder.andWhere(`${field} IN (:...${paramName})`, { [paramName]: filter.value });
        break;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, type: string, format?: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'date':
        if (format) {
          return new Date(value).toLocaleDateString();
        }
        return value;
      case 'number':
        if (format === 'currency') {
          return `$${Number(value).toFixed(2)}`;
        }
        if (format === 'percentage') {
          return `${Number(value).toFixed(1)}%`;
        }
        return Number(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  private async exportToCSV(result: ReportResult, definition: ReportDefinition): Promise<Buffer> {
    const fields = definition.columns.map(col => ({
      label: col.label,
      value: col.label,
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(result.data);

    return Buffer.from(csv, 'utf-8');
  }

  private async exportToExcel(result: ReportResult, definition: ReportDefinition): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    worksheet.columns = definition.columns.map(col => ({
      header: col.label,
      key: col.label,
      width: 20,
    }));

    // Add data
    worksheet.addRows(result.data);

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add metadata sheet
    const metadataSheet = workbook.addWorksheet('Metadata');
    metadataSheet.addRow(['Report Name', result.name]);
    metadataSheet.addRow(['Generated At', result.metadata.generatedAt.toISOString()]);
    metadataSheet.addRow(['Period Start', result.metadata.period.startDate.toISOString()]);
    metadataSheet.addRow(['Period End', result.metadata.period.endDate.toISOString()]);
    metadataSheet.addRow(['Total Rows', result.metadata.totalRows]);

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private async exportToPDF(result: ReportResult, definition: ReportDefinition): Promise<Buffer> {
    // PDF generation would require a library like pdfkit or puppeteer
    // For now, return a placeholder
    const content = `
      Report: ${result.name}
      Generated: ${result.metadata.generatedAt.toISOString()}
      Period: ${result.metadata.period.startDate.toISOString()} - ${result.metadata.period.endDate.toISOString()}
      Total Rows: ${result.metadata.totalRows}
      
      Data:
      ${JSON.stringify(result.data, null, 2)}
    `;

    return Buffer.from(content, 'utf-8');
  }

  async scheduleReport(
    organizationId: string,
    reportId: string,
    frequency: string,
    recipients: string[],
  ): Promise<void> {
    // This would integrate with a job scheduler like Bull or Agenda
    // For now, we'll just log the scheduling
    console.log(`Scheduled report ${reportId} for ${organizationId} with frequency ${frequency} to ${recipients.join(', ')}`);
  }
}
