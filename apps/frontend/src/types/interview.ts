export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum LocationType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
}

export enum Decision {
  STRONG_YES = 'strong_yes',
  YES = 'yes',
  NEUTRAL = 'neutral',
  NO = 'no',
  STRONG_NO = 'strong_no',
}

export interface InterviewParticipant {
  userId: string;
  role: 'interviewer' | 'coordinator' | 'observer';
  calendarEventId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewStageId?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: InterviewStatus;
  locationType: LocationType;
  locationDetails?: string;
  meetingLink?: string;
  roomId?: string;
  participants: InterviewParticipant[];
  feedback?: InterviewFeedback[];
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      id: string;
      title: string;
    };
  };
  interviewStage?: {
    id: string;
    name: string;
    type: string;
    scorecardId?: string;
  };
}

export interface AttributeRating {
  attributeId: string;
  value: any;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  scorecardId?: string;
  overallRating?: number;
  decision?: Decision;
  attributeRatings: AttributeRating[];
  strengths?: string;
  concerns?: string;
  notes?: string;
  submittedAt?: string;
  createdAt: string;
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scorecard?: Scorecard;
}

export interface ScorecardAttribute {
  id: string;
  name: string;
  type: 'rating' | 'yes_no' | 'text';
  description?: string;
  required: boolean;
  options?: string[];
}

export interface Scorecard {
  id: string;
  organizationId: string;
  name: string;
  attributes: ScorecardAttribute[];
  createdAt: string;
}

export interface InterviewPlan {
  id: string;
  organizationId: string;
  name: string;
  jobId?: string;
  stages?: InterviewStage[];
  createdAt: string;
}

export interface InterviewStage {
  id: string;
  interviewPlanId: string;
  name: string;
  type: string;
  durationMinutes: number;
  orderIndex: number;
  instructions?: string;
  scorecardId?: string;
  scorecard?: Scorecard;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
}

export interface TimeSlot {
  start: string;
  end: string;
  startFormatted: string;
  endFormatted: string;
}

export interface UserAvailability {
  userId: string;
  availability: TimeSlot[];
}

export interface ConflictInfo {
  userId: string;
  conflicts: Array<{
    start: string;
    end: string;
    summary: string;
  }>;
}
