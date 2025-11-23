# Performance Optimization Guide

This document describes the performance optimizations implemented in the recruiting platform backend.

## Overview

The platform implements multiple layers of performance optimization:

1. **Database Query Optimization** - Indexes, materialized views, query optimization
2. **Redis Caching** - Multi-level caching strategy
3. **CDN Integration** - Static asset delivery optimization
4. **API Response Pagination** - Efficient data transfer
5. **Connection Pooling** - Optimized database connections

## 1. Database Query Optimization

### Indexes

The following indexes have been created to optimize common queries:

#### Composite Indexes
- `idx_applications_job_stage_status` - For filtering applications by job, stage, and status
- `idx_applications_candidate_status` - For candidate application history
- `idx_interviews_scheduled_status` - For upcoming interview queries

#### Partial Indexes
- `idx_active_jobs` - Only indexes open jobs
- `idx_active_applications` - Only indexes active, non-archived applications

#### GIN Indexes
- `idx_candidates_tags` - For array-based tag searches
- `idx_jobs_custom_fields` - For JSONB custom field queries
- `idx_candidates_search` - Full-text search on candidate data
- `idx_jobs_search` - Full-text search on job postings

### Materialized Views

Three materialized views are created for analytics performance:

#### mv_job_metrics
Pre-aggregated job statistics including:
- Total applications
- Hires and rejections
- Average time to hire
- Interview counts

```sql
SELECT * FROM mv_job_metrics WHERE organization_id = 'org-id';
```

#### mv_pipeline_metrics
Pipeline stage analytics including:
- Candidate counts per stage
- Average time in stage
- Conversion rates

```sql
SELECT * FROM mv_pipeline_metrics WHERE job_id = 'job-id';
```

#### mv_candidate_engagement
Candidate activity metrics including:
- Application count
- Interview count
- Communication count
- Last activity dates

```sql
SELECT * FROM mv_candidate_engagement WHERE candidate_id = 'candidate-id';
```

### Refreshing Materialized Views

Materialized views are automatically refreshed every hour via a scheduled job. Manual refresh:

```typescript
// Refresh all views
await materializedViewService.refreshAll();

// Refresh specific view
await materializedViewService.refreshJobMetrics();
await materializedViewService.refreshPipelineMetrics();
await materializedViewService.refreshCandidateEngagement();
```

### Query Optimization Helper

Use the `QueryOptimizerHelper` for common query patterns:

```typescript
import { QueryOptimizerHelper } from './common/helpers/query-optimizer.helper';

// Apply pagination
const query = repository.createQueryBuilder('job');
QueryOptimizerHelper.applyPagination(query, { page: 1, limit: 20 });

// Apply field selection
QueryOptimizerHelper.applyFieldSelection(query, ['id', 'title', 'status']);

// Apply full-text search
QueryOptimizerHelper.applyFullTextSearch(query, 'software engineer', ['title', 'description']);

// Apply filters
QueryOptimizerHelper.applyFilters(query, { status: 'open', departmentId: 'dept-id' });

// Explain query for debugging
const plan = await QueryOptimizerHelper.explainQuery(query);
```

## 2. Redis Caching

### Cache Layers

The platform implements a three-tier caching strategy:

#### L1 Cache: User Data (5 minutes)
```typescript
await cacheService.cacheUser(userId, userData, 300);
const user = await cacheService.getUser(userId);
```

#### L2 Cache: Computed Data (15 minutes)
```typescript
await cacheService.cacheJobApplications(jobId, applications, 900);
const apps = await cacheService.getJobApplications(jobId);
```

#### L3 Cache: Analytics (1 hour)
```typescript
await cacheService.cacheDashboardData(dashboardId, data, 3600);
const dashboard = await cacheService.getDashboardData(dashboardId);
```

### Cache Invalidation

Invalidate cache when data changes:

```typescript
// Invalidate specific job cache
await cacheService.invalidateJobCache(jobId);

// Invalidate candidate cache
await cacheService.invalidateCandidateCache(candidateId);

// Invalidate by pattern
await cacheService.invalidatePattern('dashboard:*');
```

### Using Cache Decorator

Apply caching to controller methods:

```typescript
import { Cacheable } from './common/decorators/cache.decorator';

@Get(':id')
@Cacheable('job:{id}', 300) // Cache for 5 minutes
async getJob(@Param('id') id: string) {
  return this.jobsService.findOne(id);
}
```

## 3. CDN Integration

### File Upload with CDN

The `CDNService` handles file uploads to S3 with CloudFront CDN:

```typescript
// Upload resume
const url = await cdnService.uploadResume(
  candidateId,
  'resume.pdf',
  buffer,
  'application/pdf'
);

// Upload avatar
const avatarUrl = await cdnService.uploadAvatar(
  userId,
  buffer,
  'image/jpeg'
);

// Upload company logo
const logoUrl = await cdnService.uploadLogo(
  organizationId,
  buffer,
  'image/png'
);
```

### Cache Headers

Set appropriate cache headers for different asset types:

```typescript
// Static assets (1 year cache)
const headers = cdnService.getCacheHeaders('static');

// Dynamic content (5 minutes cache)
const headers = cdnService.getCacheHeaders('dynamic');

// Private content (no cache)
const headers = cdnService.getCacheHeaders('private');
```

### Optimized Image URLs

Generate optimized image URLs with transformations:

```typescript
// Get optimized image URL
const url = cdnService.getOptimizedImageUrl(
  'avatars/user-123.jpg',
  200,  // width
  200,  // height
  'webp' // format
);
```

## 4. API Response Pagination

### Using Pagination DTO

All list endpoints should use pagination:

```typescript
import { PaginationDto, PaginationHelper } from './common/dto/pagination.dto';

@Get()
async findAll(@Query() pagination: PaginationDto) {
  const [data, total] = await this.repository.findAndCount({
    skip: PaginationHelper.getOffset(pagination.page, pagination.limit),
    take: pagination.limit,
    order: {
      [pagination.sortBy]: pagination.sortOrder.toUpperCase(),
    },
  });

  return PaginationHelper.createResponse(data, pagination.page, pagination.limit, total);
}
```

### Cursor-Based Pagination

For large datasets, use cursor-based pagination:

```typescript
const query = repository.createQueryBuilder('entity');
QueryOptimizerHelper.applyCursorPagination(
  query,
  cursor,
  20,
  'id',
  'DESC'
);
```

## 5. Connection Pooling

### Database Configuration

Connection pooling is configured in `database.config.ts`:

```typescript
extra: {
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
  statement_timeout: 30000,   // 30 seconds
  query_timeout: 30000,       // 30 seconds
}
```

### Environment Variables

Configure pool size via environment variables:

```env
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

## Performance Monitoring

### Performance Monitor Service

Monitor query performance and database statistics:

```typescript
// Get performance metrics
const metrics = performanceMonitorService.getMetrics();

// Get database statistics
const stats = await performanceMonitorService.getDatabaseStats();

// Get slow queries
const slowQueries = await performanceMonitorService.getSlowQueries(10);

// Analyze specific query
const plan = await performanceMonitorService.analyzeQuery(query);

// Get table bloat
const bloat = await performanceMonitorService.getTableBloat();

// Vacuum analyze tables
await performanceMonitorService.vacuumAnalyze('applications');
```

### Monitoring Endpoints

Performance monitoring endpoints (admin only):

```
GET /api/performance/metrics
GET /api/performance/database-stats
GET /api/performance/slow-queries
GET /api/performance/table-bloat
POST /api/performance/vacuum-analyze
```

## Best Practices

### 1. Always Use Pagination

```typescript
// ❌ Bad - No pagination
@Get()
async findAll() {
  return this.repository.find();
}

// ✅ Good - With pagination
@Get()
async findAll(@Query() pagination: PaginationDto) {
  // ... paginated response
}
```

### 2. Use Field Selection

```typescript
// ❌ Bad - Returns all fields
const jobs = await repository.find();

// ✅ Good - Select only needed fields
const jobs = await repository.find({
  select: ['id', 'title', 'status'],
});
```

### 3. Avoid N+1 Queries

```typescript
// ❌ Bad - N+1 queries
const jobs = await repository.find();
for (const job of jobs) {
  job.applications = await applicationsRepository.find({ jobId: job.id });
}

// ✅ Good - Single query with join
const jobs = await repository.find({
  relations: ['applications'],
});
```

### 4. Use Caching for Expensive Operations

```typescript
// ❌ Bad - No caching
@Get('dashboard')
async getDashboard() {
  return this.calculateDashboard(); // Expensive operation
}

// ✅ Good - With caching
@Get('dashboard')
@Cacheable('dashboard:{organizationId}', 3600)
async getDashboard() {
  return this.calculateDashboard();
}
```

### 5. Invalidate Cache on Updates

```typescript
@Put(':id')
async update(@Param('id') id: string, @Body() data: any) {
  const result = await this.service.update(id, data);
  
  // Invalidate related caches
  await this.cacheService.invalidateJobCache(id);
  
  return result;
}
```

### 6. Use Materialized Views for Analytics

```typescript
// ❌ Bad - Complex aggregation on every request
const metrics = await repository
  .createQueryBuilder('job')
  .leftJoin('job.applications', 'app')
  .select('COUNT(app.id)', 'count')
  .groupBy('job.id')
  .getRawMany();

// ✅ Good - Use materialized view
const metrics = await materializedViewService.getJobMetrics(organizationId);
```

### 7. Monitor Query Performance

```typescript
const startTime = Date.now();
const result = await repository.find();
const executionTime = Date.now() - startTime;

performanceMonitorService.logQuery(
  'SELECT * FROM jobs',
  executionTime,
  result.length
);
```

## Performance Targets

The platform aims to meet these performance targets:

- **API Response Time**: < 200ms (95th percentile)
- **Page Load Time**: < 2 seconds (95th percentile)
- **Database Query Time**: < 100ms (95th percentile)
- **Cache Hit Rate**: > 80%
- **Concurrent Users**: 10,000+
- **Uptime**: 99.9%

## Troubleshooting

### Slow Queries

1. Check slow query log:
```typescript
const slowQueries = await performanceMonitorService.getSlowQueries();
```

2. Analyze query execution plan:
```typescript
const plan = await performanceMonitorService.analyzeQuery(query);
```

3. Check for missing indexes:
```typescript
const missing = await performanceMonitorService.getMissingIndexes();
```

### High Memory Usage

1. Check table bloat:
```typescript
const bloat = await performanceMonitorService.getTableBloat();
```

2. Run vacuum analyze:
```typescript
await performanceMonitorService.vacuumAnalyze();
```

### Cache Issues

1. Check Redis connection:
```bash
redis-cli ping
```

2. Monitor cache hit rate:
```typescript
const metrics = performanceMonitorService.getMetrics();
console.log('Cache hit rate:', metrics.cacheHitRate);
```

3. Clear cache if needed:
```typescript
await cacheService.invalidatePattern('*');
```

## Maintenance

### Daily Tasks

- Monitor slow queries
- Check error logs
- Review performance metrics

### Weekly Tasks

- Analyze table bloat
- Review cache hit rates
- Check database statistics

### Monthly Tasks

- Vacuum analyze all tables
- Review and optimize indexes
- Update materialized views schema if needed
- Performance load testing

## Additional Resources

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [TypeORM Caching](https://typeorm.io/caching)
