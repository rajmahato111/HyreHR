# Getting Started with the Recruiting Platform API

This guide will walk you through the process of integrating with the Recruiting Platform API, from initial setup to making your first API calls.

## Prerequisites

Before you begin, ensure you have:

1. A Recruiting Platform account (sign up at [platform.com](https://platform.com))
2. Basic knowledge of REST APIs and HTTP requests
3. A development environment with your preferred programming language
4. API testing tool (Postman, cURL, or similar)

## Step 1: Create API Credentials

### Option A: API Key (Server-to-Server)

1. Log in to your Recruiting Platform account
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Give your key a descriptive name (e.g., "Production Integration")
5. Select the appropriate permissions/scopes
6. Copy and securely store your API key (it won't be shown again)

### Option B: OAuth 2.0 (User-Facing Applications)

1. Navigate to **Settings** → **OAuth Applications**
2. Click **Create New Application**
3. Fill in the application details:
   - **Name**: Your application name
   - **Redirect URIs**: Your callback URLs
   - **Scopes**: Select required permissions
4. Save your **Client ID** and **Client Secret**

## Step 2: Test Your Connection

### Using cURL

```bash
# Test with API Key
curl -X GET "https://api.platform.com/v1/jobs" \
  -H "X-API-Key: your_api_key_here"

# Test with Bearer Token
curl -X GET "https://api.platform.com/v1/jobs" \
  -H "Authorization: Bearer your_jwt_token_here"
```

### Using Postman

1. Import our Postman collection: [Download Collection](https://api.platform.com/postman/collection.json)
2. Set up environment variables:
   - `base_url`: `https://api.platform.com/v1`
   - `api_key`: Your API key
3. Run the "Health Check" request to verify connectivity

## Step 3: Authenticate

### JWT Authentication Flow

```javascript
const axios = require('axios');

async function authenticate() {
  const response = await axios.post('https://api.platform.com/v1/auth/login', {
    email: 'your-email@company.com',
    password: 'your-password'
  });
  
  const { accessToken, refreshToken } = response.data;
  
  // Store tokens securely
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return accessToken;
}

// Use token in subsequent requests
const token = await authenticate();
const jobs = await axios.get('https://api.platform.com/v1/jobs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### OAuth 2.0 Flow

```javascript
// Step 1: Redirect user to authorization URL
const authUrl = `https://api.platform.com/auth/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=read:jobs write:applications`;

window.location.href = authUrl;

// Step 2: Handle callback and exchange code for token
async function handleCallback(code) {
  const response = await axios.post('https://api.platform.com/auth/oauth/token', {
    grant_type: 'authorization_code',
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  });
  
  const { access_token, refresh_token } = response.data;
  return access_token;
}
```

## Step 4: Make Your First API Call

### List Jobs

```javascript
const axios = require('axios');

async function listJobs() {
  try {
    const response = await axios.get('https://api.platform.com/v1/jobs', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        status: 'open',
        page: 1,
        limit: 20
      }
    });
    
    console.log('Jobs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Create a Candidate

```javascript
async function createCandidate() {
  try {
    const response = await axios.post(
      'https://api.platform.com/v1/candidates',
      {
        email: 'candidate@email.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        currentTitle: 'Software Engineer',
        tags: ['javascript', 'react']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Created candidate:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

## Step 5: Handle Errors

Implement proper error handling for production applications:

```javascript
async function makeApiCall(endpoint, options = {}) {
  try {
    const response = await axios({
      url: `https://api.platform.com/v1${endpoint}`,
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      const { code, message, details } = error.response.data.error;
      
      switch (code) {
        case 'UNAUTHORIZED':
          // Refresh token or re-authenticate
          await refreshAccessToken();
          return makeApiCall(endpoint, options); // Retry
          
        case 'RATE_LIMIT_EXCEEDED':
          // Wait and retry
          const retryAfter = error.response.headers['retry-after'];
          await sleep(retryAfter * 1000);
          return makeApiCall(endpoint, options);
          
        case 'VALIDATION_ERROR':
          // Handle validation errors
          console.error('Validation errors:', details);
          throw new Error(message);
          
        default:
          throw new Error(message);
      }
    } else if (error.request) {
      // No response received
      throw new Error('Network error - no response from server');
    } else {
      // Request setup error
      throw new Error(error.message);
    }
  }
}
```

## Step 6: Implement Token Refresh

```javascript
let accessToken = null;
let refreshToken = null;

async function refreshAccessToken() {
  try {
    const response = await axios.post(
      'https://api.platform.com/v1/auth/refresh',
      {
        refreshToken: refreshToken
      }
    );
    
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    // Store new tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return accessToken;
  } catch (error) {
    // Refresh token expired, need to re-authenticate
    console.error('Refresh token expired');
    // Redirect to login
  }
}
```

## Step 7: Set Up Webhooks (Optional)

Receive real-time notifications for events:

```javascript
// Create webhook subscription
async function createWebhook() {
  const response = await axios.post(
    'https://api.platform.com/v1/integrations/webhooks',
    {
      url: 'https://your-app.com/webhooks/recruiting-platform',
      events: [
        'application.created',
        'application.stage_changed',
        'interview.scheduled'
      ],
      secret: 'your_webhook_secret'
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  console.log('Webhook created:', response.data);
}

// Handle webhook events
const express = require('express');
const crypto = require('crypto');

app.post('/webhooks/recruiting-platform', express.json(), (req, res) => {
  // Verify signature
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process event
  const event = req.body;
  console.log('Received event:', event.type);
  
  switch (event.type) {
    case 'application.created':
      handleNewApplication(event.data);
      break;
    case 'application.stage_changed':
      handleStageChange(event.data);
      break;
    case 'interview.scheduled':
      handleInterviewScheduled(event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

## Best Practices

### 1. Rate Limiting

Respect rate limits to avoid throttling:

```javascript
const rateLimit = require('axios-rate-limit');

const http = rateLimit(axios.create(), {
  maxRequests: 90, // Leave buffer below 100/min limit
  perMilliseconds: 60000
});
```

### 2. Pagination

Always paginate large result sets:

```javascript
async function getAllJobs() {
  let allJobs = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await axios.get('https://api.platform.com/v1/jobs', {
      params: { page, limit: 100 }
    });
    
    allJobs = allJobs.concat(response.data.items);
    hasMore = response.data.hasMore;
    page++;
  }
  
  return allJobs;
}
```

### 3. Caching

Cache responses to reduce API calls:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getJobWithCache(jobId) {
  const cacheKey = `job:${jobId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const job = await axios.get(`https://api.platform.com/v1/jobs/${jobId}`);
  cache.set(cacheKey, job.data);
  
  return job.data;
}
```

### 4. Logging

Log all API interactions for debugging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'api.log' })
  ]
});

axios.interceptors.request.use(request => {
  logger.info('API Request', {
    method: request.method,
    url: request.url,
    params: request.params
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    logger.info('API Response', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  error => {
    logger.error('API Error', {
      status: error.response?.status,
      url: error.config?.url,
      error: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

## Next Steps

Now that you've completed the basic setup:

1. Explore the [API Reference](../README.md) for detailed endpoint documentation
2. Review [Common Use Cases](./use-cases.md) for implementation examples
3. Check out [Integration Patterns](./integration-patterns.md) for architectural guidance
4. Join our [Developer Community](https://community.platform.com) for support

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Verify your API key or token is correct
- Check if token has expired and needs refresh
- Ensure you're using the correct authentication method

**403 Forbidden**
- Verify your account has the required permissions
- Check if the resource belongs to your organization
- Review your API key scopes

**429 Rate Limit Exceeded**
- Implement exponential backoff
- Reduce request frequency
- Consider caching responses
- Contact support for higher limits

**500 Internal Server Error**
- Check [API Status Page](https://status.platform.com)
- Retry with exponential backoff
- Contact support if issue persists

## Support

Need help? We're here for you:

- **Documentation**: [docs.platform.com](https://docs.platform.com)
- **Email**: api-support@platform.com
- **Community**: [community.platform.com](https://community.platform.com)
- **Status**: [status.platform.com](https://status.platform.com)
