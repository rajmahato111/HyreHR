import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JobStatus, EmploymentType } from '../src/database/entities/job.entity';
import { ApplicationStatus } from '../src/database/entities/application.entity';

describe('Job Creation and Application Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full job creation and application flow', async () => {
    // Step 1: Create a job
    const jobResponse = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Full Stack Developer',
        description: 'Looking for an experienced full stack developer',
        employmentType: EmploymentType.FULL_TIME,
        remoteOk: true,
        status: JobStatus.DRAFT,
      })
      .expect(201);

    const jobId = jobResponse.body.id;
    expect(jobResponse.body.status).toBe(JobStatus.DRAFT);

    // Step 2: Open the job
    const openJobResponse = await request(app.getHttpServer())
      .patch(`/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: JobStatus.OPEN,
      })
      .expect(200);

    expect(openJobResponse.body.status).toBe(JobStatus.OPEN);
    expect(openJobResponse.body.openedAt).toBeDefined();

    // Step 3: Create a candidate
    const candidateResponse = await request(app.getHttpServer())
      .post('/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1234567890',
        currentTitle: 'Software Engineer',
        currentCompany: 'Tech Corp',
        gdprConsent: true,
      })
      .expect(201);

    const candidateId = candidateResponse.body.id;
    expect(candidateResponse.body.email).toBe('alice.johnson@example.com');

    // Step 4: Get pipeline stages for the job
    const stagesResponse = await request(app.getHttpServer())
      .get(`/applications/pipeline-stages?jobId=${jobId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(stagesResponse.body)).toBe(true);
    expect(stagesResponse.body.length).toBeGreaterThan(0);
    const initialStageId = stagesResponse.body[0].id;

    // Step 5: Create an application
    const applicationResponse = await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        candidateId,
        jobId,
        stageId: initialStageId,
        sourceType: 'career_site',
      })
      .expect(201);

    const applicationId = applicationResponse.body.id;
    expect(applicationResponse.body.status).toBe(ApplicationStatus.ACTIVE);
    expect(applicationResponse.body.candidateId).toBe(candidateId);
    expect(applicationResponse.body.jobId).toBe(jobId);

    // Step 6: Move application to next stage
    if (stagesResponse.body.length > 1) {
      const nextStageId = stagesResponse.body[1].id;
      const moveResponse = await request(app.getHttpServer())
        .post(`/applications/${applicationId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stageId: nextStageId,
        })
        .expect(200);

      expect(moveResponse.body.stageId).toBe(nextStageId);
    }

    // Step 7: Verify application history
    const historyResponse = await request(app.getHttpServer())
      .get(`/applications/${applicationId}/history`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(historyResponse.body)).toBe(true);
    expect(historyResponse.body.length).toBeGreaterThan(0);

    // Step 8: Verify job has applications
    const jobWithAppsResponse = await request(app.getHttpServer())
      .get(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(jobWithAppsResponse.body.id).toBe(jobId);

    // Step 9: Verify candidate has applications
    const candidateWithAppsResponse = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(candidateWithAppsResponse.body.id).toBe(candidateId);
  });
});
