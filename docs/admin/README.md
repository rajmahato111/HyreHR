# Administrator Documentation

Comprehensive guide for system administrators managing the Recruiting Platform.

## Table of Contents

### Setup and Configuration
- [Installation Guide](./setup/installation.md)
- [Initial Configuration](./setup/configuration.md)
- [Database Setup](./setup/database.md)
- [Environment Variables](./setup/environment.md)

### Security
- [Security Best Practices](./security/best-practices.md)
- [Authentication Configuration](./security/authentication.md)
- [Data Encryption](./security/encryption.md)
- [Audit Logging](./security/audit-logs.md)
- [GDPR Compliance](./security/gdpr.md)

### System Management
- [User Management](./management/users.md)
- [Organization Settings](./management/organization.md)
- [Integrations](./management/integrations.md)
- [Backup and Recovery](./management/backup.md)

### Monitoring and Maintenance
- [Performance Monitoring](./monitoring/performance.md)
- [Health Checks](./monitoring/health-checks.md)
- [Log Management](./monitoring/logs.md)
- [Troubleshooting](./troubleshooting/common-issues.md)

### Deployment
- [Production Deployment](./deployment/production.md)
- [Scaling Guide](./deployment/scaling.md)
- [CI/CD Pipeline](./deployment/cicd.md)
- [Disaster Recovery](./deployment/disaster-recovery.md)

## Quick Reference

### System Requirements

**Minimum Requirements**
- **CPU**: 4 cores
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Network**: 100 Mbps

**Recommended for Production**
- **CPU**: 8+ cores
- **RAM**: 32+ GB
- **Storage**: 500 GB SSD (with auto-scaling)
- **Network**: 1 Gbps
- **Database**: PostgreSQL 15+ (managed service recommended)
- **Cache**: Redis 7+ (managed service recommended)
- **Search**: Elasticsearch 8+ (managed service recommended)

### Supported Platforms

**Cloud Providers**
- ✅ AWS (recommended)
- ✅ Google Cloud Platform
- ✅ Microsoft Azure
- ✅ DigitalOcean
- ✅ Self-hosted

**Operating Systems**
- Ubuntu 20.04 LTS or later
- Debian 11 or later
- CentOS 8 or later
- macOS (development only)

**Databases**
- PostgreSQL 15+ (required)
- Redis 7+ (required)
- Elasticsearch 8+ (required)

### Default Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Web App | 3000 | HTTP/HTTPS | Frontend application |
| API | 3001 | HTTP/HTTPS | Backend API |
| PostgreSQL | 5432 | TCP | Database |
| Redis | 6379 | TCP | Cache and queues |
| Elasticsearch | 9200 | HTTP | Search engine |
| WebSocket | 3002 | WS/WSS | Real-time updates |

### Key Configuration Files

```
/config
├── database.config.ts      # Database connection
├── redis.config.ts         # Redis configuration
├── elasticsearch.config.ts # Search configuration
├── auth.config.ts          # Authentication settings
├── email.config.ts         # Email provider settings
└── integrations.config.ts  # Third-party integrations

/.env                        # Environment variables
/docker-compose.yml         # Docker configuration
/kubernetes/                # K8s manifests
```

## Security Overview

### Authentication Methods

**Supported Methods**
- Email/Password with bcrypt hashing
- OAuth 2.0 (Google, Microsoft, LinkedIn)
- SAML 2.0 (Enterprise SSO)
- Multi-Factor Authentication (TOTP)
- API Keys for integrations

### Data Protection

**Encryption**
- Data at rest: AES-256
- Data in transit: TLS 1.3
- Sensitive fields: Application-level encryption
- Key management: AWS KMS or HashiCorp Vault

**Compliance**
- GDPR compliant
- SOC 2 Type II certified
- CCPA compliant
- ISO 27001 aligned

### Access Control

**Role-Based Access Control (RBAC)**
- Admin: Full system access
- Recruiter: Manage jobs and candidates
- Hiring Manager: View and approve
- Interviewer: Submit feedback
- Coordinator: Schedule interviews
- Executive: View analytics only

## Monitoring and Alerts

### Key Metrics to Monitor

**Application Metrics**
- Request rate and latency
- Error rate
- Active users
- Database connections
- Cache hit rate
- Queue depth

**Infrastructure Metrics**
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput
- Database performance
- Cache performance

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time | >500ms | >2s |
| Error Rate | >1% | >5% |
| CPU Usage | >70% | >90% |
| Memory Usage | >80% | >95% |
| Disk Usage | >80% | >95% |
| Database Connections | >70% | >90% |

### Recommended Tools

**Monitoring**
- Datadog (recommended)
- New Relic
- Prometheus + Grafana
- CloudWatch (AWS)

**Error Tracking**
- Sentry (recommended)
- Rollbar
- Bugsnag

**Log Management**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs

## Backup and Recovery

### Backup Strategy

**Database Backups**
- Full backup: Daily at 2 AM UTC
- Incremental: Every 6 hours
- Retention: 30 days
- Location: S3 with versioning

