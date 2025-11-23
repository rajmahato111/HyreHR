# Recruiting Platform

An all-in-one recruiting platform that consolidates Applicant Tracking System (ATS), Candidate Relationship Management (CRM), Interview Scheduling, and Advanced Analytics into a single, scalable, AI-powered solution.

## Features

- **Applicant Tracking System (ATS)**: Manage jobs, candidates, and applications
- **Candidate Relationship Management (CRM)**: Build talent pools and run outreach campaigns
- **Interview Scheduling**: Automated scheduling with calendar integration
- **Advanced Analytics**: Real-time metrics and custom reporting
- **AI-Powered**: Resume parsing, candidate matching, email generation
- **Enterprise-Grade**: Scalable, secure, and compliant (GDPR, EEOC)

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Search**: Elasticsearch
- **Authentication**: JWT, OAuth 2.0, SAML 2.0

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Cloud**: AWS (EKS, RDS, ElastiCache, S3)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recruiting-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

4. Start Docker services (PostgreSQL, Redis, Elasticsearch):
```bash
npm run docker:up
```

5. Start development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1

### Development

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

# Stop Docker services
npm run docker:down
```

## Project Structure

```
recruiting-platform/
├── apps/
│   ├── backend/          # NestJS backend application
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── ...
│   │   └── package.json
│   └── frontend/         # React frontend application
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── ...
│       └── package.json
├── packages/             # Shared packages (future)
├── .kiro/
│   └── specs/           # Feature specifications
│       └── recruiting-platform/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── docker-compose.yml
├── package.json
└── README.md
```

## Documentation

- [Requirements](/.kiro/specs/recruiting-platform/requirements.md)
- [Design](/.kiro/specs/recruiting-platform/design.md)
- [Implementation Tasks](/.kiro/specs/recruiting-platform/tasks.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved
