# Contributing Guide

Thank you for contributing to the Recruiting Platform! This guide will help you get started.

## Development Workflow

### 1. Setting Up Your Environment

Follow the [Quick Start Guide](QUICKSTART.md) to set up your development environment.

### 2. Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates

### 3. Making Changes

1. Write your code following our coding standards
2. Add tests for new functionality
3. Update documentation as needed
4. Run linting and tests before committing

```bash
npm run lint
npm test
```

### 4. Committing Changes

We use conventional commits for clear commit messages:

```bash
git commit -m "feat: add candidate search functionality"
git commit -m "fix: resolve authentication token expiration issue"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Submitting a Pull Request

1. Push your branch to the repository
2. Create a pull request with a clear description
3. Link related issues or tasks
4. Wait for code review
5. Address review feedback
6. Merge once approved

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Backend (NestJS)

- Follow NestJS best practices
- Use dependency injection
- Create DTOs for request/response validation
- Use decorators appropriately
- Write unit tests for services
- Write e2e tests for controllers

Example service:
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for props and state
- Keep components small and focused
- Use custom hooks for reusable logic
- Write component tests

Example component:
```typescript
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### Testing

- Write tests for all new features
- Aim for 80%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

Example test:
```typescript
describe('UserService', () => {
  it('should find user by id', async () => {
    // Arrange
    const userId = '123';
    const expectedUser = { id: userId, name: 'John' };
    
    // Act
    const result = await service.findOne(userId);
    
    // Assert
    expect(result).toEqual(expectedUser);
  });
});
```

## Project Structure

```
apps/backend/src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   ├── jobs/            # Jobs module
│   ├── candidates/      # Candidates module
│   └── ...
├── common/              # Shared code
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Auth guards
│   ├── interceptors/    # Interceptors
│   ├── pipes/           # Validation pipes
│   └── filters/         # Exception filters
├── config/              # Configuration
├── database/            # Database migrations
└── main.ts              # Application entry point

apps/frontend/src/
├── components/          # Reusable components
│   ├── ui/             # UI components
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── stores/             # Zustand stores
├── services/           # API services
├── utils/              # Utility functions
├── types/              # TypeScript types
└── main.tsx            # Application entry point
```

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Write clear PR descriptions
- Add screenshots for UI changes
- Respond to feedback promptly
- Update tests and documentation

### For Reviewers

- Be constructive and respectful
- Focus on code quality and maintainability
- Check for test coverage
- Verify documentation updates
- Test the changes locally if needed

## Getting Help

- Check the [README](README.md) for general information
- Review the [Design Document](/.kiro/specs/recruiting-platform/design.md)
- Ask questions in pull request comments
- Reach out to the team for guidance

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
