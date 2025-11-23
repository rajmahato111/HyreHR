import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import {
  Scorecard,
  InterviewPlan,
  InterviewStage,
  Interview,
  InterviewParticipant,
  InterviewFeedback,
  User,
  SchedulingLink,
  Application,
} from '../../database/entities';
import { InterviewTranscript } from '../../database/entities/interview-transcript.entity';
import { GoogleCalendarService } from './calendar/google-calendar.service';
import { MicrosoftCalendarService } from './calendar/microsoft-calendar.service';
import { TimezoneService } from './calendar/timezone.service';
import { CalendarService } from './calendar/calendar.service';
import { SchedulingLinkService } from './scheduling-link.service';
import { TranscriptionService } from './transcription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scorecard,
      InterviewPlan,
      InterviewStage,
      Interview,
      InterviewParticipant,
      InterviewFeedback,
      User,
      SchedulingLink,
      Application,
      InterviewTranscript,
    ]),
  ],
  controllers: [InterviewsController],
  providers: [
    InterviewsService,
    GoogleCalendarService,
    MicrosoftCalendarService,
    TimezoneService,
    CalendarService,
    SchedulingLinkService,
    TranscriptionService,
  ],
  exports: [InterviewsService, CalendarService, SchedulingLinkService, TranscriptionService],
})
export class InterviewsModule {}
