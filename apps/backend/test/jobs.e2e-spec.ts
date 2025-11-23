import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JobStatus, EmploymentType } from '../src/database/entities/job.entity';

describe('Jobs API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let createdJobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
    organizationId = loginResponse.body.user.organizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/jobs (POST)', () => {
    it('should create a new job', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'We are looking for a senior engineer',
          employmentType: EmploymentType.FULL_TIME,
          remoteOk: true,
          status: JobStatus.DRAFT,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Senior Software Engineer');
          expect(res.body.organizationId).toBe(organizationId);
          createdJobId = res.body.id;
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/jobs')
        .send({
          title: 'Test Job',
          employmentType: EmploymentType.FULL_TIME,
        })
        .expect(401);
    });
  });

  describe('/jobs (GET)', () => {
    it('should return paginated jobs', () => {
      return request(app.getHttpServer())
        .get('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter jobs by status', () => {
      return request(app.getHttpServer())
        .get('/jobs?status=OPEN')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((job) => job.status === JobStatus.OPEN)).toBe(true);
        });
    });
  });

  describe('/jobs/:id (GET)', () => {
    it('should return a job by id', () => {
      return request(app.getHttpServer())
        .get(`/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdJobId);
          expect(res.body.title).toBe('Senior Software Engineer');
        });
    });

    it('should return 404 for non-existent job', () => {
      return request(app.getHttpServer())
        .get('/jobs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/jobs/:id (PATCH)', () => {
    it('should update a job', () => {
      return request(app.getHttpServer())
        .patch(`/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Senior Software Engineer',
          status: JobStatus.OPEN,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Senior Software Engineer');
          expect(res.body.status).toBe(JobStatus.OPEN);
        });
    });
  });

  describe('/jobs/:id/status (PATCH)', () => {
    it('should update job status', () => {
      return request(app.getHttpServer())
        .patch(`/jobs/${createdJobId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: JobStatus.CLOSED,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(JobStatus.CLOSED);
          expect(res.body.closedAt).toBeDefined();
        });
    });
  });

  describe('/jobs/:id (DELETE)', () => {
    it('should delete a job', () => {
      return request(app.getHttpServer())
        .delete(`/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
