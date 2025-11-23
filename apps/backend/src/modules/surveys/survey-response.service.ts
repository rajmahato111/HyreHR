import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  SurveyResponse,
  SurveyResponseStatus,
  SentimentScore,
  Survey,
  SurveyQuestionType,
} from '../../database/entities';
import { SubmitSurveyResponseDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class SurveyResponseService {
  constructor(
    @InjectRepository(SurveyResponse)
    private surveyResponseRepository: Repository<SurveyResponse>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  async createResponse(
    surveyId: string,
    candidateId: string,
    applicationId?: string,
    interviewId?: string,
  ): Promise<SurveyResponse> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    // Generate unique token
    const responseToken = randomBytes(32).toString('hex');

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const response = this.surveyResponseRepository.create({
      surveyId,
      candidateId,
      applicationId,
      interviewId,
      responseToken,
      expiresAt,
      status: SurveyResponseStatus.PENDING,
    });

    return this.surveyResponseRepository.save(response);
  }

  async findByToken(token: string): Promise<SurveyResponse> {
    const response = await this.surveyResponseRepository.findOne({
      where: { responseToken: token },
      relations: ['survey', 'candidate'],
    });

    if (!response) {
      throw new NotFoundException('Survey response not found');
    }

    if (response.status === SurveyResponseStatus.COMPLETED) {
      throw new BadRequestException('Survey already completed');
    }

    if (response.expiresAt && response.expiresAt < new Date()) {
      response.status = SurveyResponseStatus.EXPIRED;
      await this.surveyResponseRepository.save(response);
      throw new BadRequestException('Survey has expired');
    }

    return response;
  }

  async submitResponse(
    token: string,
    submitDto: SubmitSurveyResponseDto,
  ): Promise<SurveyResponse> {
    const response = await this.findByToken(token);

    // Extract NPS score if present
    let npsScore: number | null = null;
    const npsQuestion = response.survey.questions.find(
      (q) => q.type === SurveyQuestionType.NPS,
    );

    if (npsQuestion) {
      const npsAnswer = submitDto.answers.find(
        (a) => a.questionId === npsQuestion.id,
      );
      if (npsAnswer && typeof npsAnswer.answer === 'number') {
        npsScore = npsAnswer.answer;
      }
    }

    // Analyze sentiment from text responses
    const textAnswers = submitDto.answers
      .filter((a) => typeof a.answer === 'string')
      .map((a) => a.answer as string)
      .join(' ');

    const sentiment = this.analyzeSentiment(textAnswers, npsScore);

    response.answers = submitDto.answers;
    response.npsScore = npsScore;
    response.sentiment = sentiment.score;
    response.sentimentAnalysis = sentiment.analysis;
    response.status = SurveyResponseStatus.COMPLETED;
    response.completedAt = new Date();

    return this.surveyResponseRepository.save(response);
  }

  async findBySurvey(surveyId: string): Promise<SurveyResponse[]> {
    return this.surveyResponseRepository.find({
      where: { surveyId },
      relations: ['candidate'],
      order: { completedAt: 'DESC' },
    });
  }

  async findByCandidate(candidateId: string): Promise<SurveyResponse[]> {
    return this.surveyResponseRepository.find({
      where: { candidateId },
      relations: ['survey'],
      order: { completedAt: 'DESC' },
    });
  }

  async getAnalytics(surveyId: string): Promise<any> {
    const responses = await this.surveyResponseRepository.find({
      where: {
        surveyId,
        status: SurveyResponseStatus.COMPLETED,
      },
    });

    const totalResponses = responses.length;
    const completionRate = await this.calculateCompletionRate(surveyId);

    // Calculate NPS
    const npsResponses = responses.filter((r) => r.npsScore !== null);
    const nps = this.calculateNPS(npsResponses.map((r) => r.npsScore));

    // Sentiment distribution
    const sentimentDistribution = this.calculateSentimentDistribution(responses);

    // Average response time
    const avgResponseTime = this.calculateAverageResponseTime(responses);

    return {
      totalResponses,
      completionRate,
      nps,
      sentimentDistribution,
      avgResponseTime,
      responses: responses.map((r) => ({
        id: r.id,
        candidateId: r.candidateId,
        completedAt: r.completedAt,
        npsScore: r.npsScore,
        sentiment: r.sentiment,
      })),
    };
  }

  async getOrganizationAnalytics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const surveys = await this.surveyRepository.find({
      where: { organizationId },
    });

    const surveyIds = surveys.map((s) => s.id);

    const whereClause: any = {
      surveyId: surveyIds.length > 0 ? surveyIds[0] : undefined,
      status: SurveyResponseStatus.COMPLETED,
    };

    if (startDate && endDate) {
      whereClause.completedAt = Between(startDate, endDate);
    }

    const responses = await this.surveyResponseRepository.find({
      where: whereClause,
    });

    const npsResponses = responses.filter((r) => r.npsScore !== null);
    const overallNPS = this.calculateNPS(npsResponses.map((r) => r.npsScore));

    const sentimentDistribution = this.calculateSentimentDistribution(responses);

    // NPS by trigger type
    const npsByTrigger = {};
    for (const survey of surveys) {
      const surveyResponses = responses.filter((r) => r.surveyId === survey.id);
      const surveyNpsResponses = surveyResponses.filter((r) => r.npsScore !== null);
      npsByTrigger[survey.triggerType] = this.calculateNPS(
        surveyNpsResponses.map((r) => r.npsScore),
      );
    }

    return {
      totalResponses: responses.length,
      overallNPS,
      sentimentDistribution,
      npsByTrigger,
      surveys: surveys.map((s) => ({
        id: s.id,
        name: s.name,
        triggerType: s.triggerType,
        responseCount: responses.filter((r) => r.surveyId === s.id).length,
      })),
    };
  }

  private analyzeSentiment(
    text: string,
    npsScore: number | null,
  ): { score: SentimentScore; analysis: string } {
    // Simple sentiment analysis based on keywords and NPS score
    const positiveWords = [
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'good',
      'helpful',
      'professional',
      'smooth',
      'easy',
    ];
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'poor',
      'disappointing',
      'difficult',
      'confusing',
      'slow',
      'unprofessional',
      'frustrating',
    ];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      lowerText.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerText.includes(word),
    ).length;

    let sentimentScore = 0;

    // Weight NPS score heavily if available
    if (npsScore !== null) {
      if (npsScore >= 9) sentimentScore += 2;
      else if (npsScore >= 7) sentimentScore += 1;
      else if (npsScore <= 6) sentimentScore -= 1;
      else if (npsScore <= 4) sentimentScore -= 2;
    }

    // Add text sentiment
    sentimentScore += positiveCount - negativeCount;

    let score: SentimentScore;
    let analysis: string;

    if (sentimentScore >= 3) {
      score = SentimentScore.VERY_POSITIVE;
      analysis = 'Highly positive feedback with strong satisfaction indicators';
    } else if (sentimentScore >= 1) {
      score = SentimentScore.POSITIVE;
      analysis = 'Positive feedback with satisfaction indicators';
    } else if (sentimentScore <= -3) {
      score = SentimentScore.VERY_NEGATIVE;
      analysis = 'Highly negative feedback with strong dissatisfaction indicators';
    } else if (sentimentScore <= -1) {
      score = SentimentScore.NEGATIVE;
      analysis = 'Negative feedback with dissatisfaction indicators';
    } else {
      score = SentimentScore.NEUTRAL;
      analysis = 'Neutral feedback with mixed or balanced sentiment';
    }

    return { score, analysis };
  }

  private calculateNPS(scores: number[]): number {
    if (scores.length === 0) return 0;

    const promoters = scores.filter((s) => s >= 9).length;
    const detractors = scores.filter((s) => s <= 6).length;

    return Math.round(((promoters - detractors) / scores.length) * 100);
  }

  private calculateSentimentDistribution(responses: SurveyResponse[]): any {
    const distribution = {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0,
    };

    responses.forEach((r) => {
      if (r.sentiment) {
        distribution[r.sentiment]++;
      }
    });

    return distribution;
  }

  private async calculateCompletionRate(surveyId: string): Promise<number> {
    const total = await this.surveyResponseRepository.count({
      where: { surveyId },
    });

    const completed = await this.surveyResponseRepository.count({
      where: {
        surveyId,
        status: SurveyResponseStatus.COMPLETED,
      },
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  private calculateAverageResponseTime(responses: SurveyResponse[]): number {
    const responsesWithTime = responses.filter(
      (r) => r.sentAt && r.completedAt,
    );

    if (responsesWithTime.length === 0) return 0;

    const totalMinutes = responsesWithTime.reduce((sum, r) => {
      const diff = r.completedAt.getTime() - r.sentAt.getTime();
      return sum + diff / (1000 * 60); // Convert to minutes
    }, 0);

    return Math.round(totalMinutes / responsesWithTime.length);
  }

  async markAsSent(responseId: string): Promise<void> {
    await this.surveyResponseRepository.update(responseId, {
      sentAt: new Date(),
    });
  }
}
