# Recruiting Platform Documentation

Welcome to the comprehensive documentation for the Recruiting Platform - an all-in-one ATS, CRM, and recruiting solution.

## Documentation Overview

This documentation is organized into three main sections:

### 📚 [API Documentation](./api/README.md)
Complete reference for developers integrating with the platform.

**Contents:**
- RESTful API endpoints
- GraphQL API
- WebSocket events
- Authentication methods
- Rate limiting
- Webhooks
- SDKs and libraries
- Integration guides
- Code examples

**Quick Links:**
- [Getting Started](./api/integration-guides/getting-started.md)
- [Common Use Cases](./api/integration-guides/use-cases.md)
- [API Reference](./api/README.md#api-reference)

### 👥 [User Guide](./user-guide/README.md)
Step-by-step guides for recruiters, hiring managers, and end users.

**Contents:**
- Quick start guide
- Job management
- Candidate management
- Application pipeline
- Interview scheduling
- Communication tools
- AI-powered features
- Analytics and reporting
- Best practices

**Quick Links:**
- [Quick Start](./user-guide/getting-started/quick-start.md)
- [Job Management](./user-guide/features/job-management.md)
- [AI Features](./user-guide/features/ai-features.md)

### ⚙️ [Admin Documentation](./admin/README.md)
Technical guides for system administrators and DevOps teams.

**Contents:**
- Installation and setup
- Configuration
- Security best practices
- Database management
- Monitoring and maintenance
- Troubleshooting
- Deployment guides
- Disaster recovery

**Quick Links:**
- [Installation Guide](./admin/setup/installation.md)
- [Security Best Practices](./admin/security/best-practices.md)
- [Troubleshooting](./admin/troubleshooting/common-issues.md)

## Quick Start

### For Developers
```bash
# Install SDK
npm install @recruiting-platform/sdk

# Initialize client
import { RecruitingPlatform } from '@recruiting-platform/sdk';
const client = new RecruitingPlatform({ apiKey: 'your-key' });

# Make your first API call
const jobs = await client.jobs.list({ status: 'open' });
```

[Full API Documentation →](./api/README.md)

### For Users
1. Sign up at [platform.com](https://platform.com)
2. Create your first job posting
3. Add candidates to your pipeline
4. Schedule interviews
5. Track analytics

[Full User Guide →](./user-guide/getting-started/quick-start.md)

### For Administrators
```bash
# Clone repository
git clone https://github.com/your-org/recruiting-platform.git

# Start with Docker
docker-compose up -d

# Or install manually
npm install
npm run migration:run
npm run start:prod
```

[Full Installation Guide →](./admin/setup/installation.md)

## Key Features

### 🤖 AI-Powered
- Automatic resume parsing
- Candidate-job matching
- Email generation
- Predictive analytics
- Interview transcription
- Bias detection

### 📊 Analytics & Reporting
- Real-time dashboards
- Custom report builder
- Funnel analysis
- Diversity metrics
- Predictive insights

### 🔄 Automation
- Workflow automation
- Email sequences
- SLA monitoring
- Auto-routing
- Scheduled reports

### 🔗 Integrations
- HRIS (BambooHR, Workday, Rippling)
- Calendar (Google, Outlook)
- Job Boards (LinkedIn, Indeed, Glassdoor)
- E-signature (DocuSign)
- Video (Zoom, Google Meet)

### 🔒 Security & Compliance
- SOC 2 Type II certified
- GDPR compliant
- End-to-end encryption
- Multi-factor authentication
- Comprehensive audit logs

## System Requirements

### Minimum
- **CPU**: 4 cores
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Recommended
- **CPU**: 8+ cores
- **RAM**: 32+ GB
- **Storage**: 500 GB SSD
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Search**: Elasticsearch 8+

## Support

### Getting Help

**Documentation**
- API Docs: [docs.platform.com/api](https://docs.platform.com/api)
- User Guide: [docs.platform.com/user-guide](https://docs.platform.com/user-guide)
- Admin Docs: [docs.platform.com/admin](https://docs.platform.com/admin)

**Support Channels**
- Email: support@platform.com
- Live Chat: Available in-app
- Phone: 1-800-RECRUIT
- Community: [community.platform.com](https://community.platform.com)

**Resources**
- Video Tutorials: [YouTube](https://youtube.com/recruitingplatform)
- Webinars: [platform.com/webinars](https://platform.com/webinars)
- Training: [platform.com/training](https://platform.com/training)
- Status Page: [status.platform.com](https://status.platform.com)

### Report Issues

**Bug Reports**
- GitHub: [github.com/platform/issues](https://github.com/platform/issues)
- Email: bugs@platform.com

**Security Issues**
- Email: security@platform.com
- PGP Key: Available on website

**Feature Requests**
- Portal: [feedback.platform.com](https://feedback.platform.com)
- Community: [community.platform.com](https://community.platform.com)

## Contributing

We welcome contributions! See our [Contributing Guide](../CONTRIBUTING.md) for details.

### Ways to Contribute
- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests
- Help other users

## Changelog

### Version 1.0.0 (November 2025)
- Initial release
- Core ATS functionality
- AI-powered features
- Mobile applications
- GDPR compliance
- Enterprise integrations

[View Full Changelog →](./CHANGELOG.md)

## License

Copyright © 2025 Recruiting Platform. All rights reserved.

See [LICENSE](../LICENSE) for details.

## Acknowledgments

Built with:
- Node.js & TypeScript
- React & Tailwind CSS
- PostgreSQL & Redis
- Elasticsearch
- OpenAI GPT-4
- And many other amazing open-source projects

---

**Last Updated**: November 17, 2025  
**Version**: 1.0.0  
**Documentation Version**: 1.0.0

**Questions?** Contact us at docs@platform.com
