# Security Best Practices

Comprehensive security guidelines for administrators managing the Recruiting Platform.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Data Protection](#data-protection)
4. [Network Security](#network-security)
5. [Application Security](#application-security)
6. [Compliance](#compliance)
7. [Incident Response](#incident-response)
8. [Security Checklist](#security-checklist)

## Security Overview

### Security Principles

The platform follows these core security principles:

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimum necessary access rights
3. **Zero Trust**: Verify every request, never assume trust
4. **Encryption Everywhere**: Data encrypted at rest and in transit
5. **Audit Everything**: Comprehensive logging and monitoring

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Internet                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              WAF / DDoS Protection                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Load Balancer (TLS 1.3)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Rate Limiting)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Application Servers (Isolated)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Database (Encrypted, Private Subnet)             │
└─────────────────────────────────────────────────────────┘
```

## Authentication Security

### Password Policy

**Requirements**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot reuse last 5 passwords
- Expires every 90 days (configurable)

**Configuration**
```typescript
// apps/backend/src/config/auth.config.ts
export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,
  expiryDays: 90,
  maxAttempts: 5,
  lockoutDuration: 30 // minutes
};
```

### Multi-Factor Authentication (MFA)

**Enable MFA for All Users**
```bash
# Require MFA for all users
npm run config:set -- --key=auth.mfaRequired --value=true

# Require MFA for admins only
npm run config:set -- --key=auth.mfaRequiredForAdmins --value=true
```

**Supported MFA Methods**
- TOTP (Google Authenticator, Authy)
- SMS (via Twilio)
- Email codes
- Hardware tokens (YubiKey)

**Best Practices**
✅ Require MFA for all admin accounts
✅ Provide backup codes
✅ Support multiple MFA devices
✅ Enforce MFA re-verification for sensitive actions
✅ Monitor MFA bypass attempts

### Session Management

**Session Configuration**
```typescript
export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  rolling: true, // Extend on activity
};
```

**Best Practices**
- Use secure, random session IDs
- Implement session timeout (24 hours)
- Invalidate sessions on logout
- Rotate session IDs after login
- Monitor concurrent sessions
- Implement "remember me" securely

### API Key Security

**API Key Management**
```bash
# Generate API key
npm run api-key:generate -- --user-id=<user-id> --scopes=read:jobs,write:applications

# Rotate API key
npm run api-key:rotate -- --key-id=<key-id>

# Revoke API key
npm run api-key:revoke -- --key-id=<key-id>
```

**Best Practices**
✅ Use separate keys for each integration
✅ Rotate keys every 90 days
✅ Limit key scopes to minimum required
✅ Monitor key usage
✅ Revoke unused keys
✅ Never commit keys to version control

## Data Protection

### Encryption at Rest

**Database Encryption**
```sql
-- Enable PostgreSQL encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Encrypt specific columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt SSN
ALTER TABLE candidates 
ADD COLUMN ssn_encrypted BYTEA;

UPDATE candidates 
SET ssn_encrypted = pgp_sym_encrypt(ssn, 'encryption-key');
```

**File Storage Encryption**
```typescript
// Enable S3 server-side encryption
const s3Config = {
  bucket: process.env.AWS_S3_BUCKET,
  serverSideEncryption: 'AES256',
  sseKmsKeyId: process.env.AWS_KMS_KEY_ID,
};
```

**Sensitive Field Encryption**
```typescript
// Encrypt sensitive fields at application level
import { EncryptionService } from './encryption.service';

@Entity()
export class Candidate {
  @Column()
  email: string;

  @Column({ transformer: new EncryptedColumnTransformer() })
  ssn: string;

  @Column({ transformer: new EncryptedColumnTransformer() })
  dateOfBirth: Date;
}
```

### Encryption in Transit

**TLS Configuration**
```nginx
# Nginx TLS configuration
ssl_protocols TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Certificate Management**
```bash
# Use Let's Encrypt for free SSL certificates
sudo certbot --nginx -d platform.yourcompany.com

# Auto-renewal
sudo certbot renew --dry-run

# Monitor certificate expiry
0 0 * * * certbot renew --quiet
```

### Data Masking

**PII Masking in Logs**
```typescript
// Mask sensitive data in logs
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    maskSensitiveData()
  ),
});

function maskSensitiveData() {
  return winston.format((info) => {
    // Mask email
    if (info.email) {
      info.email = info.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    }
    // Mask SSN
    if (info.ssn) {
      info.ssn = '***-**-' + info.ssn.slice(-4);
    }
    // Mask credit card
    if (info.creditCard) {
      info.creditCard = '****-****-****-' + info.creditCard.slice(-4);
    }
    return info;
  })();
}
```

### Data Retention

**Retention Policies**
```typescript
// Configure data retention
export const retentionPolicies = {
  candidates: {
    active: 'indefinite',
    inactive: '3 years', // After last activity
    deleted: '30 days', // Soft delete period
  },
  applications: {
    active: 'indefinite',
    rejected: '2 years',
    withdrawn: '1 year',
  },
  auditLogs: {
    security: '7 years',
    access: '2 years',
    general: '1 year',
  },
  communications: {
    emails: '3 years',
    notes: 'indefinite',
  },
};
```

**Automated Cleanup**
```bash
# Schedule data cleanup job
0 2 * * 0 npm run data:cleanup -- --dry-run=false
```

## Network Security

### Firewall Configuration

**AWS Security Groups**
```bash
# Allow HTTPS only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow SSH from specific IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/24

# Database access from app servers only
aws ec2 authorize-security-group-ingress \
  --group-id sg-db \
  --protocol tcp \
  --port 5432 \
  --source-group sg-app
```

**iptables Rules**
```bash
# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH from specific IP
iptables -A INPUT -p tcp --dport 22 -s 203.0.113.0/24 -j ACCEPT

# Drop all other traffic
iptables -A INPUT -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

### DDoS Protection

**Rate Limiting**
```typescript
// API rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
```

**CloudFlare Configuration**
```bash
# Enable DDoS protection
# Enable WAF rules
# Enable rate limiting
# Enable bot protection
# Enable HTTPS redirect
```

### VPN Access

**Require VPN for Admin Access**
```bash
# Install OpenVPN
sudo apt install openvpn

# Configure VPN
sudo nano /etc/openvpn/server.conf

# Require VPN for admin panel
location /admin {
    allow 10.8.0.0/24; # VPN subnet
    deny all;
}
```

## Application Security

### Input Validation

**Validate All Inputs**
```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCandidateDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}
```

**Sanitize User Input**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const sanitizedContent = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href'],
});
```

### SQL Injection Prevention

**Use Parameterized Queries**
```typescript
// ✅ Good: Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ Bad: String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Use ORM**
```typescript
// TypeORM automatically prevents SQL injection
const user = await userRepository.findOne({
  where: { email: email }
});
```

### XSS Prevention

**Content Security Policy**
```typescript
import helmet from 'helmet';

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.platform.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  })
);
```

**Escape Output**
```typescript
// React automatically escapes
<div>{userInput}</div>

