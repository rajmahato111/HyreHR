# Database Setup Guide

Complete guide for setting up and managing the recruiting platform database.

## Quick Start

```bash
# 1. Start Docker services
npm run docker:up

# 2. Run database setup script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

This will:
- ✅ Start PostgreSQL, Redis, and Elasticsearch
- ✅ Run all database migrations
- ✅ Seed initial data
- ✅ Create demo users and sample data

## Manual Setup

If you prefer to run steps manually:

### 1. Start Docker Services

```bash
npm run docker:up
```

Wait for services to be healthy (about 10-15 seconds).

### 2. Run Migrations

```bash
cd apps/backend
npm run migration:run
```

### 3. Seed Database

```bash
npm run seed
```

## Database Schema

### Core Tables

#### organizations
Multi-tenant organization table.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| slug | VARCHAR(100) | URL-friendly identifier (unique) |
| settings | JSONB | Organization settings |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_organizations_slug` on `slug`

#### users
System users with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | Foreign key to organizations |
| email | VARCHAR(255) | User email |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | ENUM | User role (admin, recruiter, etc.) |
| permissions | JSONB | Array of permissions |
| avatar_url | TEXT | Profile picture URL |
| timezone | VARCHAR(50) | User timezone |
| locale | VARCHAR(10) | User locale |
| active | BOOLEAN | Account status |
| last_login | TIMESTAMP | Last login time |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- UNIQUE (organization_id, email)

**Indexes:**
- `idx_users_org` on `organization_id`
- `idx_users_email` on `email`

**User Roles:**
- `admin` - Full system access
- `recruiter` - Manage jobs and candidates
- `hiring_manager` - Review candidates for their jobs
- `interviewer` - Conduct interviews and provide feedback
- `coordinator` - Schedule interviews
- `executive` - View analytics and reports

#### departments
Organizational departments with hierarchical structure.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | Foreign key to organizations |
| name | VARCHAR(255) | Department name |
| parent_id | UUID | Parent department (nullable) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_departments_org` on `organization_id`

#### locations
Office locations and remote work options.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | Foreign key to organizations |
| name | VARCHAR(255) | Location name |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State/Province |
| country | VARCHAR(100) | Country |
| remote | BOOLEAN | Is remote location |
| created_at | TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_locations_org` on `organization_id`

## Seed Data

The initial seed creates:

### Demo Organization
- **Name:** Demo Company
- **Slug:** demo-company
- **Settings:** US timezone, USD currency

### Demo Users

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@demo.com | admin123 | admin | All permissions |
| recruiter@demo.com | recruiter123 | recruiter | Jobs, candidates, applications |

### Sample Departments
- Engineering
- Product
- Sales
- Marketing

### Sample Locations
- San Francisco HQ (SF, CA, USA)
- New York Office (NY, NY, USA)
- Remote - US
- Remote - Global

## Migration Commands

### Run Migrations
```bash
cd apps/backend
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Generate New Migration
```bash
npm run migration:generate -- src/database/migrations/DescriptiveName
```

### Create Empty Migration
```bash
npm run migration:create -- src/database/migrations/DescriptiveName
```

### Check Migration Status
```bash
npm run typeorm -- migration:show -d src/database/data-source.ts
```

## Database Management

### Connect to PostgreSQL

```bash
# Using Docker
docker exec -it recruiting-platform-postgres psql -U postgres -d recruiting_platform_dev

# Using psql directly
psql -h localhost -U postgres -d recruiting_platform_dev
```

### Useful SQL Queries

```sql
-- List all tables
\dt

-- Describe a table
\d users

-- Count records
SELECT COUNT(*) FROM users;

-- View organizations
SELECT id, name, slug FROM organizations;

-- View users with their roles
SELECT email, first_name, last_name, role FROM users;

-- View departments
SELECT name, parent_id FROM departments;
```

### Reset Database

```bash
# Stop containers and remove volumes
npm run docker:down
docker volume rm $(docker volume ls -q | grep recruiting-platform)

# Start fresh
npm run docker:up
./scripts/setup-database.sh
```

## Backup and Restore

### Backup Database

```bash
# Backup to file
docker exec recruiting-platform-postgres pg_dump -U postgres recruiting_platform_dev > backup.sql

# Backup with compression
docker exec recruiting-platform-postgres pg_dump -U postgres recruiting_platform_dev | gzip > backup.sql.gz
```

### Restore Database

```bash
# Restore from file
docker exec -i recruiting-platform-postgres psql -U postgres recruiting_platform_dev < backup.sql

# Restore from compressed file
gunzip -c backup.sql.gz | docker exec -i recruiting-platform-postgres psql -U postgres recruiting_platform_dev
```

## Troubleshooting

### PostgreSQL won't start

```bash
# Check Docker logs
docker logs recruiting-platform-postgres

# Remove and recreate
npm run docker:down
docker volume rm recruiting-platform_postgres_data
npm run docker:up
```

### Migration fails

```bash
# Check migration status
cd apps/backend
npm run typeorm -- migration:show -d src/database/data-source.ts

# Revert and try again
npm run migration:revert
npm run migration:run
```

### Connection refused

1. Verify PostgreSQL is running: `docker ps`
2. Check port 5432 is not in use: `lsof -i :5432`
3. Verify environment variables in `apps/backend/.env`
4. Wait a few seconds after starting Docker

### Seed fails with duplicate key error

```bash
# Drop and recreate database
docker exec -it recruiting-platform-postgres psql -U postgres -c "DROP DATABASE recruiting_platform_dev;"
docker exec -it recruiting-platform-postgres psql -U postgres -c "CREATE DATABASE recruiting_platform_dev;"

# Run migrations and seeds again
cd apps/backend
npm run migration:run
npm run seed
```

## Performance Optimization

### Indexes

All foreign keys and frequently queried columns have indexes:
- Organization slug
- User organization_id and email
- Department organization_id
- Location organization_id

### JSONB Columns

JSONB columns are used for flexible data:
- `organizations.settings` - Organization configuration
- `users.permissions` - User permissions array

Consider adding GIN indexes for JSONB queries:
```sql
CREATE INDEX idx_users_permissions ON users USING GIN (permissions);
```

## Security

### Password Hashing

User passwords are hashed using bcrypt with 10 salt rounds.

### Database Credentials

- **Development:** postgres/postgres (Docker default)
- **Production:** Use strong passwords and rotate regularly
- Store credentials in environment variables, never in code

### Connection Security

- Use SSL/TLS for production database connections
- Restrict database access to application servers only
- Use connection pooling to limit concurrent connections

## Next Steps

After database setup:
1. ✅ Verify migrations ran successfully
2. ✅ Verify seed data was created
3. ✅ Test login with demo users
4. 🚀 Start building features!

## Resources

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-basics.html)
