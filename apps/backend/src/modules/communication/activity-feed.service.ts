import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Communication,
  Application,
  Interview,
  ApplicationHistory,
  InterviewFeedback,
} from '../../database/entities';

export interface ActivityItem {
  id: string;
  type: 'email' | 'note' | 'stage_change' | 'interview' | 'feedback' | 'application';
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  data: any;
}

@Injectable()
export class ActivityFeedService {
  private readonly logger = new Logger(ActivityFeedService.name);

  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationHistory)
    private applicationHistoryRepository: Repository<ApplicationHistory>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewFeedback)
    private interviewFeedbackRepository: Repository<InterviewFeedback>,
  ) {}

  /**
   * Get unified activity feed for a candidate
   */
  async getCandidateActivityFeed(
    candidateId: string,
    limit: number = 50,
  ): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get communications
    const communications = await this.communicationRepository.find({
      where: { candidateId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    for (const comm of communications) {
      activities.push({
        id: comm.id,
        type: comm.type === 'email' ? 'email' : 'note',
        timestamp: comm.createdAt,
        user: comm.user
          ? {
              id: comm.user.id,
              name: `${comm.user.firstName} ${comm.user.lastName}`,
              avatarUrl: comm.user.avatarUrl,
            }
          : undefined,
        data: {
          subject: comm.subject,
          body: comm.body,
          direction: comm.direction,
          status: comm.status,
          toEmails: comm.toEmails,
          fromEmail: comm.fromEmail,
          mentions: comm.metadata?.mentions || [],
        },
      });
    }

    // Get applications
    const applications = await this.applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'stage'],
      order: { appliedAt: 'DESC' },
    });

    for (const app of applications) {
      activities.push({
        id: app.id,
        type: 'application',
        timestamp: app.appliedAt,
        data: {
          jobTitle: app.job?.title,
          jobId: app.jobId,
          stage: app.stage?.name,
          status: app.status,
        },
      });

      // Get stage changes for this application
      const stageChanges = await this.applicationHistoryRepository.find({
        where: { applicationId: app.id },
        relations: ['fromStage', 'toStage', 'user'],
        order: { timestamp: 'DESC' },
      });

      for (const change of stageChanges) {
        activities.push({
          id: change.id,
          type: 'stage_change',
          timestamp: change.timestamp,
          user: change.user
            ? {
                id: change.user.id,
                name: `${change.user.firstName} ${change.user.lastName}`,
                avatarUrl: change.user.avatarUrl,
              }
            : undefined,
          data: {
            applicationId: app.id,
            jobTitle: app.job?.title,
            fromStage: change.fromStage?.name,
            toStage: change.toStage?.name,
            automated: change.automated,
          },
        });
      }

      // Get interviews for this application
      const interviews = await this.interviewRepository.find({
        where: { applicationId: app.id },
        relations: ['interviewStage', 'participants', 'participants.user'],
        order: { scheduledAt: 'DESC' },
      });

      for (const interview of interviews) {
        activities.push({
          id: interview.id,
          type: 'interview',
          timestamp: interview.scheduledAt,
          data: {
            applicationId: app.id,
            jobTitle: app.job?.title,
            stageName: interview.interviewStage?.name,
            status: interview.status,
            locationType: interview.locationType,
            durationMinutes: interview.durationMinutes,
            interviewers: interview.participants?.map((p) => ({
              id: p.user?.id,
              name: p.user
                ? `${p.user.firstName} ${p.user.lastName}`
                : 'Unknown',
              role: p.role,
            })),
          },
        });

        // Get feedback for this interview
        const feedbacks = await this.interviewFeedbackRepository.find({
          where: { interviewId: interview.id },
          relations: ['interviewer'],
          order: { submittedAt: 'DESC' },
        });

        for (const feedback of feedbacks) {
          if (feedback.submittedAt) {
            activities.push({
              id: feedback.id,
              type: 'feedback',
              timestamp: feedback.submittedAt,
              user: feedback.interviewer
                ? {
                    id: feedback.interviewer.id,
                    name: `${feedback.interviewer.firstName} ${feedback.interviewer.lastName}`,
                    avatarUrl: feedback.interviewer.avatarUrl,
                  }
                : undefined,
              data: {
                interviewId: interview.id,
                applicationId: app.id,
                jobTitle: app.job?.title,
                overallRating: feedback.overallRating,
                decision: feedback.decision,
                strengths: feedback.strengths,
                concerns: feedback.concerns,
              },
            });
          }
        }
      }
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Limit results
    return activities.slice(0, limit);
  }

  /**
   * Get activity feed for an application
   */
  async getApplicationActivityFeed(
    applicationId: string,
  ): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get communications
    const communications = await this.communicationRepository.find({
      where: { applicationId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    for (const comm of communications) {
      activities.push({
        id: comm.id,
        type: comm.type === 'email' ? 'email' : 'note',
        timestamp: comm.createdAt,
        user: comm.user
          ? {
              id: comm.user.id,
              name: `${comm.user.firstName} ${comm.user.lastName}`,
              avatarUrl: comm.user.avatarUrl,
            }
          : undefined,
        data: {
          subject: comm.subject,
          body: comm.body,
          direction: comm.direction,
          status: comm.status,
          mentions: comm.metadata?.mentions || [],
        },
      });
    }

    // Get stage changes
    const stageChanges = await this.applicationHistoryRepository.find({
      where: { applicationId },
      relations: ['fromStage', 'toStage', 'user'],
      order: { timestamp: 'DESC' },
    });

    for (const change of stageChanges) {
      activities.push({
        id: change.id,
        type: 'stage_change',
        timestamp: change.timestamp,
        user: change.user
          ? {
              id: change.user.id,
              name: `${change.user.firstName} ${change.user.lastName}`,
              avatarUrl: change.user.avatarUrl,
            }
          : undefined,
        data: {
          fromStage: change.fromStage?.name,
          toStage: change.toStage?.name,
          automated: change.automated,
        },
      });
    }

    // Get interviews
    const interviews = await this.interviewRepository.find({
      where: { applicationId },
      relations: ['interviewStage', 'participants', 'participants.user'],
      order: { scheduledAt: 'DESC' },
    });

    for (const interview of interviews) {
      activities.push({
        id: interview.id,
        type: 'interview',
        timestamp: interview.scheduledAt,
        data: {
          stageName: interview.interviewStage?.name,
          status: interview.status,
          locationType: interview.locationType,
          durationMinutes: interview.durationMinutes,
          interviewers: interview.participants?.map((p) => ({
            id: p.user?.id,
            name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
            role: p.role,
          })),
        },
      });

      // Get feedback
      const feedbacks = await this.interviewFeedbackRepository.find({
        where: { interviewId: interview.id },
        relations: ['interviewer'],
        order: { submittedAt: 'DESC' },
      });

      for (const feedback of feedbacks) {
        if (feedback.submittedAt) {
          activities.push({
            id: feedback.id,
            type: 'feedback',
            timestamp: feedback.submittedAt,
            user: feedback.interviewer
              ? {
                  id: feedback.interviewer.id,
                  name: `${feedback.interviewer.firstName} ${feedback.interviewer.lastName}`,
                  avatarUrl: feedback.interviewer.avatarUrl,
                }
              : undefined,
            data: {
              interviewId: interview.id,
              overallRating: feedback.overallRating,
              decision: feedback.decision,
              strengths: feedback.strengths,
              concerns: feedback.concerns,
            },
          });
        }
      }
    }

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities;
  }

  /**
   * Process @mentions in notes and send notifications
   */
  async processMentions(
    communicationId: string,
    mentions: string[],
  ): Promise<void> {
    if (!mentions || mentions.length === 0) {
      return;
    }

    const communication = await this.communicationRepository.findOne({
      where: { id: communicationId },
      relations: ['user', 'candidate', 'application'],
    });

    if (!communication) {
      return;
    }

    // TODO: Send notifications to mentioned users
    // This would integrate with a notification service
    this.logger.log(
      `Processing mentions for communication ${communicationId}: ${mentions.join(', ')}`,
    );

    // Store mentions in metadata
    communication.metadata = {
      ...communication.metadata,
      mentions,
      mentionedAt: new Date(),
    };

    await this.communicationRepository.save(communication);
  }

  /**
   * Get activity summary for a time period
   */
  async getActivitySummary(
    candidateId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const activities = await this.getCandidateActivityFeed(candidateId, 1000);

    const filtered = activities.filter(
      (a) => a.timestamp >= startDate && a.timestamp <= endDate,
    );

    const summary = {
      totalActivities: filtered.length,
      byType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      timeline: [] as any[],
    };

    // Count by type
    for (const activity of filtered) {
      summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1;

      if (activity.user) {
        const userName = activity.user.name;
        summary.byUser[userName] = (summary.byUser[userName] || 0) + 1;
      }
    }

    // Group by day for timeline
    const dayGroups = new Map<string, number>();
    for (const activity of filtered) {
      const day = activity.timestamp.toISOString().split('T')[0];
      dayGroups.set(day, (dayGroups.get(day) || 0) + 1);
    }

    summary.timeline = Array.from(dayGroups.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return summary;
  }
}
