# End-to-End Testing Guide

Complete guide to test the Recruiting Platform from setup to running all features.

## Test Environment Setup

### Prerequisites Check

Run these commands to verify your environment:

```bash
# Check Node.js (should be v18+)
node --version

# Check npm (should be v9+)
npm --version

# Check Docker (optional but recommended)
docker --version
docker-compose --version
```

## Test Plan

### Phase 1: Infrastructure Setup

#### Test 1.1: Start Services with Docker

```bash
# Start all required services
docker-compose up -d

# Expected output:
# Creating recruiting-platform-postgres ... done
# Creating recruiting-platform-redis ... done
# Creating recruiting-platform-elasticsearch ... done

# Verify services are running
docker-compose ps

# Expected: All services should show "Up" status
```

**Verification:**
```bash
# Test PostgreSQL
docker exec recruiting-platform-postgres pg_isready -U postgres
# Expected: postgres:5432 - accepting connections

# Test Redis
docker exec recruiting-platform-redis redis-cli ping
# Expected: PONG

# Test Elasticsearch
curl http://localhost:9200
# Expected: JSON response with cluster info
```

#### Test 1.2: Install Dependencies

```bash
# Install all dependencies
npm install

# Expected: No errors, all packages installed successfully

# Verify installation
ls node_modules | wc -l
# Expected: Should show number of installed packages
```

### Phase 2: Backend Setup and Testing

#### Test 2.1: Configure Backend

```bash
cd apps/backend

# Check if .env.example exists
ls -la | grep .env

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recruiting_platform_dev
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=test-jwt-secret-key-for-development-only
SESSION_SECRET=test-session-secret-key-for-development-only

# CORS
FRONTEND_URL=http://localhost:3000

# Optional (can be added later)
# OPENAI_API_KEY=sk-your-key-here
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
EOF

# Verify .env file
cat .env
```

#### Test 2.2: Run Database Migrations

```bash
# Still in apps/backend directory

# Run migrations
npm run migration:run

# Expected output:
# query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'migrations'
# query: CREATE TABLE "migrations" ...
# Migration CreateUserTable has been executed successfully
# Migration CreateJobsTable has been executed successfully
# ... (more migrations)

# Verify migrations
docker exec recruiting-platform-postgres psql -U postgres -d recruiting_platform_dev -c "\dt"

# Expected: List of tables (users, jobs, candidates, applications, etc.)
```

#### Test 2.3: Seed Database

```bash
# Seed initial data
npm run seed

# Expected output:
# Seeding database...
# Created departments
# Created users
# Created jobs
# Created candidates
# Seeding completed successfully!
```

#### Test 2.4: Build Backend

```bash
# Build the backend
npm run build

# Expected: Compilation successful, dist folder created

# Verify build
ls -la dist/
# Expected: main.js and other compiled files
```

#### Test 2.5: Start Backend Server

```bash
# Start backend in development mode
npm run dev

# Expected output:
# [Nest] INFO [NestFactory] Starting Nest application...
# [Nest] INFO [InstanceLoader] AppModule dependencies initialized
# [Nest] INFO [RoutesResolver] JobsController {/jobs}
# [Nest] INFO [RoutesResolver] CandidatesController {/candidates}
# [Nest] INFO [RoutesResolver] ApplicationsController {/applications}
# [Nest] INFO [RoutesResolver] InterviewsController {/interviews}
# [Nest] INFO [NestApplication] Nest application successfully started
# [Nest] INFO Application is running on: http://localhost:3001
```

**Keep this terminal open and open a new terminal for the next tests**

#### Test 2.6: Test Backend Health Endpoints

In a new terminal:

```bash
# Test main health endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-17T..."}

# Test database health
curl http://localhost:3001/health/db

# Expected response:
# {"status":"ok","database":"connected"}

# Test Redis health
curl http://localhost:3001/health/redis

# Expected response:
# {"status":"ok","redis":"connected"}

# Test Elasticsearch health
curl http://localhost:3001/health/elasticsearch

# Expected response:
# {"status":"ok","elasticsearch":"connected"}
```

#### Test 2.7: Test API Endpoints

```bash
# Test GET /jobs
curl http://localhost:3001/jobs

# Expected: JSON array of jobs (may be empty or have seeded data)

# Test GET /candidates
curl http://localhost:3001/candidates

# Expected: JSON array of candidates

# Test API documentation
curl http://localhost:3001/api/docs

# Expected: HTML response (Swagger UI)
```

