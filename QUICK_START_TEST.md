# Quick Start Test - Recruiting Platform

This is a simplified guide to quickly test the application locally.

## Prerequisites

Ensure you have installed:
- Node.js v18+ and npm v9+
- Docker Desktop (for easy setup)

## Quick Test Steps

### Step 1: Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and Elasticsearch with Docker
docker-compose up -d

# Wait 30 seconds for services to initialize
sleep 30

# Verify services are running
docker-compose ps
```

**Expected Output:**
```
NAME                                  STATUS
recruiting-platform-postgres          Up (healthy)
recruiting-platform-redis             Up (healthy)
recruiting-platform-elasticsearch     Up (healthy)
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd apps/backend

# Install dependencies (if not already done)
npm install

# Create environment file
cp .env.example .env

# Edit .env to use Docker services
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recruiting_platform_dev
# REDIS_URL=redis://localhost:6379
# ELASTICSEARCH_URL=http://localhost:9200

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed

# Start backend server
npm run dev
```

**Expected Output:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application is running on: http://localhost:3001
```

### Step 3: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd apps/frontend

# Install dependencies (if not already done)
npm install

# Create environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3001

# Start frontend server
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 1234 ms
➜  Local:   http://localhost:3000/
```

### Step 4: Test the Application

#### 4.1 Test Backend Health

Open a new terminal:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}
```

#### 4.2 Test Frontend

Open browser and navigate to:
- http://localhost:3000

**Expected:**
- Application loads
- Login page displayed
- No errors in browser console

#### 4.3 Login

Use seeded admin credentials:
- Email: `admin@platform.com`
- Password: `Admin123!`

**Expected:**
- Successful login
- Dashboard displayed

#### 4.4 Test Core Features

1. **Jobs**: Navigate to Jobs page, view list
2. **Candidates**: Navigate to Candidates page, view list
3. **Create Job**: Click "Create Job", fill form, save
4. **Create Candidate**: Click "Add Candidate", fill form, save

## Verification Checklist

- [ ] Docker services running
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login successfully
- [ ] Can view jobs list
- [ ] Can view candidates list
- [ ] Can create new job
- [ ] Can create new candidate

## Common Issues

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill the process
kill -9 <PID>
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Restart Docker Desktop if needed

# Check logs
docker-compose logs
```

### Database Connection Error

```bash
# Verify PostgreSQL is accessible
docker exec recruiting-platform-postgres pg_isready

# Check connection string in .env
```

## Stop Everything

```bash
# Stop backend and frontend (Ctrl+C in their terminals)

# Stop Docker services
docker-compose down

# Optional: Remove all data
docker-compose down -v
```

## Next Steps

Once basic testing is complete:

1. Read [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup
2. Read [END_TO_END_TEST_GUIDE.md](./END_TO_END_TEST_GUIDE.md) for comprehensive testing
3. Explore [docs/](./docs/) for full documentation

---

**Quick Start Version**: 1.0.0  
**Last Updated**: November 17, 2025
