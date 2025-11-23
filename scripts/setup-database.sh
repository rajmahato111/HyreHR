#!/bin/bash

echo "🗄️  Setting up database..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q recruiting-platform-postgres; then
  echo "📦 Starting Docker services..."
  npm run docker:up
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 10
fi

echo "✅ PostgreSQL is running"

# Navigate to backend directory
cd apps/backend

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Run seeds
echo "🌱 Running database seeds..."
npm run seed

if [ $? -eq 0 ]; then
  echo "✅ Seeds completed successfully"
else
  echo "❌ Seed failed"
  exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Login credentials:"
echo "  Admin: admin@demo.com / admin123"
echo "  Recruiter: recruiter@demo.com / recruiter123"
echo ""
echo "You can now start the application with: npm run dev"
