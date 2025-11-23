import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsDateString, IsBoolean } from 'class-validator';

export enum ReportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json',
}

export enum ReportScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export class CreateReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  definition: ReportDefinition;

  @IsOptional()
  @IsBoolean()
  scheduled?: boolean;

  @IsOptional()
  @IsEnum(ReportScheduleFrequency)
  scheduleFrequency?: ReportScheduleFrequency;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  definition?: ReportDefinition;

  @IsOptional()
  @IsBoolean()
  scheduled?: boolean;

  @IsOptional()
  @IsEnum(ReportScheduleFrequency)
  scheduleFrequency?: ReportScheduleFrequency;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

export class GenerateReportDto {
  @IsString()
  reportId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export interface ReportDefinition {
  dataSource: string; // 'applications', 'candidates', 'interviews', 'jobs'
  columns: ReportColumn[];
  filters?: ReportFilter[];
  groupBy?: string[];
  orderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  }[];
  aggregations?: ReportAggregation[];
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  format?: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface ReportAggregation {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max';
  label: string;
}

export interface ReportResult {
  id: string;
  name: string;
  description?: string;
  data: any[];
  metadata: {
    totalRows: number;
    generatedAt: Date;
    period: {
      startDate: Date;
      endDate: Date;
    };
    filters: Record<string, any>;
  };
}
