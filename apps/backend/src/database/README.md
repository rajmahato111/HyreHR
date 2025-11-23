# Database Management

This directory contains database entities, migrations, and seeds for the recruiting platform.

## Structure

```
database/
├── entities/           # TypeORM entities
│   ├── organization.entity.ts
│   ├── user.entity.ts
│   ├── department.entity.ts
│   ├── location.entity.ts
│   └── index.ts
├── migrations/         # Database migrations
│   └── 1700000000000-InitialSchema.ts
├── seeds/             # Seed data for development
│   ├── initial-seed.ts
│   └── run-seed.ts
├── data-source.ts     # TypeORM data source configuration
└── README.md
```

## Entities

### Core Entities

1. **Organization** - Multi-tenant organization
2. **User** - System users with roles and permissions
3. **Department** - Organizational departments
4. **Location** - Office locations and remote options

## Migrations

### Running Migrations

```bash
# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate a new migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create an empty migration
npm run migration:create -- src/database/migrations/MigrationName
```

### Migration Workflow

1. Make changes to entities
2. Generate migration: `npm run migration:generate -- src/database/migrations/DescriptiveName`
3. Review the generated migration file
4. Run migration: `npm run migration:run`
5. Test the changes
6. Commit both entity and migration files

### Important Notes

- **Never** modify existing migrations that have been run in production
- Always test migrations with both `up` and `down` methods
- Use descriptive names for migrations
- Keep migrations small and focused

## Seeds

### Running Seeds

```bash
# Run all seeds
npm run seed
```

### Initial Seed Data

The initial seed creates:
- Demo organization
- Admin user (admin@demo.com / admin123)
- Recruiter user (recruiter@demo.com / recruiter123)
- Sample departments (Engineering, Product, Sales, Marketing)
- Sample locations (SF HQ, NY Office, Remote options)

### Creating New Seeds

1. Create a new seed file in `seeds/` directory
2. Export a function that accepts `DataSource`
3. Add the seed to `run-seed.ts`

Example:
```typescript
export async function runMySeed(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(MyEntity);
  // ... seed logic
}
```

## Database Schema

### Organizations Table
- Multi-tenant support
- Stores organization settings as JSONB
- Unique slug for URL-friendly identifiers

### Users Table
- Belongs to an organization
- Role-based access control (RBAC)
- Permissions stored as JSONB array
- Unique constraint on (organization_id, email)

### Departments Table
- Hierarchical structure with parent_id
- Belongs to an organization

### Locations Table
- Office locations and remote options
- Belongs to an organization

## Indexes

Performance indexes are created for:
- `organizations.slug` - Fast lookup by slug
- `users.organization_id` - Fast user queries per org
- `users.email` - Fast email lookups
- `departments.organization_id` - Fast department queries
- `locations.organization_id` - Fast location queries

## Best Practices

1. **Always use migrations** - Never use `synchronize: true` in production
2. **Test migrations** - Test both up and down migrations
3. **Use transactions** - Wrap related changes in transactions
4. **Add indexes** - Index foreign keys and frequently queried columns
5. **Use JSONB wisely** - For flexible data, but don't overuse
6. **Soft deletes** - Consider soft deletes for important data
7. **Audit trails** - Add created_at, updated_at timestamps

## Troubleshooting

### Migration fails
```bash
# Check current migration status
npm run typeorm -- migration:show -d src/database/data-source.ts

# Revert and try again
npm run migration:revert
npm run migration:run
```

### Database connection issues
- Verify Docker containers are running: `docker ps`
- Check environment variables in `.env`
- Ensure PostgreSQL is accessible on port 5432

### Seed data issues
- Drop and recreate database if needed
- Run migrations before seeds
- Check for unique constraint violations

## Environment Variables

Required database environment variables:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=recruiting_platform_dev
```

## Next Steps

After setting up the database:
1. Run migrations: `npm run migration:run`
2. Run seeds: `npm run seed`
3. Verify data in database
4. Start building features!
