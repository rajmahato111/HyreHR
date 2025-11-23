# Quick Start Guide

Get the Recruiting Platform up and running in minutes!

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

## Setup Steps

### 1. Run the Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- ✅ Check Node.js version
- 📦 Install all dependencies
- ⚙️  Create environment files
- 🪝 Set up Git hooks
- 🐳 Start Docker services (PostgreSQL, Redis, Elasticsearch)

### 2. Configure Environment Variables

Edit the environment files with your settings:

**Backend** (`apps/backend/.env`):
```env
# Update these values
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
OPENAI_API_KEY=your-openai-key-here
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Start Development Servers

```bash
npm run dev
```

This will start:
- 🎨 Frontend at http://localhost:5173
- 🔧 Backend API at http://localhost:3000/api/v1

### 4. Verify Installation

Open your browser and visit:
- Frontend: http://localhost:5173
- Backend Health Check: http://localhost:3000/api/v1/health

You should see the application running!

## Common Commands

```bash
# Start all services
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Start Docker services
npm run docker:up

# Stop Docker services
npm run docker:down
```

## Troubleshooting

### Docker services won't start
```bash
# Stop all containers
npm run docker:down

# Remove volumes and restart
docker-compose down -v
npm run docker:up
```

### Port already in use
If ports 3000, 5173, 5432, 6379, or 9200 are already in use:
1. Stop the conflicting service
2. Or change the port in the respective configuration file

### Dependencies installation fails
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules apps/*/node_modules
npm install
```

## Next Steps

1. Review the [Requirements](/.kiro/specs/recruiting-platform/requirements.md)
2. Check the [Design Document](/.kiro/specs/recruiting-platform/design.md)
3. Start implementing [Tasks](/.kiro/specs/recruiting-platform/tasks.md)

## Need Help?

- Check the [README](README.md) for detailed documentation
- Review the spec files in `.kiro/specs/recruiting-platform/`
- Ensure all Docker services are running: `docker ps`

Happy coding! 🚀