### Phase 3: Frontend Setup and Testing

#### Test 3.1: Configure Frontend

Open a new terminal:

```bash
cd apps/frontend

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
EOF

# Verify .env file
cat .env
```

#### Test 3.2: Build Frontend

```bash
# Build the frontend
npm run build

# Expected: Build successful, dist folder created

# Verify build
ls -la dist/
# Expected: index.html, assets folder with JS and CSS files
```

#### Test 3.3: Start Frontend Server

```bash
# Start frontend in development mode
npm run dev

# Expected output:
# VITE v5.0.8  ready in 1234 ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

**Keep this terminal open**

### Phase 4: End-to-End Application Testing

#### Test 4.1: Access Application

Open your browser and navigate to: http://localhost:3000

**Expected:**
- Application loads without errors
- Login page is displayed
- No console errors in browser DevTools

#### Test 4.2: Login

**Test with seeded admin account:**
- Email: `admin@platform.com`
- Password: `Admin123!`

**Expected:**
- Successful login
- Redirect to dashboard
- User menu shows logged-in user

#### Test 4.3: Test Jobs Module

**4.3.1 View Jobs List**
- Navigate to Jobs page
- **Expected**: List of jobs displayed (if seeded)

**4.3.2 Create New Job**
1. Click "Create Job" button
2. Fill in form:
   - Title: "Test Software Engineer"
   - Department: Select from dropdown
   - Employment Type: "Full-time"
   - Status: "Open"
   - Description: "This is a test job posting"
3. Click "Save"

**Expected:**
- Success message displayed
- New job appears in jobs list
- Job has unique ID

**4.3.3 View Job Details**
- Click on the created job
- **Expected**: Job details page with all information

**4.3.4 Edit Job**
- Click "Edit" button
- Change title to "Senior Test Software Engineer"
- Click "Save"
- **Expected**: Job updated successfully

#### Test 4.4: Test Candidates Module

**4.4.1 View Candidates List**
- Navigate to Candidates page
- **Expected**: List of candidates displayed

**4.4.2 Create New Candidate**
1. Click "Add Candidate" button
2. Fill in form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@test.com"
   - Phone: "+1234567890"
3. Click "Save"

**Expected:**
- Success message displayed
- New candidate appears in list

**4.4.3 Search Candidates**
- Use search bar to search for "John"
- **Expected**: Search results show John Doe

**4.4.4 View Candidate Profile**
- Click on John Doe
- **Expected**: Candidate profile page with details

#### Test 4.5: Test Applications Module

**4.5.1 Create Application**
1. From John Doe's profile, click "Add to Job"
2. Select the test job created earlier
3. Select initial stage: "Applied"
4. Click "Create Application"

**Expected:**
- Application created successfully
- Application appears in job's pipeline

**4.5.2 View Pipeline**
- Navigate to Jobs → Select test job → Pipeline tab
- **Expected**: Kanban board with John Doe in "Applied" stage

**4.5.3 Move Application**
- Drag John Doe's card to "Phone Screen" stage
- **Expected**: Card moves successfully, stage updated

#### Test 4.6: Test Interviews Module

**4.6.1 Schedule Interview**
1. From application, click "Schedule Interview"
2. Fill in details:
   - Type: "Phone Screen"
   - Date: Tomorrow
   - Time: 2:00 PM
   - Duration: 30 minutes
3. Click "Schedule"

**Expected:**
- Interview scheduled successfully
- Interview appears in interviews list

**4.6.2 View Interviews**
- Navigate to Interviews page
- **Expected**: Scheduled interview is listed

**4.6.3 Submit Feedback (Optional)**
- Click on interview
- Click "Submit Feedback"
- Fill in feedback form
- **Expected**: Feedback submitted successfully

#### Test 4.7: Test Analytics Module

**4.7.1 View Dashboard**
- Navigate to Analytics page
- **Expected**: Dashboard with metrics displayed

**4.7.2 View Reports**
- Click on "Reports" tab
- **Expected**: List of available reports

#### Test 4.8: Test API Documentation

**4.8.1 Access Swagger UI**
- Navigate to http://localhost:3001/api/docs
- **Expected**: Swagger UI loads with API documentation

**4.8.2 Test API Endpoint**
1. Find "GET /jobs" endpoint
2. Click "Try it out"
3. Click "Execute"
- **Expected**: Response with jobs data

### Phase 5: API Testing

#### Test 5.1: Authentication

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin123!"
  }'

# Expected response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "...",
#     "email": "admin@platform.com",
#     "role": "admin"
#   }
# }

# Save the token for next tests
export TOKEN="<paste-access-token-here>"
```

