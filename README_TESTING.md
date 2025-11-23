# Recruiting Platform - Testing & Setup Guide

Welcome! This guide will help you set up, run, and test the Recruiting Platform.

## 📚 Documentation Index

### Quick Links

| Document | Purpose | Time Required |
|----------|---------|---------------|
| [QUICK_START_TEST.md](./QUICK_START_TEST.md) | Rapid setup and basic testing | 10-15 min |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Complete setup guide | 30-60 min |
| [END_TO_END_TEST_GUIDE.md](./END_TO_END_TEST_GUIDE.md) | Comprehensive testing | 2-3 hours |
| [APPLICATION_TESTING_SUMMARY.md](./APPLICATION_TESTING_SUMMARY.md) | Testing overview and status | 5 min read |

### Full Documentation

| Category | Document | Description |
|----------|----------|-------------|
| **User Docs** | [docs/user-guide/](./docs/user-guide/) | End-user documentation |
| **API Docs** | [docs/api/](./docs/api/) | API reference and integration guides |
| **Admin Docs** | [docs/admin/](./docs/admin/) | System administration guides |
| **Database** | [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Database configuration |
| **Contributing** | [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |

## 🚀 Quick Start

### Option 1: Docker (Fastest)

```bash
# 1. Start services
docker-compose up -d

# 2. Setup backend
cd apps/backend
npm install
npm run migration:run
npm run seed
npm run dev

# 3. Setup frontend (new terminal)
cd apps/frontend
npm install
npm run dev

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Option 2: Manual Setup

Follow the detailed guide in [GETTING_STARTED.md](./GETTING_STARTED.md)

## 🧪 Testing Paths

### Path 1: Quick Verification (10 minutes)

**Goal**: Verify basic functionality

1. Follow [QUICK_START_TEST.md](./QUICK_START_TEST.md)
2. Start services with Docker
3. Run backend and frontend
4. Login and test basic features

**Use When**:
- First time setup
- Quick smoke test
- Verifying fixes

### Path 2: Full Setup (1 hour)

**Goal**: Complete development environment

1. Follow [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Install all prerequisites
3. Configure all services
4. Set up optional features
5. Run comprehensive tests

**Use When**:
- Setting up development environment
- Preparing for feature development
- Full system verification

### Path 3: Comprehensive Testing (2-3 hours)

**Goal**: Test all features systematically

1. Follow [END_TO_END_TEST_GUIDE.md](./END_TO_END_TEST_GUIDE.md)
2. Test infrastructure
3. Test backend thoroughly
4. Test frontend thoroughly
5. Test all features
6. Test API independently
7. Performance testing

**Use When**:
- Quality assurance
- Pre-release testing
- Regression testing
- Validating major changes

## 📋 Testing Checklist

### Prerequisites ✓
- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] Docker installed (recommended)
- [ ] PostgreSQL available
- [ ] Redis available
- [ ] Elasticsearch available

### Infrastructure ✓
- [ ] Docker services running
- [ ] PostgreSQL accessible
- [ ] Redis accessible
- [ ] Elasticsearch accessible

### Backend ✓
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Migrations completed
- [ ] Database seeded
- [ ] Server starts successfully
- [ ] Health checks pass
- [ ] API endpoints respond

### Frontend ✓
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Application builds
- [ ] Server starts successfully
- [ ] Loads in browser
- [ ] No console errors

### Features ✓
- [ ] Login works
- [ ] Jobs CRUD works
- [ ] Candidates CRUD works
- [ ] Applications work
- [ ] Pipeline works
- [ ] Interviews work
- [ ] Analytics work

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                   http://localhost:3000                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (NestJS)                    │
│                   http://localhost:3001                  │
└─────┬──────────┬──────────┬──────────────────────────┬──┘
      │          │          │                          │
      ▼          ▼          ▼                          ▼
┌──────────┐ ┌────────┐ ┌──────────────┐ ┌────────────────┐
│PostgreSQL│ │ Redis  │ │Elasticsearch │ │External Services│
│  :5432   │ │ :6379  │ │    :9200     │ │  (Optional)    │
└──────────┘ └────────┘ └──────────────┘ └────────────────┘
```

## 🔧 Common Commands

### Development

```bash
# Start all services
docker-compose up -d

# Start backend (development mode)
cd apps/backend && npm run dev

# Start frontend (development mode)
cd apps/frontend && npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Database

```bash
# Run migrations
cd apps/backend && npm run migration:run

# Revert migration
npm run migration:revert

# Seed database
npm run seed

# Create new migration
npm run migration:create -- MigrationName
```

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart postgres

# Remove all data
docker-compose down -v
```

## 🐛 Troubleshooting

### Quick Fixes

**Port already in use:**
```bash
# Find and kill process
lsof -i :3000  # or :3001
kill -9 <PID>
```

**Database connection error:**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres
# or
pg_isready
```

**Frontend can't connect to backend:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify VITE_API_URL in frontend/.env
cat apps/frontend/.env
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Detailed Troubleshooting

See the troubleshooting sections in:
- [GETTING_STARTED.md#troubleshooting](./GETTING_STARTED.md#troubleshooting)
- [END_TO_END_TEST_GUIDE.md#troubleshooting](./END_TO_END_TEST_GUIDE.md#troubleshooting)
- [docs/admin/troubleshooting/](./docs/admin/troubleshooting/)

## 📊 Test Status

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | All guides ready |
| Backend Code | ✅ Complete | Fully implemented |
| Frontend Code | ✅ Complete | Fully implemented |
| Docker Setup | ✅ Ready | docker-compose.yml configured |
| E2E Tests | ⚠️ Needs Fix | TypeScript errors |
| Unit Tests | ✅ Exist | Need execution |
| Manual Testing | ⏳ Pending | Ready to execute |

### Known Issues

1. **E2E Tests**: TypeScript compilation errors (missing type annotations)
2. **Test Database**: Not configured separately from dev database
3. **Test Coverage**: Limited frontend component tests

See [TEST_STATUS_SUMMARY.md](./TEST_STATUS_SUMMARY.md) for details.

## 🎯 Success Criteria

The application is ready when:

✅ All services start without errors  
✅ Backend API responds to health checks  
✅ Frontend loads in browser  
✅ User can login  
✅ CRUD operations work for Jobs and Candidates  
✅ Applications can be created and managed  
✅ No critical errors in logs  

## 📞 Support

### Getting Help

- **Documentation**: Check the docs folder
- **Issues**: Create a GitHub issue
- **Questions**: Check existing documentation first

### Useful Links

- **API Documentation**: http://localhost:3001/api/docs (when running)
- **User Guide**: [docs/user-guide/](./docs/user-guide/)
- **API Guide**: [docs/api/](./docs/api/)
- **Admin Guide**: [docs/admin/](./docs/admin/)

## 🎓 Learning Path

### For New Developers

1. Read [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Set up development environment
3. Run [QUICK_START_TEST.md](./QUICK_START_TEST.md)
4. Explore the codebase
5. Read [CONTRIBUTING.md](./CONTRIBUTING.md)

### For QA Engineers

1. Read [APPLICATION_TESTING_SUMMARY.md](./APPLICATION_TESTING_SUMMARY.md)
2. Set up test environment
3. Execute [END_TO_END_TEST_GUIDE.md](./END_TO_END_TEST_GUIDE.md)
4. Document findings
5. Report issues

### For DevOps Engineers

1. Review [docs/admin/setup/installation.md](./docs/admin/setup/installation.md)
2. Review [docs/admin/security/best-practices.md](./docs/admin/security/best-practices.md)
3. Set up staging environment
4. Configure monitoring
5. Prepare production deployment

## 📝 Next Steps

After successful setup and testing:

1. **Customize**: Configure for your organization
2. **Integrate**: Connect external services (email, calendar, etc.)
3. **Deploy**: Follow production deployment guide
4. **Monitor**: Set up monitoring and logging
5. **Train**: Train users on the platform

---

**Version**: 1.0.0  
**Last Updated**: November 17, 2025  
**Status**: Ready for Testing

**Happy Testing! 🚀**
