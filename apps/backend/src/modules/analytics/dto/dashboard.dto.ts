import { IsOptional, IsString, IsEnum, IsArray, IsDateString } from 'class-validator';

export enum DashboardType {
  RECRUITING_FUNNEL = 'recruiting_funnel',
  EFFICIENCY = 'efficiency',
  DEI = 'dei',
  EXECUTIVE_SUMMARY = 'executive_summary',
  CUSTOM = 'custom',
}

export class GetDashboardDto {
  @IsEnum(DashboardType)
  type: DashboardType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locationIds?: string[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: any;
  config?: any;
}

export interface DashboardResponse {
  id: string;
  type: DashboardType;
  title: string;
  description: string;
  widgets: DashboardWidget[];
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
  cachedAt?: Date;
}

export class CreateDashboardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DashboardType)
  type: DashboardType;

  @IsArray()
  widgets: {
    type: string;
    title: string;
    config: any;
  }[];
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  widgets?: {
    type: string;
    title: string;
    config: any;
  }[];
}
