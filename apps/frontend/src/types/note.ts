export interface Note {
  id: string;
  candidateId: string;
  applicationId?: string;
  content: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  candidateId: string;
  applicationId?: string;
  content: string;
}

export interface UpdateNoteDto {
  content: string;
}
