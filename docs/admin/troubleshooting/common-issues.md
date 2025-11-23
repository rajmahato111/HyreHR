# Common Issues and Troubleshooting

Quick solutions to common problems administrators encounter with the Recruiting Platform.

## Table of Contents

1. [Application Issues](#application-issues)
2. [Database Issues](#database-issues)
3. [Performance Issues](#performance-issues)
4. [Integration Issues](#integration-issues)
5. [Email Issues](#email-issues)
6. [Authentication Issues](#authentication-issues)
7. [Deployment Issues](#deployment-issues)

## Application Issues

### Application Won't Start

**Symptoms:**
- Server fails to start
- Port already in use error
- Module not found errors

**Solutions:**

**1. Check if port is already in use**
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>

# Or change port in .env
PORT=3002
```

**2. Install missing dependencies**
```bash
cd apps/backend
npm install

cd ../frontend
npm install
```

**3. Check environment variables**
```bash
# Verify all required variables are set
cat .env

# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - ELASTICSEARCH_URL
# - JWT_SECRET
# - SESSION_SECRET
```

**4. Check logs for specific errors**
```bash
# PM2 logs
pm2 logs backend

# Docker logs
docker-compose logs backend

# System logs
journalctl -u recruiting-platform -n 100
```

### High Memory Usage

**Symptoms:**
- Application becomes slow
- Out of memory errors
- Server crashes

**Solutions:**

**1. Check memory usage**
```bash
# Overall system memory
free -h

# Process memory
ps aux --sort=-%mem | head -10

# Node.js heap usage
node --max-old-space-size=4096 app.js
```

**2. Identify memory leaks**
```bash
# Enable heap snapshots
node --inspect app.js

# Use Chrome DevTools to analyze
# chrome://inspect
```

**3. Optimize queries**
```typescript
// Use pagination
const candidates = await candidateRepository.find({
  take: 20,
  skip: page * 20,
});

// Use select to limit fields
const candidates = await candidateRepository.find({
  select: ['id', 'firstName', 'lastName', 'email'],
});

// Clear cache periodically
await redis.flushdb();
```

**4. Increase memory limit**
```bash
# In package.json
"start": "node --max-old-space-size=4096 dist/main.js"

# Or in PM2 ecosystem
module.exports = {
  apps: [{
    name: 'backend',
    script: './dist/main.js',
    node_args: '--max-old-space-size=4096'
  }]
};
```

### Application Crashes Randomly

**Symptoms:**
- Unexpected shutdowns
- Process exits without error
- Intermittent availability

**Solutions:**

**1. Check for unhandled exceptions**
```typescript
// Add global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Graceful shutdown
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

**2. Enable process manager auto-restart**
```bash
# PM2 auto-restart
pm2 start app.js --name backend --max-restarts 10

# Docker restart policy
docker run --restart=unless-stopped
```

**3. Monitor resource limits**
```bash
# Check system limits
ulimit -a

# Increase file descriptors
ulimit -n 65536

# Make permanent in /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
```

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- Connection timeout errors
- Authentication failed
- Database not found

**Solutions:**

**1. Verify database is running**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check if listening
sudo netstat -plnt | grep 5432
```

**2. Test connection**
```bash
# Test with psql
psql -h localhost -U recruiting_user -d recruiting

# Test with connection string
psql postgresql://recruiting_user:password@localhost:5432/recruiting
```

**3. Check credentials**
```bash
# Verify .env file
cat .env | grep DATABASE_URL

# Reset password if needed
sudo -u postgres psql
ALTER USER recruiting_user WITH PASSWORD 'new_password';
```

**4. Check firewall rules**
```bash
# Allow PostgreSQL port
sudo ufw allow 5432/tcp

# Check iptables
sudo iptables -L -n | grep 5432
```

### Slow Database Queries

**Symptoms:**
- API requests timeout
- High database CPU usage
- Long query execution times

**Solutions:**

**1. Identify slow queries**
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**2. Add missing indexes**
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
ORDER BY n_distinct DESC;

-- Add indexes
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
```

**3. Optimize queries**
```typescript
// Use eager loading
const applications = await applicationRepository.find({
  relations: ['candidate', 'job', 'stage'],
});

// Use query builder for complex queries
const results = await applicationRepository
  .createQueryBuilder('app')
  .leftJoinAndSelect('app.candidate', 'candidate')
  .where('app.jobId = :jobId', { jobId })
  .andWhere('app.status = :status', { status: 'active' })
  .getMany();
```

**4. Vacuum and analyze**
```sql
-- Vacuum database
VACUUM ANALYZE;

-- Auto-vacuum settings
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
```

### Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" error
- Connection timeout
- Application hangs

**Solutions:**

**1. Check current connections**
```sql
-- View active connections
SELECT count(*) FROM pg_stat_activity;

-- View connections by database
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '10 minutes';
```

**2. Adjust connection pool settings**
```typescript
// TypeORM configuration
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'recruiting_user',
  password: 'password',
  database: 'recruiting',
  extra: {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}
```

**3. Increase PostgreSQL max connections**
```sql
-- Check current limit
SHOW max_connections;

-- Increase limit
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

## Performance Issues

### Slow API Response Times

**Symptoms:**
- Requests take > 2 seconds
- Timeout errors
- Poor user experience

**Solutions:**

**1. Enable caching**
```typescript
// Cache frequently accessed data
@Cacheable('jobs', 300) // 5 minutes
async findAll() {
  return this.jobRepository.find();
}

// Cache search results
const cacheKey = `search:${query}`;
let results = await redis.get(cacheKey);

if (!results) {
  results = await this.search(query);
  await redis.setex(cacheKey, 600, JSON.stringify(results));
}
```

**2. Optimize database queries**
```typescript
// Use select to limit fields
const jobs = await jobRepository.find({
  select: ['id', 'title', 'status'],
});

// Use pagination
const [jobs, total] = await jobRepository.findAndCount({
  take: 20,
  skip: page * 20,
});

// Use indexes
@Index(['email'])
@Index(['status', 'createdAt'])
```

**3. Implement CDN for static assets**
```typescript
// Configure CloudFront
const cdnUrl = process.env.CDN_URL;

// Serve static files from CDN
app.use('/static', express.static('public', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));
```

**4. Use compression**
```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### High CPU Usage

**Symptoms:**
- Server becomes unresponsive
- Slow response times
- CPU at 100%

**Solutions:**

**1. Identify CPU-intensive processes**
```bash
# Top processes
top -o %CPU

# Node.js profiling
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

**2. Optimize algorithms**
```typescript
// Use efficient data structures
// Bad: O(n²)
for (const candidate of candidates) {
  for (const job of jobs) {
    calculateMatch(candidate, job);
  }
}

// Good: O(n)
const jobMap = new Map(jobs.map(j => [j.id, j]));
for (const candidate of candidates) {
  const job = jobMap.get(candidate.jobId);
  calculateMatch(candidate, job);
}
```

**3. Use worker threads for heavy tasks**
```typescript
import { Worker } from 'worker_threads';

// Offload resume parsing to worker
const worker = new Worker('./resume-parser-worker.js');
worker.postMessage({ resumeFile });

worker.on('message', (parsedData) => {
  // Handle result
});
```

**4. Implement rate limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use('/api/', limiter);
```

## Integration Issues

### Calendar Integration Not Working

**Symptoms:**
- Cannot sync calendar
- Events not creating
- Authorization errors

**Solutions:**

**1. Verify OAuth credentials**
```bash
# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Test OAuth flow
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_CLIENT_ID" \
  -d "client_secret=$GOOGLE_CLIENT_SECRET" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "grant_type=refresh_token"
```

**2. Refresh access token**
```typescript
async refreshAccessToken(userId: string) {
  const integration = await this.getIntegration(userId, 'google_calendar');
  
  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: integration.refreshToken,
    grant_type: 'refresh_token',
  });
  
  await this.updateIntegration(userId, {
    accessToken: response.data.access_token,
  });
}
```

**3. Check API quotas**
```bash
# View Google API quotas
# https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/quotas

# Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

### HRIS Integration Failing

**Symptoms:**
- Employee data not syncing
- API errors
- Authentication failures

**Solutions:**

**1. Verify API credentials**
```bash
# Test BambooHR API
curl -u "API_KEY:x" \
  https://api.bamboohr.com/api/gateway.php/SUBDOMAIN/v1/employees/directory

# Test Workday API
curl -X GET \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  https://wd2-impl-services1.workday.com/ccx/service/TENANT/Human_Resources/v1/Workers
```

**2. Check API rate limits**
```typescript
// Implement rate limiting
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200, // 5 requests per second
});

const syncEmployee = limiter.wrap(async (employeeData) => {
  return await hrisApi.createEmployee(employeeData);
});
```

**3. Handle API errors gracefully**
```typescript
async syncToHRIS(candidateId: string) {
  try {
    const result = await hrisService.createEmployee(candidateId);
    await this.logSuccess(candidateId, result);
  } catch (error) {
    if (error.response?.status === 409) {
      // Employee already exists, update instead
      await hrisService.updateEmployee(candidateId);
    } else {
      await this.logError(candidateId, error);
      await this.queueRetry(candidateId);
    }
  }
}
```

## Email Issues

### Emails Not Sending

**Symptoms:**
- Emails stuck in queue
- SMTP errors
- Delivery failures

**Solutions:**

**1. Verify SMTP configuration**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Test with swaks
swaks --to recipient@example.com \
  --from sender@example.com \
  --server smtp.gmail.com:587 \
  --auth LOGIN \
  --auth-user sender@example.com \
  --auth-password "app-password"
```

**2. Check email queue**
```bash
# View email queue
npm run email:queue:status

# Retry failed emails
npm run email:queue:retry

# Clear stuck emails
npm run email:queue:clear
```

**3. Verify DNS records**
```bash
# Check SPF record
dig TXT yourcompany.com

# Check DKIM record
dig TXT default._domainkey.yourcompany.com

# Check DMARC record
dig TXT _dmarc.yourcompany.com
```

**4. Check email provider limits**
```typescript
// Implement rate limiting for emails
const emailLimiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100, // 10 emails per second
  reservoir: 500, // 500 emails per hour
  reservoirRefreshAmount: 500,
  reservoirRefreshInterval: 60 * 60 * 1000,
});
```

### Emails Going to Spam

**Symptoms:**
- Low delivery rate
- Emails in spam folder
- High bounce rate

**Solutions:**

**1. Configure SPF record**
```dns
; SPF record
yourcompany.com. IN TXT "v=spf1 include:_spf.google.com ~all"
```

**2. Configure DKIM**
```dns
; DKIM record
default._domainkey.yourcompany.com. IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCS..."
```

**3. Configure DMARC**
```dns
; DMARC record
_dmarc.yourcompany.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourcompany.com"
```

**4. Improve email content**
```typescript
// Avoid spam triggers
const spamWords = ['free', 'urgent', 'act now', 'limited time'];

// Use proper HTML structure
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Title</title>
</head>
<body>
  <p>Content here</p>
  <p>
    <a href="https://platform.com/unsubscribe">Unsubscribe</a>
  </p>
</body>
</html>
`;
```

## Authentication Issues

### Users Cannot Log In

**Symptoms:**
- Invalid credentials error
- Account locked
- Session expired

**Solutions:**

**1. Verify user exists**
```sql
SELECT id, email, active, locked_until
FROM users
WHERE email = 'user@example.com';
```

**2. Reset password**
```bash
# Generate password reset token
npm run auth:reset-password -- --email=user@example.com

# Or reset directly
npm run auth:set-password -- --email=user@example.com --password=newpassword
```

**3. Unlock account**
```sql
-- Unlock user account
UPDATE users
SET locked_until = NULL,
    failed_login_attempts = 0
WHERE email = 'user@example.com';
```

**4. Clear sessions**
```bash
# Clear all sessions for user
redis-cli KEYS "sess:*user-id*" | xargs redis-cli DEL

# Or clear all sessions
redis-cli FLUSHDB
```

### MFA Not Working

**Symptoms:**
- Invalid MFA code
- QR code not scanning
- Backup codes not working

**Solutions:**

**1. Verify time sync**
```bash
# Check system time
date

# Sync with NTP
sudo ntpdate -s time.nist.gov

# Enable NTP
sudo timedatectl set-ntp true
```

**2. Reset MFA**
```bash
# Disable MFA for user
npm run auth:disable-mfa -- --email=user@example.com

# User can re-enable in settings
```

**3. Generate new backup codes**
```bash
npm run auth:generate-backup-codes -- --email=user@example.com
```

## Deployment Issues

### Docker Container Won't Start

**Symptoms:**
- Container exits immediately
- Health check failing
- Port binding errors

**Solutions:**

**1. Check container logs**
```bash
# View logs
docker logs container-name

# Follow logs
docker logs -f container-name

# View last 100 lines
docker logs --tail 100 container-name
```

**2. Inspect container**
```bash
# Inspect container
docker inspect container-name

# Check health status
docker inspect --format='{{.State.Health.Status}}' container-name
```

**3. Debug interactively**
```bash
# Run container with shell
docker run -it --entrypoint /bin/bash image-name

# Execute command in running container
docker exec -it container-name /bin/bash
```

**4. Check port conflicts**
```bash
# Find process using port
sudo lsof -i :3001

# Use different port
docker run -p 3002:3001 image-name
```

### Kubernetes Pod Crashing

**Symptoms:**
- Pod in CrashLoopBackOff
- Pod evicted
- OOMKilled

**Solutions:**

**1. Check pod logs**
```bash
# View logs
kubectl logs pod-name

# View previous logs
kubectl logs pod-name --previous

# Follow logs
kubectl logs -f pod-name
```

**2. Describe pod**
```bash
# Get pod details
kubectl describe pod pod-name

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

**3. Increase resources**
```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

**4. Check liveness/readiness probes**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 60  # Increase if app takes time to start
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

## Getting Help

### Diagnostic Information

When contacting support, provide:

```bash
# System information
uname -a
cat /etc/os-release

# Application version
npm run version

# Service status
systemctl status recruiting-platform

# Recent logs
journalctl -u recruiting-platform -n 100

# Resource usage
free -h
df -h
top -b -n 1 | head -20

# Network connectivity
ping -c 4 api.platform.com
curl -I https://api.platform.com/health
```

### Support Channels

- **Email**: support@platform.com
- **Slack**: #platform-support
- **Phone**: 1-800-RECRUIT
- **Portal**: support.platform.com

### Emergency Contacts

For critical issues:
- **On-call Engineer**: +1-555-ONCALL
- **Security Issues**: security@platform.com
- **Status Page**: status.platform.com

---

**Last Updated**: November 17, 2025  
**Need More Help?** Contact support@platform.com
