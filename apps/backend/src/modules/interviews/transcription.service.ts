import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InterviewTranscript,
  TranscriptStatus,
  TranscriptSegment,
  Speaker,
  KeyPoint,
  SentimentAnalysis,
  RedFlag,
  GreenFlag,
} from '../../database/entities/interview-transcript.entity';
import { Interview } from '../../database/entities/interview.entity';
import OpenAI from 'openai';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private openai: OpenAI;

  constructor(
    @InjectRepository(InterviewTranscript)
    private transcriptRepository: Repository<InterviewTranscript>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {
    // Initialize OpenAI client for transcription and analysis
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Start real-time transcription for an interview
   */
  async startTranscription(
    interviewId: string,
    audioUrl?: string,
  ): Promise<InterviewTranscript> {
    this.logger.log(`Starting transcription for interview ${interviewId}`);

    // Verify interview exists
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['participants', 'participants.user'],
    });

    if (!interview) {
      throw new NotFoundException(`Interview ${interviewId} not found`);
    }

    // Create transcript record
    const transcript = this.transcriptRepository.create({
      interviewId,
      status: TranscriptStatus.PROCESSING,
      processingStartedAt: new Date(),
      speakers: this.initializeSpeakers(interview),
    });

    await this.transcriptRepository.save(transcript);

    // Start async transcription process
    this.processTranscription(transcript.id, audioUrl).catch((error) => {
      this.logger.error(
        `Transcription processing failed for ${transcript.id}`,
        error,
      );
    });

    return transcript;
  }

  /**
   * Initialize speakers from interview participants
   */
  private initializeSpeakers(interview: Interview): Speaker[] {
    const speakers: Speaker[] = [];

    // Add interviewers
    if (interview.participants) {
      interview.participants.forEach((participant, index) => {
        if (participant.role === 'interviewer') {
          speakers.push({
            id: `speaker_${index}`,
            name: participant.user?.firstName
              ? `${participant.user.firstName} ${participant.user.lastName}`
              : undefined,
            role: 'interviewer',
          });
        }
      });
    }

    // Add candidate speaker
    speakers.push({
      id: `speaker_candidate`,
      name: undefined, // Will be identified from transcript
      role: 'candidate',
    });

    return speakers;
  }

  /**
   * Process transcription asynchronously
   */
  private async processTranscription(
    transcriptId: string,
    audioUrl?: string,
  ): Promise<void> {
    try {
      const transcript = await this.transcriptRepository.findOne({
        where: { id: transcriptId },
      });

      if (!transcript) {
        throw new NotFoundException(`Transcript ${transcriptId} not found`);
      }

      // Step 1: Perform transcription with speaker identification
      const segments = await this.transcribeAudio(audioUrl);
      transcript.segments = segments;
      transcript.fullText = this.generateFullText(segments);
      await this.transcriptRepository.save(transcript);

      // Step 2: Extract key points
      const keyPoints = await this.extractKeyPoints(transcript.fullText);
      transcript.keyPoints = keyPoints;
      await this.transcriptRepository.save(transcript);

      // Step 3: Perform sentiment analysis
      const sentimentAnalysis = await this.analyzeSentiment(
        transcript.fullText,
        segments,
      );
      transcript.sentimentAnalysis = sentimentAnalysis;
      await this.transcriptRepository.save(transcript);

      // Step 4: Detect red flags and green flags
      const { redFlags, greenFlags } = await this.detectFlags(
        transcript.fullText,
        segments,
      );
      transcript.redFlags = redFlags;
      transcript.greenFlags = greenFlags;
      await this.transcriptRepository.save(transcript);

      // Step 5: Generate summary
      const summary = await this.generateSummary(transcript.fullText, keyPoints);
      transcript.summary = summary;
      await this.transcriptRepository.save(transcript);

      // Step 6: Generate suggested feedback
      const suggestedFeedback = await this.generateSuggestedFeedback(
        transcript.fullText,
        keyPoints,
        sentimentAnalysis,
        redFlags,
        greenFlags,
      );
      transcript.suggestedFeedback = suggestedFeedback;

      // Mark as completed
      transcript.status = TranscriptStatus.COMPLETED;
      transcript.processingCompletedAt = new Date();
      await this.transcriptRepository.save(transcript);

      this.logger.log(`Transcription completed for ${transcriptId}`);
    } catch (error) {
      this.logger.error(`Transcription processing failed`, error);

      // Update transcript with error
      await this.transcriptRepository.update(transcriptId, {
        status: TranscriptStatus.FAILED,
        errorMessage: error.message,
        processingCompletedAt: new Date(),
      });
    }
  }

  /**
   * Transcribe audio with speaker identification using OpenAI Whisper
   */
  private async transcribeAudio(audioUrl?: string): Promise<TranscriptSegment[]> {
    this.logger.log('Transcribing audio with speaker identification');

    // In a real implementation, this would:
    // 1. Download audio from audioUrl or stream from real-time source
    // 2. Use OpenAI Whisper API for transcription
    // 3. Use speaker diarization service (e.g., Pyannote, AssemblyAI)
    // 4. Combine transcription with speaker labels

    // For now, return mock data structure
    // In production, you would call:
    // const transcription = await this.openai.audio.transcriptions.create({
    //   file: audioFile,
    //   model: 'whisper-1',
    //   response_format: 'verbose_json',
    //   timestamp_granularities: ['segment']
    // });

    const mockSegments: TranscriptSegment[] = [
      {
        id: 'seg_1',
        speakerId: 'speaker_0',
        text: 'Thank you for joining us today. Can you tell me about your experience with TypeScript?',
        startTime: 0,
        endTime: 5.2,
        confidence: 0.95,
      },
      {
        id: 'seg_2',
        speakerId: 'speaker_candidate',
        text: "I've been working with TypeScript for about 3 years now. I really enjoy the type safety it provides.",
        startTime: 5.5,
        endTime: 11.8,
        confidence: 0.92,
      },
    ];

    return mockSegments;
  }

  /**
   * Generate full text from segments
   */
  private generateFullText(segments: TranscriptSegment[]): string {
    return segments.map((seg) => seg.text).join(' ');
  }

  /**
   * Extract key points from transcript using AI
   */
  private async extractKeyPoints(fullText: string): Promise<KeyPoint[]> {
    this.logger.log('Extracting key points from transcript');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing interview transcripts. Extract the most important key points from the interview, focusing on:
- Technical skills and experience mentioned
- Problem-solving approaches
- Communication style
- Cultural fit indicators
- Notable achievements or projects

Return a JSON array of key points with format: [{"text": "key point", "importance": "high|medium|low", "category": "technical|behavioral|experience"}]`,
          },
          {
            role: 'user',
            content: `Extract key points from this interview transcript:\n\n${fullText}`,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      const keyPoints = JSON.parse(content);

      // Add timestamps (in production, match to actual segments)
      return keyPoints.map((kp: any, index: number) => ({
        ...kp,
        timestamp: index * 60, // Mock timestamp
      }));
    } catch (error) {
      this.logger.error('Failed to extract key points', error);
      return [];
    }
  }

  /**
   * Analyze sentiment of the interview
   */
  private async analyzeSentiment(
    fullText: string,
    segments: TranscriptSegment[],
  ): Promise<SentimentAnalysis> {
    this.logger.log('Analyzing sentiment');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of this interview transcript. Provide:
1. Overall sentiment (positive, neutral, negative)
2. Overall sentiment score (-1 to 1)
3. Segment-by-segment sentiment analysis

Return JSON format: {"overall": "positive|neutral|negative", "score": 0.5, "segments": [{"timestamp": 0, "sentiment": "positive", "score": 0.7}]}`,
          },
          {
            role: 'user',
            content: fullText,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to analyze sentiment', error);
      return {
        overall: 'neutral',
        score: 0,
        segments: [],
      };
    }
  }

  /**
   * Detect red flags and green flags in candidate responses
   */
  private async detectFlags(
    fullText: string,
    segments: TranscriptSegment[],
  ): Promise<{ redFlags: RedFlag[]; greenFlags: GreenFlag[] }> {
    this.logger.log('Detecting red flags and green flags');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this interview transcript and identify:

RED FLAGS (concerns):
- Negative attitude or unprofessional behavior
- Lack of preparation or knowledge
- Communication issues
- Inconsistencies in responses
- Concerning work history patterns

GREEN FLAGS (positive indicators):
- Strong technical knowledge
- Excellent communication skills
- Problem-solving ability
- Cultural fit indicators
- Enthusiasm and engagement

Return JSON: {"redFlags": [{"text": "quote", "reason": "explanation", "severity": "high|medium|low"}], "greenFlags": [{"text": "quote", "reason": "explanation"}]}`,
          },
          {
            role: 'user',
            content: fullText,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      const flags = JSON.parse(content);

      // Add timestamps
      return {
        redFlags: flags.redFlags.map((rf: any, index: number) => ({
          ...rf,
          timestamp: index * 120,
        })),
        greenFlags: flags.greenFlags.map((gf: any, index: number) => ({
          ...gf,
          timestamp: index * 120,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to detect flags', error);
      return { redFlags: [], greenFlags: [] };
    }
  }

  /**
   * Generate interview summary
   */
  private async generateSummary(
    fullText: string,
    keyPoints: KeyPoint[],
  ): Promise<string> {
    this.logger.log('Generating interview summary');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Generate a concise summary of this interview. Include:
- Overview of candidate's background
- Key technical skills discussed
- Notable strengths
- Areas of concern (if any)
- Overall impression

Keep it professional and objective, 3-4 paragraphs.`,
          },
          {
            role: 'user',
            content: `Transcript:\n${fullText}\n\nKey Points:\n${JSON.stringify(keyPoints, null, 2)}`,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('Failed to generate summary', error);
      return 'Summary generation failed.';
    }
  }

  /**
   * Generate suggested feedback based on transcript analysis
   */
  private async generateSuggestedFeedback(
    fullText: string,
    keyPoints: KeyPoint[],
    sentimentAnalysis: SentimentAnalysis,
    redFlags: RedFlag[],
    greenFlags: GreenFlag[],
  ): Promise<string> {
    this.logger.log('Generating suggested feedback');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Based on the interview analysis, generate structured feedback for the hiring team. Include:

1. Technical Assessment
2. Communication Skills
3. Problem-Solving Ability
4. Cultural Fit
5. Recommendation (Strong Yes, Yes, Neutral, No, Strong No)
6. Key Strengths
7. Areas for Development

Be specific and reference actual examples from the interview.`,
          },
          {
            role: 'user',
            content: `Interview Analysis:

Transcript: ${fullText.substring(0, 1000)}...

Key Points: ${JSON.stringify(keyPoints)}

Sentiment: ${sentimentAnalysis.overall} (${sentimentAnalysis.score})

Green Flags: ${JSON.stringify(greenFlags)}

Red Flags: ${JSON.stringify(redFlags)}`,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('Failed to generate suggested feedback', error);
      return 'Feedback generation failed.';
    }
  }

  /**
   * Get transcript by interview ID
   */
  async getTranscriptByInterviewId(
    interviewId: string,
  ): Promise<InterviewTranscript | null> {
    return this.transcriptRepository.findOne({
      where: { interviewId },
    });
  }

  /**
   * Get transcript by ID
   */
  async getTranscriptById(id: string): Promise<InterviewTranscript> {
    const transcript = await this.transcriptRepository.findOne({
      where: { id },
    });

    if (!transcript) {
      throw new NotFoundException(`Transcript ${id} not found`);
    }

    return transcript;
  }

  /**
   * Update transcript segments (for real-time updates)
   */
  async updateTranscriptSegments(
    transcriptId: string,
    segments: TranscriptSegment[],
  ): Promise<InterviewTranscript> {
    const transcript = await this.getTranscriptById(transcriptId);

    transcript.segments = segments;
    transcript.fullText = this.generateFullText(segments);

    return this.transcriptRepository.save(transcript);
  }

  /**
   * Delete transcript
   */
  async deleteTranscript(id: string): Promise<void> {
    await this.transcriptRepository.delete(id);
  }
}
