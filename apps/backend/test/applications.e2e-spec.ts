import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApplicationStatus } from '../src/database/entities/application.entity';

describe('Applications API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let jobId: string;
  let candidateId: string;
  let stageId: string;
  let applicationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
    organizationId = loginResponse.body.user.organizationId;

    // Create test job
    const jobResponse = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Job',
        employmentType: 'FULL_TIME',
      });
    jobId = jobResponse.body.id;

    // Create test candidate
    const candidateResponse = await request(app.getHttpServer())
      .post('/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Candidate',
        email: 'test@example.com',
        gdprConsent: true,
      });
    candidateId = candidateResponse.body.id;

    // Get pipeline stages
    const stagesResponse = await request(app.getHttpServer())
      .get(`/applications/pipeline-stages?jobId=${jobId}`)
      .set('Authorization', `Bearer ${authToken}`);
    stageId = stagesResponse.body[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/applications (POST)', () => {
    it('should create a new application', () => {
      return request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          candidateId,
          jobId,
          stageId,
          sourceType: 'career_site',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.candidateId).toBe(candidateId);
          expect(res.body.jobId).toBe(jobId);
          expect(res.body.status).toBe(ApplicationStatus.ACTIVE);
          applicationId = res.body.id;
        });
    });
  });

  describe('/applications (GET)', () => {
    it('should return paginated applications', () => {
      return request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter applications by job', () => {
      return request(app.getHttpServer())
        .get(`/applications?jobId=${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((app) => app.jobId === jobId)).toBe(true);
        });
    });
  });

  describe('/applications/:id/move (POST)', () => {
    it('should move application to new stage', async () => {
      const stagesResponse = await request(app.getHttpServer())
        .get(`/applications/pipeline-stages?jobId=${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      const newStageId = stagesResponse.body[1]?.id || stageId;

      return request(app.getHttpServer())
        .post(`/applications/${applicationId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stageId: newStageId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.stageId).toBe(newStageId);
        });
    });
  });

  describe('/applications/:id/reject (POST)', () => {
    it('should reject an application', () => {
      return request(app.getHttpServer())
        .post(`/applications/${applicationId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rejectionReasonId: null,
          notes: 'Not a good fit',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ApplicationStatus.REJECTED);
          expect(res.body.rejectedAt).toBeDefined();
        });
    });
  });

  describe('/applications/:id/history (GET)', () => {
    it('should return application history', () => {
      return request(app.getHttpServer())
        .get(`/applications/${applicationId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