**File Storage Backups**
- Resumes and documents: Continuous replication
- Location: S3 with cross-region replication
- Retention: Indefinite (GDPR compliant deletion)

**Configuration Backups**
- Version controlled in Git
- Encrypted secrets in Vault
- Daily snapshots

### Recovery Procedures

**Recovery Time Objectives (RTO)**
- Database: < 1 hour
- Application: < 30 minutes
- File storage: < 15 minutes

**Recovery Point Objectives (RPO)**
- Database: < 6 hours
- File storage: < 1 hour
- Configuration: < 24 hours

## Performance Optimization

### Database Optimization

**Indexing Strategy**
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Full-text search indexes

**Query Optimization**
- Use connection pooling (max 100 connections)
- Enable query caching
- Implement read replicas for analytics
- Use materialized views for dashboards

### Caching Strategy

**Redis Caching**
- User sessions: 24 hours
- API responses: 5 minutes
- Search results: 10 minutes
- Analytics data: 1 hour

**CDN Caching**
- Static assets: 1 year
- Resumes: No cache (private)
- Profile images: 30 days

### Scaling Guidelines

**Horizontal Scaling**
- API servers: Auto-scale based on CPU (target 70%)
- Worker processes: Scale based on queue depth
- Database: Read replicas for analytics queries

**Vertical Scaling**
- Database: Upgrade when CPU > 80% sustained
- Cache: Upgrade when memory > 90%
- Search: Upgrade when query latency > 500ms

## Troubleshooting

### Common Issues

**High API Latency**
1. Check database query performance
2. Review cache hit rates
3. Analyze slow queries
4. Check external API timeouts
5. Review application logs

**Database Connection Errors**
1. Check connection pool settings
2. Verify database is running
3. Check network connectivity
4. Review connection limits
5. Check for long-running queries

**Email Delivery Issues**
1. Verify SMTP credentials
2. Check email quota
3. Review spam settings
4. Verify DNS records (SPF, DKIM)
5. Check email provider status

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
export LOG_LEVEL=debug

# Or in .env file
LOG_LEVEL=debug
DEBUG=true
```

### Health Check Endpoints

```bash
# Application health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/health/db

# Redis health
curl http://localhost:3001/health/redis

# Elasticsearch health
curl http://localhost:3001/health/elasticsearch

# Full system health
curl http://localhost:3001/health/all
```

## Maintenance Windows

### Recommended Schedule

**Weekly Maintenance**
- Day: Sunday
- Time: 2:00 AM - 4:00 AM UTC
- Duration: Up to 2 hours
- Activities:
  - Database optimization
  - Cache clearing
  - Log rotation
  - Security updates

**Monthly Maintenance**
- Day: First Sunday of month
- Time: 2:00 AM - 6:00 AM UTC
- Duration: Up to 4 hours
- Activities:
  - Major updates
  - Database migrations
  - Infrastructure changes
  - Performance tuning

### Maintenance Checklist

**Pre-Maintenance**
- [ ] Notify users 48 hours in advance
- [ ] Create database backup
- [ ] Test rollback procedure
- [ ] Prepare runbook
- [ ] Assemble on-call team

**During Maintenance**
- [ ] Enable maintenance mode
- [ ] Execute changes
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Verify functionality

**Post-Maintenance**
- [ ] Disable maintenance mode
- [ ] Monitor for issues
- [ ] Review logs
- [ ] Update documentation
- [ ] Send completion notice

## Support and Resources

### Getting Help

**Technical Support**
- Email: admin-support@platform.com
- Slack: #platform-admins
- Phone: 1-800-RECRUIT (priority support)
- Portal: support.platform.com

**Documentation**
- Admin Docs: docs.platform.com/admin
- API Docs: docs.platform.com/api
- Status Page: status.platform.com

**Community**
- Forum: community.platform.com
- GitHub: github.com/platform
- Stack Overflow: [recruiting-platform]

### Training and Certification

**Admin Training**
- Self-paced course: 8 hours
- Live training: Monthly webinars
- Certification: Platform Admin Certified

**Topics Covered**
- Installation and configuration
- Security best practices
- Performance optimization
- Troubleshooting
- Disaster recovery

### Service Level Agreements (SLA)

**Uptime Guarantee**
- Standard: 99.5% uptime
- Premium: 99.9% uptime
- Enterprise: 99.95% uptime

**Support Response Times**
- Critical: < 1 hour
- High: < 4 hours
- Medium: < 24 hours
- Low: < 48 hours

## Changelog

### Version 1.0.0 (November 2025)
- Initial release
- Core ATS functionality
- AI-powered features
- Mobile applications
- GDPR compliance
- Enterprise integrations

### Upcoming Features
- Advanced workflow automation
- Enhanced analytics
- Additional integrations
- Performance improvements

---

**Last Updated**: November 17, 2025  
**Version**: 1.0.0  
**Maintained by**: Platform Engineering Team
