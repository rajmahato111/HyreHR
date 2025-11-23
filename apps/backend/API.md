# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Common Headers

```
Content-Type: application/json
X-Request-Id: <optional-request-id>
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "timestamp": "2025-11-15T10:30:00.000Z",
  "path": "/api/v1/endpoint"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2025-11-15T10:30:00.000Z",
  "path": "/api/v1/endpoint",
  "method": "POST"
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Health Endpoints

### Check Health

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 5
    },
    "memory": {
      "status": "healthy",
      "message": "Heap: 150MB / 512MB (29.3%)"
    }
  }
}
```

### Readiness Check

```http
GET /health/ready
```

### Liveness Check

```http
GET /health/live
```

## Authentication Endpoints

### Register

```http
POST /auth/register
```

**Body:**
```json
{
  "organizationName": "My Company",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@mycompany.com",
  "password": "SecurePass123",
  "timezone": "America/New_York",
  "locale": "en"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "john@mycompany.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organizationId": "org-uuid"
  }
}
```

### Login

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@mycompany.com",
  "password": "SecurePass123"
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Get Current User

```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "john@mycompany.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "permissions": ["*"],
  "organizationId": "org-uuid",
  "timezone": "America/New_York",
  "locale": "en",
  "avatarUrl": null,
  "lastLogin": "2025-11-15T10:30:00.000Z",
  "createdAt": "2025-11-01T10:00:00.000Z"
}
```

### Logout

```http
POST /auth/logout
```

### Google OAuth

```http
GET /auth/google
```

Redirects to Google OAuth consent screen.

```http
GET /auth/google/callback
```

OAuth callback endpoint. Redirects to frontend with tokens.

## User Management Endpoints

### List Users

```http
GET /users?page=1&limit=20
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "recruiter",
      "active": true,
      "lastLogin": "2025-11-15T10:30:00.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Get User

```http
GET /users/:id
```

### Create User

```http
POST /users
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@mycompany.com",
  "password": "SecurePass123",
  "role": "recruiter",
  "timezone": "America/New_York",
  "locale": "en"
}
```

### Update User

```http
PUT /users/:id
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "hiring_manager",
  "active": true
}
```

### Delete User

```http
DELETE /users/:id
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

- **Standard**: 100 requests per minute
- **Burst**: 200 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

## Permissions

### Permission Format

Permissions follow the format: `resource:action`

Examples:
- `jobs:create`
- `candidates:read`
- `applications:update`

### Wildcard Permissions

- `*` - All permissions
- `jobs:*` - All job permissions

### Available Permissions

**Jobs:**
- `jobs:create`
- `jobs:read`
- `jobs:update`
- `jobs:delete`
- `jobs:approve`

**Candidates:**
- `candidates:create`
- `candidates:read`
- `candidates:update`
- `candidates:delete`
- `candidates:export`
- `candidates:merge`

**Applications:**
- `applications:create`
- `applications:read`
- `applications:update`
- `applications:move`
- `applications:reject`

**Interviews:**
- `interviews:schedule`
- `interviews:reschedule`
- `interviews:cancel`
- `interviews:feedback`

**Offers:**
- `offers:create`
- `offers:approve`
- `offers:send`
- `offers:view`

**Analytics:**
- `analytics:view`
- `analytics:create_reports`
- `analytics:export`

**Settings:**
- `settings:organization`
- `settings:users`
- `settings:integrations`
- `settings:billing`

## Roles

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| admin | Full system access | All permissions (*) |
| recruiter | Manage jobs and candidates | Jobs, candidates, applications, interviews, offers, analytics |
| hiring_manager | Review and approve candidates | View jobs, candidates, applications; provide feedback; approve offers |
| interviewer | Conduct interviews | View candidates, applications; provide feedback |
| coordinator | Schedule interviews | View candidates, applications; schedule interviews |
| executive | View analytics | View jobs and analytics |

## Versioning

The API uses URI versioning. The current version is `v1`.

```
/api/v1/endpoint
```

Future versions will be available at:
```
/api/v2/endpoint
```

## Best Practices

1. **Always include request ID** for tracking
2. **Handle rate limits** gracefully with exponential backoff
3. **Store refresh tokens** securely
4. **Refresh access tokens** before expiration
5. **Use pagination** for list endpoints
6. **Validate input** on client side
7. **Handle errors** appropriately
8. **Log requests** for debugging

## Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "My Company",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@mycompany.com",
    "password": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@mycompany.com",
    "password": "SecurePass123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript/TypeScript Examples

```typescript
// Login
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@mycompany.com',
    password: 'SecurePass123',
  }),
});

const { accessToken, refreshToken, user } = await response.json();

// Use access token
const userResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const currentUser = await userResponse.json();
```

## Support

For API support, please contact the development team or refer to the main documentation.
