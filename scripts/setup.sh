#!/bin/bash

echo "🚀 Setting up Recruiting Platform..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version 18 or higher is required"
  exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment files
echo "⚙️  Setting up environment files..."
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "✅ Created apps/backend/.env"
fi

if [ ! -f apps/frontend/.env ]; then
  cp apps/frontend/.env.example apps/frontend/.env
  echo "✅ Created apps/frontend/.env"
fi

# Setup Husky
echo "🪝 Setting up Git hooks..."
npm run prepare

# Start Docker services
echo "🐳 Starting Docker services..."
npm run docker:up

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update environment variables in apps/backend/.env and apps/frontend/.env"
echo "  2. Run 'npm run dev' to start development servers"
echo "  3. Visit http://localhost:5173 for the frontend"
echo "  4. Visit http://localhost:3000/api/v1 for the backend API"