// For dangerouslySetInnerHTML, sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### CSRF Protection

**Enable CSRF Tokens**
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### File Upload Security

**Validate File Uploads**
```typescript
import multer from 'multer';
import { FileFilterCallback } from 'multer';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb: FileFilterCallback) => {
    // Allow only specific file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Scan for viruses
import ClamScan from 'clamscan';

const clamscan = await new ClamScan().init();
const { isInfected } = await clamscan.isInfected(filePath);

if (isInfected) {
  throw new Error('File contains malware');
}
```

## Compliance

### GDPR Compliance

**Data Subject Rights**
```typescript
// Right to access
async exportUserData(userId: string) {
  const data = await this.gatherUserData(userId);
  return this.formatForExport(data);
}

// Right to erasure
async deleteUserData(userId: string) {
  await this.anonymizeData(userId);
  await this.deletePersonalData(userId);
  await this.logDeletion(userId);
}

// Right to rectification
async updateUserData(userId: string, updates: any) {
  await this.validateUpdates(updates);
  await this.applyUpdates(userId, updates);
  await this.logUpdate(userId);
}
```

**Consent Management**
```typescript
export class ConsentService {
  async recordConsent(userId: string, consentType: string) {
    await this.consentRepository.save({
      userId,
      consentType,
      granted: true,
      timestamp: new Date(),
      ipAddress: req.ip,
    });
  }

  async withdrawConsent(userId: string, consentType: string) {
    await this.consentRepository.update(
      { userId, consentType },
      { granted: false, withdrawnAt: new Date() }
    );
  }
}
```

### SOC 2 Compliance

**Access Controls**
- Implement RBAC
- Enforce least privilege
- Regular access reviews
- Audit all access

**Change Management**
- Version control all code
- Peer review all changes
- Test before deployment
- Document all changes

**Monitoring**
- Log all security events
- Monitor for anomalies
- Alert on suspicious activity
- Regular security reviews

## Incident Response

### Incident Response Plan

**1. Detection**
- Monitor security alerts
- Review audit logs
- Analyze anomalies
- User reports

**2. Containment**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs
- Preserve evidence

**3. Eradication**
- Remove malware
- Patch vulnerabilities
- Update credentials
- Harden systems

**4. Recovery**
- Restore from backups
- Verify system integrity
- Monitor for recurrence
- Resume normal operations

**5. Lessons Learned**
- Document incident
- Analyze root cause
- Update procedures
- Train team

### Security Contacts

```bash
# Security team contacts
SECURITY_EMAIL=security@platform.com
SECURITY_PHONE=1-800-SECURITY
SECURITY_SLACK=#security-incidents

# Escalation path
1. Security Engineer
2. Security Manager
3. CISO
4. CTO
```

## Security Checklist

### Daily
- [ ] Review security alerts
- [ ] Monitor failed login attempts
- [ ] Check system health
- [ ] Review audit logs

### Weekly
- [ ] Review access logs
- [ ] Check for security updates
- [ ] Review user permissions
- [ ] Analyze security metrics

### Monthly
- [ ] Security patch updates
- [ ] Access review
- [ ] Backup verification
- [ ] Security training
- [ ] Vulnerability scan

### Quarterly
- [ ] Penetration testing
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Policy review
- [ ] Compliance assessment

### Annually
- [ ] Full security assessment
- [ ] Third-party audit
- [ ] Incident response drill
- [ ] Security certification renewal
- [ ] Risk assessment

## Resources

### Security Tools

**Scanning**
- OWASP ZAP
- Nessus
- Qualys
- Burp Suite

**Monitoring**
- Datadog Security
- Splunk
- ELK Stack
- Sentry

**Testing**
- Metasploit
- Kali Linux
- Wireshark
- Postman

### Security Standards

- OWASP Top 10
- CIS Benchmarks
- NIST Cybersecurity Framework
- ISO 27001
- SOC 2

### Training Resources

- OWASP Training
- SANS Security Training
- Cybrary
- Pluralsight Security Path

---

**Security Questions?** Contact security@platform.com  
**Report Vulnerability:** security@platform.com (PGP key available)
