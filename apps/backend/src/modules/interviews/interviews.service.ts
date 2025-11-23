import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Scorecard,
  InterviewPlan,
  InterviewStage,
  Interview,
  InterviewParticipant,
  InterviewFeedback,
} from '../../database/entities';
import {
  CreateScorecardDto,
  UpdateScorecardDto,
  CreateInterviewPlanDto,
  UpdateInterviewPlanDto,
  CreateInterviewStageDto,
  UpdateInterviewStageDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateInterviewFeedbackDto,
  UpdateInterviewFeedbackDto,
} from './dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Scorecard)
    private scorecardRepository: Repository<Scorecard>,
    @InjectRepository(InterviewPlan)
    private interviewPlanRepository: Repository<InterviewPlan>,
    @InjectRepository(InterviewStage)
    private interviewStageRepository: Repository<InterviewStage>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewParticipant)
    private participantRepository: Repository<InterviewParticipant>,
    @InjectRepository(InterviewFeedback)
    private feedbackRepository: Repository<InterviewFeedback>,
  ) {}

  // Scorecard Management
  async createScorecard(
    organizationId: string,
    createScorecardDto: CreateScorecardDto,
  ): Promise<Scorecard> {
    const scorecard = this.scorecardRepository.create({
      ...createScorecardDto,
      organizationId,
    });
    return this.scorecardRepository.save(scorecard);
  }

  async findAllScorecards(organizationId: string): Promise<Scorecard[]> {
    return this.scorecardRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneScorecard(id: string, organizationId: string): Promise<Scorecard> {
    const scorecard = await this.scorecardRepository.findOne({
      where: { id, organizationId },
    });
    if (!scorecard) {
      throw new NotFoundException(`Scorecard with ID ${id} not found`);
    }
    return scorecard;
  }

  async updateScorecard(
    id: string,
    organizationId: string,
    updateScorecardDto: UpdateScorecardDto,
  ): Promise<Scorecard> {
    const scorecard = await this.findOneScorecard(id, organizationId);
    Object.assign(scorecard, updateScorecardDto);
    return this.scorecardRepository.save(scorecard);
  }

  async removeScorecard(id: string, organizationId: string): Promise<void> {
    const scorecard = await this.findOneScorecard(id, organizationId);
    await this.scorecardRepository.remove(scorecard);
  }

  // Interview Plan Management
  async createInterviewPlan(
    organizationId: string,
    createInterviewPlanDto: CreateInterviewPlanDto,
  ): Promise<InterviewPlan> {
    const plan = this.interviewPlanRepository.create({
      ...createInterviewPlanDto,
      organizationId,
    });
    return this.interviewPlanRepository.save(plan);
  }

  async findAllInterviewPlans(organizationId: string): Promise<InterviewPlan[]> {
    return this.interviewPlanRepository.find({
      where: { organizationId },
      relations: ['stages', 'stages.scorecard'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneInterviewPlan(
    id: string,
    organizationId: string,
  ): Promise<InterviewPlan> {
    const plan = await this.interviewPlanRepository.findOne({
      where: { id, organizationId },
      relations: ['stages', 'stages.scorecard'],
    });
    if (!plan) {
      throw new NotFoundException(`Interview plan with ID ${id} not found`);
    }
    return plan;
  }

  async updateInterviewPlan(
    id: string,
    organizationId: string,
    updateInterviewPlanDto: UpdateInterviewPlanDto,
  ): Promise<InterviewPlan> {
    const plan = await this.findOneInterviewPlan(id, organizationId);
    Object.assign(plan, updateInterviewPlanDto);
    return this.interviewPlanRepository.save(plan);
  }

  async removeInterviewPlan(id: string, organizationId: string): Promise<void> {
    const plan = await this.findOneInterviewPlan(id, organizationId);
    await this.interviewPlanRepository.remove(plan);
  }

  // Interview Stage Management
  async createInterviewStage(
    organizationId: string,
    createInterviewStageDto: CreateInterviewStageDto,
  ): Promise<InterviewStage> {
    // Verify the interview plan belongs to the organization
    const plan = await this.findOneInterviewPlan(
      createInterviewStageDto.interviewPlanId,
      organizationId,
    );

    const stage = this.interviewStageRepository.create(createInterviewStageDto);
    return this.interviewStageRepository.save(stage);
  }

  async findAllInterviewStages(
    interviewPlanId: string,
    organizationId: string,
  ): Promise<InterviewStage[]> {
    // Verify the interview plan belongs to the organization
    await this.findOneInterviewPlan(interviewPlanId, organizationId);

    return this.interviewStageRepository.find({
      where: { interviewPlanId },
      relations: ['scorecard'],
      order: { orderIndex: 'ASC' },
    });
  }

  async findOneInterviewStage(
    id: string,
    organizationId: string,
  ): Promise<InterviewStage> {
    const stage = await this.interviewStageRepository.findOne({
      where: { id },
      relations: ['interviewPlan', 'scorecard'],
    });
    if (!stage) {
      throw new NotFoundException(`Interview stage with ID ${id} not found`);
    }
    // Verify the interview plan belongs to the organization
    if (stage.interviewPlan.organizationId !== organizationId) {
      throw new NotFoundException(`Interview stage with ID ${id} not found`);
    }
    return stage;
  }

  async updateInterviewStage(
    id: string,
    organizationId: string,
    updateInterviewStageDto: UpdateInterviewStageDto,
  ): Promise<InterviewStage> {
    const stage = await this.findOneInterviewStage(id, organizationId);
    Object.assign(stage, updateInterviewStageDto);
    return this.interviewStageRepository.save(stage);
  }

  async removeInterviewStage(id: string, organizationId: string): Promise<void> {
    const stage = await this.findOneInterviewStage(id, organizationId);
    await this.interviewStageRepository.remove(stage);
  }

  // Interview Management
  async createInterview(
    organizationId: string,
    createInterviewDto: CreateInterviewDto,
  ): Promise<Interview> {
    const { participants, ...interviewData } = createInterviewDto;

    const interview = this.interviewRepository.create({
      ...interviewData,
      scheduledAt: new Date(createInterviewDto.scheduledAt),
    });
    const savedInterview = await this.interviewRepository.save(interview);

    // Create participants
    if (participants && participants.length > 0) {
      const participantEntities = participants.map((p) =>
        this.participantRepository.create({
          interviewId: savedInterview.id,
          userId: p.userId,
          role: p.role,
        }),
      );
      await this.participantRepository.save(participantEntities);
    }

    return this.findOneInterview(savedInterview.id, organizationId);
  }

  async findAllInterviews(
    organizationId: string,
    applicationId?: string,
  ): Promise<Interview[]> {
    const queryBuilder = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('interview.interviewStage', 'interviewStage')
      .leftJoinAndSelect('interview.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('interview.feedback', 'feedback')
      .where('job.organizationId = :organizationId', { organizationId });

    if (applicationId) {
      queryBuilder.andWhere('interview.applicationId = :applicationId', {
        applicationId,
      });
    }

    return queryBuilder.orderBy('interview.scheduledAt', 'DESC').getMany();
  }

  async findOneInterview(
    id: string,
    organizationId: string,
  ): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: [
        'application',
        'application.job',
        'application.candidate',
        'interviewStage',
        'interviewStage.scorecard',
        'participants',
        'participants.user',
        'feedback',
        'feedback.interviewer',
      ],
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    // Verify the interview belongs to the organization
    if (interview.application.job.organizationId !== organizationId) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async updateInterview(
    id: string,
    organizationId: string,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    const interview = await this.findOneInterview(id, organizationId);
    const updateData: any = { ...updateInterviewDto };
    const participants = updateData.participants;
    const scheduledAt = updateData.scheduledAt;
    
    delete updateData.participants;
    delete updateData.scheduledAt;

    Object.assign(interview, updateData);
    if (scheduledAt) {
      interview.scheduledAt = new Date(scheduledAt);
    }
    await this.interviewRepository.save(interview);

    // Update participants if provided
    if (participants) {
      // Remove existing participants
      await this.participantRepository.delete({ interviewId: id });

      // Add new participants
      if (participants.length > 0) {
        const participantEntities = participants.map((p: any) =>
          this.participantRepository.create({
            interviewId: id,
            userId: p.userId,
            role: p.role,
          }),
        );
        await this.participantRepository.save(participantEntities);
      }
    }

    return this.findOneInterview(id, organizationId);
  }

  async removeInterview(id: string, organizationId: string): Promise<void> {
    const interview = await this.findOneInterview(id, organizationId);
    await this.interviewRepository.remove(interview);
  }

  // Interview Feedback Management
  async createInterviewFeedback(
    organizationId: string,
    interviewerId: string,
    createFeedbackDto: CreateInterviewFeedbackDto,
  ): Promise<InterviewFeedback> {
    // Verify the interview exists and belongs to the organization
    await this.findOneInterview(createFeedbackDto.interviewId, organizationId);

    // Check if feedback already exists for this interviewer
    const existingFeedback = await this.feedbackRepository.findOne({
      where: {
        interviewId: createFeedbackDto.interviewId,
        interviewerId,
      },
    });

    if (existingFeedback) {
      throw new BadRequestException(
        'Feedback already submitted for this interview',
      );
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      interviewerId,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findAllInterviewFeedback(
    interviewId: string,
    organizationId: string,
  ): Promise<InterviewFeedback[]> {
    // Verify the interview exists and belongs to the organization
    await this.findOneInterview(interviewId, organizationId);

    return this.feedbackRepository.find({
      where: { interviewId },
      relations: ['interviewer', 'scorecard'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneInterviewFeedback(
    id: string,
    organizationId: string,
  ): Promise<InterviewFeedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['interview', 'interview.application', 'interview.application.job', 'interviewer', 'scorecard'],
    });

    if (!feedback) {
      throw new NotFoundException(`Interview feedback with ID ${id} not found`);
    }

    // Verify the feedback belongs to the organization
    if (feedback.interview.application.job.organizationId !== organizationId) {
      throw new NotFoundException(`Interview feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async updateInterviewFeedback(
    id: string,
    organizationId: string,
    interviewerId: string,
    updateFeedbackDto: UpdateInterviewFeedbackDto,
  ): Promise<InterviewFeedback> {
    const feedback = await this.findOneInterviewFeedback(id, organizationId);

    // Verify the feedback belongs to the interviewer
    if (feedback.interviewerId !== interviewerId) {
      throw new BadRequestException(
        'You can only update your own feedback',
      );
    }

    Object.assign(feedback, updateFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async submitInterviewFeedback(
    id: string,
    organizationId: string,
    interviewerId: string,
  ): Promise<InterviewFeedback> {
    const feedback = await this.findOneInterviewFeedback(id, organizationId);

    // Verify the feedback belongs to the interviewer
    if (feedback.interviewerId !== interviewerId) {
      throw new BadRequestException(
        'You can only submit your own feedback',
      );
    }

    if (feedback.submittedAt) {
      throw new BadRequestException('Feedback already submitted');
    }

    feedback.submittedAt = new Date();
    return this.feedbackRepository.save(feedback);
  }

  async removeInterviewFeedback(
    id: string,
    organizationId: string,
    interviewerId: string,
  ): Promise<void> {
    const feedback = await this.findOneInterviewFeedback(id, organizationId);

    // Verify the feedback belongs to the interviewer
    if (feedback.interviewerId !== interviewerId) {
      throw new BadRequestException(
        'You can only delete your own feedback',
      );
    }

    await this.feedbackRepository.remove(feedback);
  }

  // Interview Status Management
  async cancelInterview(
    id: string,
    organizationId: string,
  ): Promise<Interview> {
    const interview = await this.findOneInterview(id, organizationId);
    interview.status = 'cancelled' as any;
    return this.interviewRepository.save(interview);
  }

  async completeInterview(
    id: string,
    organizationId: string,
  ): Promise<Interview> {
    const interview = await this.findOneInterview(id, organizationId);
    interview.status = 'completed' as any;
    return this.interviewRepository.save(interview);
  }

  async markNoShow(
    id: string,
    organizationId: string,
  ): Promise<Interview> {
    const interview = await this.findOneInterview(id, organizationId);
    interview.status = 'no_show' as any;
    return this.interviewRepository.save(interview);
  }

  // Get upcoming interviews for a user
  async getUpcomingInterviewsForUser(
    userId: string,
    organizationId: string,
  ): Promise<Interview[]> {
    const now = new Date();
    
    return this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('interview.interviewStage', 'interviewStage')
      .leftJoinAndSelect('interview.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('participants.userId = :userId', { userId })
      .andWhere('interview.scheduledAt >= :now', { now })
      .andWhere('interview.status = :status', { status: 'scheduled' })
      .orderBy('interview.scheduledAt', 'ASC')
      .getMany();
  }

  // Get interviews by date range
  async getInterviewsByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Interview[]> {
    return this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('interview.interviewStage', 'interviewStage')
      .leftJoinAndSelect('interview.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('interview.scheduledAt >= :startDate', { startDate })
      .andWhere('interview.scheduledAt <= :endDate', { endDate })
      .orderBy('interview.scheduledAt', 'ASC')
      .getMany();
  }

  // Feedback Reminder System
  async getInterviewsNeedingFeedback(
    organizationId: string,
  ): Promise<Interview[]> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('interview.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('interview.feedback', 'feedback')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('interview.status = :status', { status: 'completed' })
      .andWhere('interview.scheduledAt <= :twentyFourHoursAgo', {
        twentyFourHoursAgo,
      })
      .getMany();
  }

  async getInterviewersWithPendingFeedback(
    organizationId: string,
  ): Promise<
    Array<{
      userId: string;
      userName: string;
      pendingInterviews: number;
      oldestPendingDate: Date;
    }>
  > {
    const interviews = await this.getInterviewsNeedingFeedback(organizationId);

    const interviewerMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        pendingInterviews: number;
        oldestPendingDate: Date;
      }
    >();

    for (const interview of interviews) {
      for (const participant of interview.participants) {
        if (participant.role === 'interviewer') {
          // Check if this interviewer has submitted feedback
          const hasFeedback = interview.feedback?.some(
            (f) => f.interviewerId === participant.userId && f.submittedAt,
          );

          if (!hasFeedback) {
            const existing = interviewerMap.get(participant.userId);
            if (existing) {
              existing.pendingInterviews++;
              if (interview.scheduledAt < existing.oldestPendingDate) {
                existing.oldestPendingDate = interview.scheduledAt;
              }
            } else {
              interviewerMap.set(participant.userId, {
                userId: participant.userId,
                userName: `${participant.user.firstName} ${participant.user.lastName}`,
                pendingInterviews: 1,
                oldestPendingDate: interview.scheduledAt,
              });
            }
          }
        }
      }
    }

    return Array.from(interviewerMap.values());
  }

  // Feedback Analytics
  async getFeedbackAnalytics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalFeedback: number;
    averageRating: number;
    decisionBreakdown: Record<string, number>;
    feedbackCompletionRate: number;
    averageTimeToSubmit: number;
  }> {
    let query = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.interview', 'interview')
      .leftJoin('interview.application', 'application')
      .leftJoin('application.job', 'job')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('feedback.submittedAt IS NOT NULL');

    if (startDate) {
      query = query.andWhere('feedback.submittedAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      query = query.andWhere('feedback.submittedAt <= :endDate', { endDate });
    }

    const feedback = await query
      .leftJoinAndSelect('feedback.interview', 'interviewForTime')
      .getMany();

    const totalFeedback = feedback.length;

    // Calculate average rating
    const ratingsSum = feedback.reduce(
      (sum, f) => sum + (f.overallRating || 0),
      0,
    );
    const ratingsCount = feedback.filter((f) => f.overallRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    // Decision breakdown
    const decisionBreakdown: Record<string, number> = {};
    feedback.forEach((f) => {
      if (f.decision) {
        decisionBreakdown[f.decision] =
          (decisionBreakdown[f.decision] || 0) + 1;
      }
    });

    // Feedback completion rate
    let totalInterviews = 0;
    let totalExpectedFeedback = 0;

    const interviewQuery = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoin('interview.application', 'application')
      .leftJoin('application.job', 'job')
      .leftJoinAndSelect('interview.participants', 'participants')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('interview.status = :status', { status: 'completed' });

    if (startDate) {
      interviewQuery.andWhere('interview.scheduledAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      interviewQuery.andWhere('interview.scheduledAt <= :endDate', { endDate });
    }

    const completedInterviews = await interviewQuery.getMany();
    totalInterviews = completedInterviews.length;

    completedInterviews.forEach((interview) => {
      const interviewerCount = interview.participants.filter(
        (p) => p.role === 'interviewer',
      ).length;
      totalExpectedFeedback += interviewerCount;
    });

    const feedbackCompletionRate =
      totalExpectedFeedback > 0
        ? (totalFeedback / totalExpectedFeedback) * 100
        : 0;

    // Average time to submit (in hours)
    const timeDifferences = feedback
      .filter((f) => f.submittedAt)
      .map((f) => {
        const interview = f.interview;
        if (interview && interview.scheduledAt) {
          const diff =
            f.submittedAt.getTime() - interview.scheduledAt.getTime();
          return diff / (1000 * 60 * 60); // Convert to hours
        }
        return 0;
      })
      .filter((diff) => diff > 0);

    const averageTimeToSubmit =
      timeDifferences.length > 0
        ? timeDifferences.reduce((sum, diff) => sum + diff, 0) /
          timeDifferences.length
        : 0;

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      decisionBreakdown,
      feedbackCompletionRate: Math.round(feedbackCompletionRate * 10) / 10,
      averageTimeToSubmit: Math.round(averageTimeToSubmit * 10) / 10,
    };
  }

  // Get feedback summary for an application
  async getFeedbackSummaryForApplication(
    applicationId: string,
    organizationId: string,
  ): Promise<{
    totalInterviews: number;
    completedInterviews: number;
    totalFeedback: number;
    averageRating: number;
    decisionBreakdown: Record<string, number>;
    strongYesCount: number;
    yesCount: number;
    neutralCount: number;
    noCount: number;
    strongNoCount: number;
  }> {
    const interviews = await this.findAllInterviews(
      organizationId,
      applicationId,
    );

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(
      (i) => i.status === 'completed',
    ).length;

    const allFeedback = interviews.flatMap((i) => i.feedback || []);
    const submittedFeedback = allFeedback.filter((f) => f.submittedAt);

    const totalFeedback = submittedFeedback.length;

    const ratingsSum = submittedFeedback.reduce(
      (sum, f) => sum + (f.overallRating || 0),
      0,
    );
    const ratingsCount = submittedFeedback.filter((f) => f.overallRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    const decisionBreakdown: Record<string, number> = {
      strong_yes: 0,
      yes: 0,
      neutral: 0,
      no: 0,
      strong_no: 0,
    };

    submittedFeedback.forEach((f) => {
      if (f.decision) {
        decisionBreakdown[f.decision] =
          (decisionBreakdown[f.decision] || 0) + 1;
      }
    });

    return {
      totalInterviews,
      completedInterviews,
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      decisionBreakdown,
      strongYesCount: decisionBreakdown.strong_yes,
      yesCount: decisionBreakdown.yes,
      neutralCount: decisionBreakdown.neutral,
      noCount: decisionBreakdown.no,
      strongNoCount: decisionBreakdown.strong_no,
    };
  }
}
