# Performance Optimization Quick Start

## Setup

### 1. Install Dependencies
```bash
cd apps/backend
npm install
```

### 2. Configure Environment
Add to `.env`:
```env
# Database
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# CDN
CDN_DOMAIN=your-cloudfront-domain.cloudfront.net
```

### 3. Start Redis
```bash
# macOS with Homebrew
brew services start redis

# Or run directly
redis-server
```

### 4. Run Migration
```bash
npm run migration:run
```

### 5. Verify Setup
```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Check database indexes
psql -d recruiting_platform_dev -c "SELECT * FROM pg_indexes WHERE schemaname = 'public' LIMIT 5;"

# Check materialized views
psql -d recruiting_platform_dev -c "SELECT * FROM mv_job_metrics LIMIT 5;"
```

## Quick Usage

### Caching

```typescript
import { CacheService } from './common/services/cache.service';

// Inject in constructor
constructor(private cacheService: CacheService) {}

// Cache data
await this.cacheService.set('key', data, 300); // 5 minutes

// Get cached data
const data = await this.cacheService.get('key');

// Invalidate cache
await this.cacheService.del('key');
await this.cacheService.invalidatePattern('job:*');
```

### Pagination

```typescript
import { PaginationDto, PaginationHelper } from './common/dto/pagination.dto';

@Get()
async findAll(@Query() pagination: PaginationDto) {
  const [data, total] = await this.repository.findAndCount({
    skip: PaginationHelper.getOffset(pagination.page, pagination.limit),
    take: pagination.limit,
    order: { [pagination.sortBy]: pagination.sortOrder.toUpperCase() },
  });

  return PaginationHelper.createResponse(data, pagination.page, pagination.limit, total);
}
```

### Query Optimization

```typescript
import { QueryOptimizerHelper } from './common/helpers/query-optimizer.helper';

const query = this.repository.createQueryBuilder('job');

// Apply pagination
QueryOptimizerHelper.applyPagination(query, pagination);

// Apply search
QueryOptimizerHelper.applyFullTextSearch(query, searchTerm, ['title', 'description']);

// Apply filters
QueryOptimizerHelper.applyFilters(query, { status: 'open' });

const results = await query.getMany();
```

### CDN Upload

```typescript
import { CDNService } from './common/services/cdn.service';

constructor(private cdnService: CDNService) {}

// Upload file
const url = await this.cdnService.uploadResume(
  candidateId,
  filename,
  buffer,
  contentType
);

// Get optimized image URL
const imageUrl = this.cdnService.getOptimizedImageUrl(
  key,
  200,  // width
  200,  // height
  'webp'
);
```

### Materialized Views

```typescript
import { MaterializedViewService } from './common/services/materialized-view.service';

constructor(private mvService: MaterializedViewService) {}

// Get pre-computed metrics
const jobMetrics = await this.mvService.getJobMetrics(organizationId);
const pipelineMetrics = await this.mvService.getPipelineMetrics(organizationId, jobId);

// Refresh views
await this.mvService.refreshAll();
```

## Performance Monitoring

### API Endpoints (Admin Only)

```bash
# Get performance metrics
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/metrics

# Get database stats
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/database-stats

# Get slow queries
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/slow-queries?limit=10

# Refresh materialized views
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/refresh-materialized-views

# Clear cache
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/clear-cache
```

### Database Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check cache hit ratio
SELECT 
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Refresh materialized views manually
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_metrics;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_metrics;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_candidate_engagement;
```

### Redis Commands

```bash
# Check Redis connection
redis-cli ping

# List all keys
redis-cli KEYS '*'

# Get cache value
redis-cli GET 'user:123'

# Check memory usage
redis-cli INFO memory

# Clear all cache
redis-cli FLUSHALL

# Monitor cache operations
redis-cli MONITOR
```

## Common Issues

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Slow Queries
```typescript
// Check slow queries
const slowQueries = await performanceMonitorService.getSlowQueries(10);

// Analyze specific query
const plan = await performanceMonitorService.analyzeQuery(query);

// Add missing indexes
const suggestions = await performanceMonitorService.getMissingIndexes();
```

### High Memory Usage
```bash
# Check table bloat
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/table-bloat

# Run VACUUM ANALYZE
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/performance/vacuum-analyze
```

### Cache Not Working
```typescript
// Verify Redis connection
const isConnected = await cacheService.get('test');

// Check cache service logs
// Look for "Redis Client Connected" in logs

// Clear cache and retry
await cacheService.invalidatePattern('*');
```

## Best Practices

1. **Always paginate** list endpoints
2. **Use caching** for expensive operations
3. **Invalidate cache** when data changes
4. **Monitor slow queries** regularly
5. **Refresh materialized views** hourly
6. **Use field selection** to reduce data transfer
7. **Avoid N+1 queries** with eager loading
8. **Set appropriate cache TTLs** based on data volatility

## Performance Checklist

- [ ] Redis is running and connected
- [ ] Database migration has been run
- [ ] Materialized views are created
- [ ] Indexes are in place
- [ ] Connection pooling is configured
- [ ] Cache service is working
- [ ] CDN is configured (if using)
- [ ] Performance monitoring endpoints are accessible
- [ ] Scheduled jobs are running (materialized view refresh)

## Next Steps

1. Review `PERFORMANCE_OPTIMIZATION.md` for detailed documentation
2. Set up monitoring and alerting
3. Configure CloudFront CDN for production
4. Tune cache TTLs based on usage patterns
5. Set up automated performance testing

## Support

For detailed documentation, see:
- `apps/backend/PERFORMANCE_OPTIMIZATION.md` - Complete guide
- `PERFORMANCE_OPTIMIZATION_SUMMARY.md` - Implementation summary
