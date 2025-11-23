import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Recruiting Platform API')
    .setDescription(
      'Comprehensive API documentation for the all-in-one recruiting platform. ' +
      'This platform consolidates ATS, CRM, Interview Scheduling, and Advanced Analytics ' +
      'into a single, scalable, AI-powered solution for modern talent acquisition teams.'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: '/auth/oauth/authorize',
            tokenUrl: '/auth/oauth/token',
            scopes: {
              'read:jobs': 'Read job postings',
              'write:jobs': 'Create and update job postings',
              'read:candidates': 'Read candidate information',
              'write:candidates': 'Create and update candidates',
              'read:applications': 'Read applications',
              'write:applications': 'Manage applications',
              'read:interviews': 'Read interview schedules',
              'write:interviews': 'Schedule and manage interviews',
              'read:analytics': 'Access analytics and reports',
              'admin': 'Full administrative access',
            },
          },
        },
      },
      'OAuth2',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Jobs', 'Job requisition management')
    .addTag('Candidates', 'Candidate profile management')
    .addTag('Applications', 'Application and pipeline management')
    .addTag('Interviews', 'Interview scheduling and feedback')
    .addTag('Communication', 'Email and messaging')
    .addTag('Analytics', 'Metrics, dashboards, and reports')
    .addTag('AI', 'AI-powered features (resume parsing, matching, email generation)')
    .addTag('Talent Pools', 'CRM and talent pool management')
    .addTag('Offers', 'Offer management and e-signature')
    .addTag('Workflows', 'Workflow automation')
    .addTag('SLA', 'SLA monitoring and management')
    .addTag('Career Site', 'Public career site and candidate portal')
    .addTag('Surveys', 'Candidate surveys and feedback')
    .addTag('Integrations', 'Third-party integrations')
    .addTag('GDPR', 'GDPR compliance and data management')
    .addTag('Audit', 'Audit logs and security')
    .addServer('http://localhost:3000', 'Local development')
    .addServer('https://api-staging.platform.com', 'Staging environment')
    .addServer('https://api.platform.com', 'Production environment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Recruiting Platform API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { font-size: 36px }
    `,
  });
}
