import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { InterviewStatus, LocationType } from '../src/database/entities/interview.entity';
import { Decision } from '../src/database/entities/interview-feedback.entity';

describe('Interview Scheduling Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let applicationId: string;
  let interviewId: string;

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

    // Create job, candidate, and application for testing
    const jobResponse = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Job for Interview',
        employmentType: 'FULL_TIME',
        status: 'OPEN',
      });

    const candidateResponse = await request(app.getHttpServer())
      .post('/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Interview',
        lastName: 'Candidate',
        email: 'interview.candidate@example.com',
        gdprConsent: true,
      });

    const stagesResponse = await request(app.getHttpServer())
      .get(`/applications/pipeline-stages?jobId=${jobResponse.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    const applicationResponse = await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        candidateId: candidateResponse.body.id,
        jobId: jobResponse.body.id,
        stageId: stagesResponse.body[0].id,
        sourceType: 'career_site',
      });

    applicationId = applicationResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full interview scheduling and feedback flow', async () => {
    // Step 1: Schedule an interview
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 7); // Schedule 7 days from now

    const scheduleResponse = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        applicationId,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: 60,
        locationType: LocationType.VIDEO,
        meetingLink: 'https://zoom.us/j/123456789',
        title: 'Technical Interview',
        description: 'Technical screening interview',
      })
      .expect(201);

    interviewId = scheduleResponse.body.id;
    expect(scheduleResponse.body.status).toBe(InterviewStatus.SCHEDULED);
    expect(scheduleResponse.body.applicationId).toBe(applicationId);

    // Step 2: Get interview details
    const interviewResponse = await request(app.getHttpServer())
      .get(`/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(interviewResponse.body.id).toBe(interviewId);
    expect(interviewResponse.body.locationType).toBe(LocationType.VIDEO);

    // Step 3: List interviews for the application
    const interviewsListResponse = await request(app.getHttpServer())
      .get(`/interviews?applicationId=${applicationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(interviewsListResponse.body.data)).toBe(true);
    expect(interviewsListResponse.body.data.some((i) => i.id === interviewId)).toBe(true);

    // Step 4: Update interview (reschedule)
    const newScheduledAt = new Date();
    newScheduledAt.setDate(newScheduledAt.getDate() + 8);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        scheduledAt: newScheduledAt.toISOString(),
        durationMinutes: 90,
      })
      .expect(200);

    expect(updateResponse.body.durationMinutes).toBe(90);

    // Step 5: Complete the interview
    const completeResponse = await request(app.getHttpServer())
      .patch(`/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(completeResponse.body.status).toBe(InterviewStatus.COMPLETED);

    // Step 6: Submit interview feedback
    const feedbackResponse = await request(app.getHttpServer())
      .post('/interviews/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        interviewId,
        overallRating: 4,
        decision: Decision.YES,
        strengths: 'Strong technical skills, good communication',
        concerns: 'Limited experience with cloud technologies',
        attributeRatings: [
          { attribute: 'Technical Skills', rating: 5 },
          { attribute: 'Communication', rating: 4 },
          { attribute: 'Problem Solving', rating: 4 },
        ],
      })
      .expect(201);

    expect(feedbackResponse.body.overallRating).toBe(4);
    expect(feedbackResponse.body.decision).toBe(Decision.YES);

    // Step 7: Get all feedback for the interview
    const allFeedbackResponse = await request(app.getHttpServer())
      .get(`/interviews/${interviewId}/feedback`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(allFeedbackResponse.body)).toBe(true);
    expect(allFeedbackResponse.body.length).toBeGreaterThan(0);
    expect(allFeedbackResponse.body[0].overallRating).toBe(4);
  });

  it('should handle interview cancellation', async () => {
    // Schedule another interview
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 10);

    const scheduleResponse = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        applicationId,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: 30,
        locationType: LocationType.PHONE,
        title: 'Phone Screen',
      })
      .expect(201);

    const newInterviewId = scheduleResponse.body.id;

    // Cancel the interview
    const cancelResponse = await request(app.getHttpServer())
      .patch(`/interviews/${newInterviewId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(cancelResponse.body.status).toBe(InterviewStatus.CANCELLED);
  });
});
