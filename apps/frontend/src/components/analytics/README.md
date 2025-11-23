# Analytics UI Components

This directory contains the complete Analytics UI implementation for the recruiting platform, including pre-built dashboards, custom report builder, and report scheduling features.

## Components

### Pre-built Dashboards

#### 1. RecruitingFunnelDashboard
- Displays recruiting funnel metrics (applications → hires)
- Shows conversion rates between stages
- Visualizes drop-off analysis with pie charts
- Includes key metrics cards for quick overview

#### 2. EfficiencyDashboard
- Tracks time-to-fill and time-to-hire metrics
- Shows average time in each pipeline stage
- Displays interviews per hire
- Provides efficiency insights and recommendations

#### 3. DEIDashboard
- Displays demographic breakdown by category (gender, ethnicity, etc.)
- Shows pass rates by demographic groups
- Tracks hiring diversity metrics
- Includes disparity alerts for potential bias detection
- EEOC compliance notes

#### 4. ExecutiveDashboard
- High-level KPIs (total hires, time to fill, offer acceptance, etc.)
- Hiring trends over time
- Department performance comparison
- Key insights and areas for improvement

### Custom Report Builder

#### ReportBuilder
- Drag-and-drop interface for building custom reports
- Data source selection (applications, candidates, interviews, jobs)
- Column selection with custom labels
- Filter configuration with multiple operators
- Aggregation functions (count, sum, avg, min, max)
- Group by functionality

#### ReportList
- Lists all saved custom reports
- Quick actions: generate, export, edit, delete
- Shows report metadata (data source, columns, filters)
- Indicates scheduled reports

#### ReportViewer
- Displays generated report data in table format
- Export functionality (CSV, Excel, PDF)
- Shows report metadata and generation time
- Pagination support

### Report Scheduling & Management

#### ReportSchedule
- Configure automatic report scheduling
- Set frequency (daily, weekly, monthly, quarterly)
- Manage email recipients
- Run reports on-demand
- Pause/resume schedules

#### ReportHistory
- View execution history for each report
- Shows status (completed, failed, running)
- Displays row counts and execution time
- Download previous report executions
- Distinguishes between manual and scheduled runs

## Pages

### AnalyticsPage
Main analytics dashboard page with:
- Tab navigation between different dashboard types
- Time range selector (last 7/30/90 days, 6 months, year, custom)
- Advanced filters (job, department, location)
- Responsive layout

### ReportsPage
Custom reports management page with:
- Report list view
- Create/edit report interface
- Report details configuration
- Scheduling setup
- Report viewer modal

### ReportDetailPage
Detailed view for individual reports with:
- Report configuration display
- Schedule management
- Execution history
- Quick actions (run, export, edit, delete)

## Usage

### Viewing Analytics Dashboards

```tsx
import { AnalyticsPage } from './pages/AnalyticsPage';

// In your router
<Route path="/analytics" element={<AnalyticsPage />} />
```

### Managing Custom Reports

```tsx
import { ReportsPage } from './pages/ReportsPage';

// In your router
<Route path="/reports" element={<ReportsPage />} />
<Route path="/reports/:id" element={<ReportDetailPage />} />
```

### Using Individual Dashboard Components

```tsx
import { RecruitingFunnelDashboard } from './components/analytics';

function MyPage() {
  const filters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    departmentId: 'dept-123',
  };

  return <RecruitingFunnelDashboard filters={filters} />;
}
```

## API Integration

All components use the `analyticsService` from `services/analytics.ts` which provides:

- `getDashboard(type, filters)` - Get pre-built dashboard data
- `getMetrics(params)` - Get specific metrics
- `listReports()` - List all custom reports
- `createReport(data)` - Create new custom report
- `updateReport(id, data)` - Update existing report
- `generateReport(id, format, filters)` - Generate report data
- `exportReport(id, format, filters)` - Export report to file

## Features

### Dashboard Features
- Real-time data visualization with Recharts
- Interactive charts (bar, line, pie)
- Responsive design for all screen sizes
- Cached data support for performance
- Filter and date range selection

### Report Builder Features
- Visual query builder interface
- Multiple data sources
- Complex filtering with various operators
- Aggregation and grouping
- Custom column labels and formatting
- Save and reuse report definitions

### Scheduling Features
- Automated report generation
- Email delivery to multiple recipients
- Flexible frequency options
- Execution history tracking
- Manual run capability

### Export Features
- Multiple format support (CSV, Excel, PDF, JSON)
- Bulk export from report list
- Individual execution downloads
- Formatted data output

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 8.1**: Pre-built dashboards for funnel, efficiency, quality, and diversity metrics
- **Requirement 8.2**: Funnel analytics with stage conversion rates and drop-off analysis
- **Requirement 8.3**: Custom report builder with drag-and-drop interface
- **Requirement 18.2**: DEI analytics dashboard with demographic tracking

## Dependencies

- React 18
- Recharts (for charts and visualizations)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Future Enhancements

- Real-time dashboard updates via WebSocket
- More visualization types (scatter plots, heat maps)
- Advanced filtering with saved filter sets
- Report templates library
- Collaborative report sharing
- Dashboard customization and layout builder
- Mobile app support
