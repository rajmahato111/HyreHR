import api from './api';

export enum DashboardType {
  RECRUITING_FUNNEL = 'recruiting_funnel',
  EFFICIENCY = 'efficiency',
  DEI = 'dei',
  EXECUTIVE_SUMMARY = 'executive_summary',
  CUSTOM = 'custom',
}

export enum MetricType {
  FUNNEL = 'funnel',
  EFFICIENCY = 'efficiency',
  QUALITY = 'quality',
  DIVERSITY = 'diversity',
}

export enum TimeRange {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

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

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  jobId?: string;
  departmentId?: string;
  locationIds?: string[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: any;
  config?: any;
}

export interface Dashboard {
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

export interface FunnelMetrics {
  totalApplications: number;
  screeningPassed: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offersExtended: number;
  offersAccepted: number;
  conversionRates: {
    applicationToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerToAcceptance: number;
    overallConversion: number;
  };
  dropOffAnalysis: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export interface EfficiencyMetrics {
  averageTimeToFill: number;
  averageTimeToHire: number;
  averageTimeInStage: {
    stage: string;
    averageDays: number;
  }[];
  interviewsPerHire: number;
  applicationResponseTime: number;
}

export interface QualityMetrics {
  offerAcceptanceRate: number;
  candidateQualityScore: number;
  sourceEffectiveness: {
    source: string;
    applications: number;
    hires: number;
    conversionRate: number;
  }[];
  interviewFeedbackAverage: number;
}

export interface DiversityMetrics {
  demographicBreakdown: {
    category: string;
    value: string;
    count: number;
    percentage: number;
  }[];
  stagePassRates: {
    stage: string;
    demographics: {
      category: string;
      value: string;
      passRate: number;
    }[];
  }[];
  hiringDiversity: {
    category: string;
    value: string;
    hireCount: number;
    percentage: number;
  }[];
}

export interface MetricsResponse {
  funnel?: FunnelMetrics;
  efficiency?: EfficiencyMetrics;
  quality?: QualityMetrics;
  diversity?: DiversityMetrics;
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
}

export interface ReportDefinition {
  dataSource: string;
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

export interface Report {
  id: string;
  name: string;
  description?: string;
  definition: ReportDefinition;
  scheduled: boolean;
  scheduleFrequency?: ReportScheduleFrequency;
  recipients?: string[];
  createdAt: Date;
  updatedAt: Date;
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

export const analyticsService = {
  // Dashboard APIs
  getDashboard: async (type: DashboardType, filters?: DashboardFilters): Promise<Dashboard> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.locationIds) {
      filters.locationIds.forEach(id => params.append('locationIds', id));
    }

    const response = await api.get(`/analytics/dashboards/${type}?${params.toString()}`);
    return response.data;
  },

  listDashboards: async (): Promise<Dashboard[]> => {
    const response = await api.get('/analytics/dashboards');
    return response.data;
  },

  createDashboard: async (data: {
    name: string;
    description?: string;
    type: DashboardType;
    widgets: { type: string; title: string; config: any }[];
  }): Promise<Dashboard> => {
    const response = await api.post('/analytics/dashboards', data);
    return response.data;
  },

  updateDashboard: async (id: string, data: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.put(`/analytics/dashboards/${id}`, data);
    return response.data;
  },

  deleteDashboard: async (id: string): Promise<void> => {
    await api.delete(`/analytics/dashboards/${id}`);
  },

  // Metrics APIs
  getMetrics: async (params: {
    type?: MetricType;
    timeRange?: TimeRange;
    startDate?: string;
    endDate?: string;
    jobId?: string;
    departmentId?: string;
    locationIds?: string[];
  }): Promise<MetricsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.timeRange) queryParams.append('timeRange', params.timeRange);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.jobId) queryParams.append('jobId', params.jobId);
    if (params.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params.locationIds) {
      params.locationIds.forEach(id => queryParams.append('locationIds', id));
    }

    const response = await api.get(`/analytics/metrics?${queryParams.toString()}`);
    return response.data;
  },

  // Report APIs
  listReports: async (): Promise<Report[]> => {
    const response = await api.get('/analytics/reports');
    return response.data;
  },

  getReport: async (id: string): Promise<Report> => {
    const response = await api.get(`/analytics/reports/${id}`);
    return response.data;
  },

  createReport: async (data: {
    name: string;
    description?: string;
    definition: ReportDefinition;
    scheduled?: boolean;
    scheduleFrequency?: ReportScheduleFrequency;
    recipients?: string[];
  }): Promise<Report> => {
    const response = await api.post('/analytics/reports', data);
    return response.data;
  },

  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    const response = await api.put(`/analytics/reports/${id}`, data);
    return response.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/analytics/reports/${id}`);
  },

  generateReport: async (
    reportId: string,
    format: ReportFormat,
    filters?: {
      startDate?: string;
      endDate?: string;
      [key: string]: any;
    }
  ): Promise<ReportResult> => {
    const response = await api.post(`/analytics/reports/${reportId}/generate`, {
      format,
      ...filters,
    });
    return response.data;
  },

  exportReport: async (
    reportId: string,
    format: ReportFormat,
    filters?: {
      startDate?: string;
      endDate?: string;
      [key: string]: any;
    }
  ): Promise<Blob> => {
    const response = await api.post(
      `/analytics/reports/${reportId}/export`,
      {
        format,
        ...filters,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
