# Getting Started - Recruiting Platform

Complete guide to set up and run the Recruiting Platform locally for development and testing.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Testing the Application](#testing-the-application)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or later ([Download](https://nodejs.org/))
- **npm**: v9.x or later (comes with Node.js)
- **PostgreSQL**: v15.x or later ([Download](https://www.postgresql.org/download/))
- **Redis**: v7.x or later ([Download](https://redis.io/download))
- **Elasticsearch**: v8.x or later ([Download](https://www.elastic.co/downloads/elasticsearch))

### Optional (Recommended)

- **Docker Desktop**: For containerized setup ([Download](https://www.docker.com/products/docker-desktop))
- **Git**: For version control ([Download](https://git-scm.com/downloads))

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version   # Should be v9.x or higher

# Check PostgreSQL
psql --version  # Should be 15.x or higher

# Check Redis
redis-cli --version  # Should be 7.x or higher

# Check Elasticsearch
curl http://localhost:9200  # Should return cluster info
```

## Quick Start

### Option 1: Using Docker (Recommended for Testing)

```bash
# 1. Clone the repository
git clone <repository-url>
cd recruiting-platform

# 2. Start all services with Docker Compose
docker-compose up -d

# 3. Wait for services to be ready (about 30 seconds)
docker-compose ps

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Option 2: Manual Setup (For Development)

Follow the [Detailed Setup](#detailed-setup) section below.

## Detailed Setup

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ../..
```

### Step 2: Set Up PostgreSQL Database

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql@15

# Linux:
sudo systemctl start postgresql

# Windows: Start from Services or pgAdmin

# Create database and user
psql postgres << EOF
CREATE DATABASE recruiting_platform;
CREATE USER recruiting_user WITH ENCRYPTED PASSWORD 'recruiting_pass';
GRANT ALL PRIVILEGES ON DATABASE recruiting_platform TO recruiting_user;
\q
EOF
```

### Step 3: Set Up Redis

```bash
# Start Redis
# macOS with Homebrew:
brew services start redis

# Linux:
sudo systemctl start redis

# Windows: Start from Services

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### Step 4: Set Up Elasticsearch

```bash
# Start Elasticsearch
# macOS with Homebrew:
brew services start elasticsearch

# Linux:
sudo systemctl start elasticsearch

# Windows: Start from Services

# Verify Elasticsearch is running
curl http://localhost:9200
# Should return cluster information
```

### Step 5: Configure Environment Variables

#### Backend Configuration

```bash
# Create backend .env file
cd apps/backend
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://recruiting_user:recruiting_pass@localhost:5432/recruiting_platform
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# CORS (for local development)
FRONTEND_URL=http://localhost:3000

# Optional: AI Features (for full functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Email (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: File Storage (for resume uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=recruiting-platform-dev
AWS_REGION=us-east-1
```

#### Frontend Configuration

```bash
# Create frontend .env file
cd ../frontend
cp .env.example .env

# Edit .env file
nano .env
```

**Required Environment Variables:**

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Step 6: Initialize Database

```bash
# Run database migrations
cd apps/backend
npm run migration:run

# Seed initial data (optional but recommended)
npm run seed
```

**What gets seeded:**
- Sample departments
- Sample job stages
- Sample interview templates
- Admin user (email: admin@platform.com, password: Admin123!)
- Sample jobs and candidates (for testing)

### Step 7: Build the Applications

```bash
# Build backend
cd apps/backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

## Running the Application

### Development Mode (Recommended)

Run backend and frontend in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

Expected output:
```
[Nest] 12345  - 11/17/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/17/2025, 10:00:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 11/17/2025, 10:00:02 AM     LOG [RoutesResolver] JobsController {/jobs}
[Nest] 12345  - 11/17/2025, 10:00:02 AM     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 11/17/2025, 10:00:02 AM     LOG Application is running on: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Production Mode

```bash
# Start backend
cd apps/backend
npm run start:prod

# Start frontend (in another terminal)
cd apps/frontend
npm run preview
```

### Using Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd apps/backend
pm2 start npm --name "backend" -- run start:prod

# Start frontend
cd ../frontend
pm2 start npm --name "frontend" -- run preview

# View status
pm2 status

# View logs
pm2 logs

# Stop all
pm2 stop all
```

## Testing the Application

### Step 1: Verify Services are Running

```bash
# Check backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-17T10:00:00.000Z"}

# Check database connection
curl http://localhost:3001/health/db

# Check Redis connection
curl http://localhost:3001/health/redis

# Check Elasticsearch connection
curl http://localhost:3001/health/elasticsearch
```

### Step 2: Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

### Step 3: Log In

Use the seeded admin account:

- **Email**: admin@platform.com
- **Password**: Admin123!

### Step 4: Test Core Features

#### 4.1 View Jobs

```bash
# API Test
curl http://localhost:3001/jobs

# Or in browser:
# Navigate to http://localhost:3000/jobs
```

#### 4.2 Create a Job

**Via API:**
```bash
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "We are looking for an experienced software engineer...",
    "departmentId": "dept-uuid",
    "employmentType": "FULL_TIME",
    "status": "OPEN"
  }'
```

**Via UI:**
1. Navigate to http://localhost:3000/jobs
2. Click "Create Job"
3. Fill in the form
4. Click "Save"

#### 4.3 View Candidates

```bash
# API Test
curl http://localhost:3001/candidates

# Or in browser:
# Navigate to http://localhost:3000/candidates
```

#### 4.4 Create a Candidate

**Via UI:**
1. Navigate to http://localhost:3000/candidates
2. Click "Add Candidate"
3. Fill in the form
4. Click "Save"

#### 4.5 Test Search Functionality

```bash
# Search candidates
curl "http://localhost:3001/candidates/search?q=engineer"

# Or in browser:
# Navigate to http://localhost:3000/candidates
# Use the search bar
```

### Step 5: Run Automated Tests

#### Backend Unit Tests

```bash
cd apps/backend
npm test
```

#### Backend E2E Tests

```bash
cd apps/backend
npm run test:e2e
```

#### Frontend Tests

```bash
cd apps/frontend
npm test -- --run
```

### Step 6: Test API with Swagger

1. Navigate to http://localhost:3001/api/docs
2. Click "Authorize" button
3. Enter your JWT token
4. Try different API endpoints

### Step 7: Test End-to-End Flow

**Complete Recruiting Flow:**

1. **Create a Job**
   - Navigate to Jobs → Create Job
   - Fill in details and save

2. **Add a Candidate**
   - Navigate to Candidates → Add Candidate
   - Enter candidate information

3. **Create an Application**
   - Open candidate profile
   - Click "Add to Job"
   - Select the job created in step 1

4. **Move Through Pipeline**
   - Navigate to Jobs → Select your job → Pipeline
   - Drag candidate card to next stage

5. **Schedule Interview**
   - Click on candidate card
   - Click "Schedule Interview"
   - Fill in interview details

6. **Submit Feedback**
   - Navigate to Interviews
   - Find your interview
   - Click "Submit Feedback"

7. **Create Offer**
   - Navigate back to application
   - Click "Create Offer"
   - Fill in offer details

## Troubleshooting

### Backend Won't Start

**Issue**: Port 3001 already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm run dev
```

**Issue**: Database connection error

```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string in .env
cat apps/backend/.env | grep DATABASE_URL

# Test connection manually
psql postgresql://recruiting_user:recruiting_pass@localhost:5432/recruiting_platform
```

**Issue**: Redis connection error

```bash
# Verify Redis is running
redis-cli ping

# Should return "PONG"

# If not running, start it
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

**Issue**: Elasticsearch connection error

```bash
# Verify Elasticsearch is running
curl http://localhost:9200

# If not running, start it
brew services start elasticsearch  # macOS
sudo systemctl start elasticsearch  # Linux
```

### Frontend Won't Start

**Issue**: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Issue**: Cannot connect to backend

```bash
# Verify backend is running
curl http://localhost:3001/health

# Check VITE_API_URL in frontend/.env
cat apps/frontend/.env | grep VITE_API_URL
```

### Database Migration Issues

**Issue**: Migration fails

```bash
# Revert last migration
cd apps/backend
npm run migration:revert

# Try running again
npm run migration:run
```

**Issue**: Database already exists

```bash
# Drop and recreate database
psql postgres << EOF
DROP DATABASE IF EXISTS recruiting_platform;
CREATE DATABASE recruiting_platform;
GRANT ALL PRIVILEGES ON DATABASE recruiting_platform TO recruiting_user;
\q
EOF

# Run migrations again
cd apps/backend
npm run migration:run
```

### Common Errors

**Error**: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error**: "TypeScript compilation errors"

```bash
# Clean build
rm -rf dist
npm run build
```

**Error**: "CORS error in browser"

```bash
# Verify FRONTEND_URL in backend .env
echo $FRONTEND_URL

# Should be: http://localhost:3000
```

## Next Steps

Once the application is running successfully:

1. **Explore the UI**: Navigate through different pages and features
2. **Read the Documentation**: Check out the [User Guide](./docs/user-guide/README.md)
3. **Try the API**: Use the [API Documentation](./docs/api/README.md)
4. **Customize**: Modify settings in the admin panel
5. **Develop**: Start building new features

## Additional Resources

- **User Guide**: [docs/user-guide/README.md](./docs/user-guide/README.md)
- **API Documentation**: [docs/api/README.md](./docs/api/README.md)
- **Admin Guide**: [docs/admin/README.md](./docs/admin/README.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Database Setup**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## Support

Need help? Here's how to get support:

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Community**: Join our community forum
- **Email**: support@platform.com

---

**Last Updated**: November 17, 2025  
**Version**: 1.0.0

Happy recruiting! 🚀