#### Test 5.2: CRUD Operations

**Create Job via API:**
```bash
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API Test Job",
    "description": "Created via API",
    "departmentId": "<department-id>",
    "employmentType": "FULL_TIME",
    "status": "OPEN"
  }'

# Expected: 201 Created with job data
```

**Get Jobs via API:**
```bash
curl http://localhost:3001/jobs \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with array of jobs
```

**Update Job via API:**
```bash
curl -X PATCH http://localhost:3001/jobs/<job-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated API Test Job"
  }'

# Expected: 200 OK with updated job data
```

**Delete Job via API:**
```bash
curl -X DELETE http://localhost:3001/jobs/<job-id> \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK or 204 No Content
```

### Phase 6: Performance Testing

#### Test 6.1: Load Test (Simple)

```bash
# Test concurrent requests
for i in {1..10}; do
  curl http://localhost:3001/jobs &
done
wait

# Expected: All requests complete successfully
```

#### Test 6.2: Response Time

```bash
# Measure response time
time curl http://localhost:3001/jobs

# Expected: Response time < 500ms
```

### Phase 7: Error Handling Testing

#### Test 7.1: Invalid Requests

```bash
# Test with invalid data
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": ""
  }'

# Expected: 400 Bad Request with validation errors
```

#### Test 7.2: Unauthorized Access

```bash
# Test without token
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }'

# Expected: 401 Unauthorized
```

#### Test 7.3: Not Found

```bash
# Test with non-existent ID
curl http://localhost:3001/jobs/non-existent-id \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

## Test Results Checklist

### Infrastructure ✓
- [ ] Docker services started successfully
- [ ] PostgreSQL accessible
- [ ] Redis accessible
- [ ] Elasticsearch accessible

### Backend ✓
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Database migrations ran successfully
- [ ] Database seeded
- [ ] Backend builds without errors
- [ ] Backend starts successfully
- [ ] Health endpoints respond correctly
- [ ] API endpoints accessible

### Frontend ✓
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Frontend builds without errors
- [ ] Frontend starts successfully
- [ ] Application loads in browser
- [ ] No console errors

### Features ✓
- [ ] User can login
- [ ] Jobs CRUD operations work
- [ ] Candidates CRUD operations work
- [ ] Applications can be created
- [ ] Pipeline drag-and-drop works
- [ ] Interviews can be scheduled
- [ ] Analytics dashboard loads
- [ ] API documentation accessible

### API Testing ✓
- [ ] Authentication works
- [ ] CRUD operations via API work
- [ ] Error handling works correctly
- [ ] Response times acceptable

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9200  # Elasticsearch

# Stop conflicting processes or use different ports
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker logs recruiting-platform-postgres

# Verify connection
docker exec recruiting-platform-postgres psql -U postgres -c "SELECT 1"
```

### Frontend Can't Connect to Backend

```bash
# Verify backend is running
curl http://localhost:3001/health

# Check CORS settings in backend
# Check VITE_API_URL in frontend/.env
```

## Cleanup

After testing, clean up resources:

```bash
# Stop backend and frontend (Ctrl+C in their terminals)

# Stop Docker services
docker-compose down

# Remove volumes (optional, removes all data)
docker-compose down -v

# Clean node_modules (optional)
rm -rf node_modules apps/*/node_modules
```

## Success Criteria

The application passes end-to-end testing if:

1. ✅ All services start without errors
2. ✅ Backend API responds to all health checks
3. ✅ Frontend loads and displays UI correctly
4. ✅ User can login successfully
5. ✅ All CRUD operations work for Jobs and Candidates
6. ✅ Applications can be created and moved through pipeline
7. ✅ Interviews can be scheduled
8. ✅ API endpoints respond correctly
9. ✅ No critical errors in logs
10. ✅ Response times are acceptable (<500ms for simple queries)

---

**Test Date**: November 17, 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing
