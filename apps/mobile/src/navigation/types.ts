import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ApplicationDetail: { applicationId: string };
  InterviewDetail: { interviewId: string };
  InterviewFeedback: { interviewId: string };
  CandidateDetail: { candidateId: string };
  SendEmail: { candidateId: string; applicationId?: string };
};

export type MainTabParamList = {
  Applications: undefined;
  Interviews: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};
