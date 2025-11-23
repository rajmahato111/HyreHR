# Installation Guide

Complete guide for installing and deploying the Recruiting Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Docker Installation](#docker-installation)
4. [Kubernetes Installation](#kubernetes-installation)
5. [Manual Installation](#manual-installation)
6. [Post-Installation](#post-installation)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum Requirements**
- CPU: 4 cores
- RAM: 16 GB
- Storage: 100 GB SSD
- OS: Ubuntu 20.04 LTS or later

**Recommended for Production**
- CPU: 8+ cores
- RAM: 32+ GB
- Storage: 500 GB SSD
- OS: Ubuntu 22.04 LTS
- Load Balancer
- CDN

### Required Software

**Core Dependencies**
- Node.js 18+ LTS
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+
- Docker 24+ (for containerized deployment)
- Kubernetes 1.27+ (for K8s deployment)

**Optional Dependencies**
- Nginx (reverse proxy)
- Let's Encrypt (SSL certificates)
- AWS CLI (for AWS deployment)

### Required Accounts

**Essential Services**
- Email provider (Gmail, Outlook, SendGrid)
- Cloud storage (AWS S3, Google Cloud Storage)
- OpenAI API key (for AI features)

**Optional Services**
- DocuSign (e-signature)
- Zoom/Google Meet (video interviews)
- Datadog (monitoring)
- Sentry (error tracking)

## Installation Methods

Choose the installation method that best fits your needs:

| Method | Best For | Complexity | Time |
|--------|----------|------------|------|
| Docker Compose | Development, Small Teams | Low | 15 min |
| Kubernetes | Production, Enterprise | Medium | 1 hour |
| Manual | Custom Setups | High | 2 hours |

## Docker Installation

### Quick Start with Docker Compose

**Step 1: Clone Repository**
```bash
git clone https://github.com/your-org/recruiting-platform.git
cd recruiting-platform
```

**Step 2: Configure Environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/recruiting
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200

# Application
NODE_ENV=production
PORT=3000
API_PORT=3001
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=recruiting-platform-files
AWS_REGION=us-east-1

# AI Features
OPENAI_API_KEY=sk-your-openai-key
```

**Step 3: Start Services**
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Step 4: Initialize Database**
```bash
# Run migrations
docker-compose exec backend npm run migration:run

# Seed initial data
docker-compose exec backend npm run seed
```

**Step 5: Create Admin User**
```bash
docker-compose exec backend npm run create-admin

# Follow prompts to create admin account
```

**Step 6: Access Application**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Docker Compose Configuration

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: recruiting
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ELASTICSEARCH_URL=${ELASTICSEARCH_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
    command: npm run start:prod

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

## Kubernetes Installation

### Prerequisites

**Required Tools**
- kubectl configured
- Helm 3+
- Access to Kubernetes cluster

### Step 1: Create Namespace

```bash
kubectl create namespace recruiting-platform
kubectl config set-context --current --namespace=recruiting-platform
```

### Step 2: Install Dependencies

**PostgreSQL (using Helm)**
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --set auth.database=recruiting \
  --set auth.username=postgres \
  --set auth.password=your-password \
  --set primary.persistence.size=50Gi
```

**Redis**
```bash
helm install redis bitnami/redis \
  --set auth.enabled=false \
  --set master.persistence.size=10Gi
```

**Elasticsearch**
```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --set replicas=3 \
  --set volumeClaimTemplate.resources.requests.storage=50Gi
```

### Step 3: Create Secrets

```bash
# Create secret for database
kubectl create secret generic db-credentials \
  --from-literal=url=postgresql://postgres:password@postgres:5432/recruiting

# Create secret for API keys
kubectl create secret generic api-keys \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=openai-key=your-openai-key \
  --from-literal=aws-access-key=your-aws-key \
  --from-literal=aws-secret-key=your-aws-secret
```

### Step 4: Deploy Application

**backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: recruiting-platform/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

**Apply Deployments**
```bash
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/ingress.yaml
```

### Step 5: Configure Ingress

**ingress.yaml**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: recruiting-platform
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - platform.yourcompany.com
    - api.platform.yourcompany.com
    secretName: platform-tls
  rules:
  - host: platform.yourcompany.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
  - host: api.platform.yourcompany.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
```

### Step 6: Set Up Auto-Scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Manual Installation

### Step 1: Install Dependencies

**Ubuntu/Debian**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install -y elasticsearch
```

### Step 2: Configure Database

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE recruiting;
CREATE USER recruiting_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE recruiting TO recruiting_user;
\q
EOF
```

### Step 3: Configure Redis

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Set maxmemory policy
maxmemory 2gb
maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### Step 4: Configure Elasticsearch

```bash
# Edit Elasticsearch configuration
sudo nano /etc/elasticsearch/elasticsearch.yml

# Set cluster name and network
cluster.name: recruiting-platform
network.host: localhost
http.port: 9200

# Start Elasticsearch
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
```

### Step 5: Install Application

```bash
# Clone repository
git clone https://github.com/your-org/recruiting-platform.git
cd recruiting-platform

# Install backend dependencies
cd apps/backend
npm install
npm run build

# Install frontend dependencies
cd ../frontend
npm install
npm run build

# Return to root
cd ../..
```

### Step 6: Configure Application

```bash
# Create environment file
cp .env.example .env
nano .env

# Set all required variables (see Docker section)
```

### Step 7: Run Migrations

```bash
cd apps/backend
npm run migration:run
npm run seed
```

### Step 8: Set Up Process Manager

**Using PM2**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd apps/backend
pm2 start npm --name "backend" -- run start:prod

# Start frontend
cd ../frontend
pm2 start npm --name "frontend" -- run preview

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 9: Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/recruiting-platform
```

**Nginx Configuration**
```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name platform.yourcompany.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.platform.yourcompany.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/recruiting-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: Set Up SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d platform.yourcompany.com -d api.platform.yourcompany.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Post-Installation

### Verify Installation

```bash
# Check all services are running
sudo systemctl status postgresql
sudo systemctl status redis
sudo systemctl status elasticsearch
pm2 status

# Test API
curl http://localhost:3001/health

# Test frontend
curl http://localhost:3000
```

### Create Admin User

```bash
cd apps/backend
npm run create-admin

# Enter admin details when prompted
```

### Configure Monitoring

```bash
# Install monitoring agent (example: Datadog)
DD_API_KEY=your-api-key bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Configure application monitoring
npm install --save dd-trace
```

### Set Up Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-recruiting-platform.sh
```

**Backup Script**
```bash
#!/bin/bash
BACKUP_DIR="/backups/recruiting-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump -U recruiting_user recruiting > "$BACKUP_DIR/db_$DATE.sql"

# Backup files
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/recruiting-platform/uploads

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$DATE.sql" s3://your-backup-bucket/
aws s3 cp "$BACKUP_DIR/files_$DATE.tar.gz" s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-recruiting-platform.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-recruiting-platform.sh
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U recruiting_user -d recruiting -h localhost

# View logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Redis Connection Issues

```bash
# Check Redis is running
sudo systemctl status redis

# Test connection
redis-cli ping

# View logs
sudo tail -f /var/log/redis/redis-server.log
```

### Elasticsearch Issues

```bash
# Check Elasticsearch is running
sudo systemctl status elasticsearch

# Test connection
curl http://localhost:9200

# View logs
sudo tail -f /var/log/elasticsearch/recruiting-platform.log
```

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs

# Check environment variables
pm2 env 0

# Restart application
pm2 restart all
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

## Next Steps

- [Configuration Guide](./configuration.md)
- [Security Best Practices](../security/best-practices.md)
- [Monitoring Setup](../monitoring/performance.md)
- [Backup and Recovery](../management/backup.md)

---

**Need Help?** Contact admin-support@platform.com
