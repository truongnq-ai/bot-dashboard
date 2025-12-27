export type TrialStatus = 'ACTIVE' | 'EXPIRED' | 'CONSUMED';

export interface Trial {
  id: string;
  userId: string; // User ID (required, user must be authenticated)
  grade: number | null;
  trialStatus: TrialStatus;
  trialStartedAt: string;
  expiresAt: string;
  consumedAt: string | null;
  linkedAccountId: string | null;
  linkedParentName: string | null;
  daysRemaining: number;
  daysUsed: number;
  totalExercises: number;
  skillsLearned: number;
  createdAt: string;
  // Note: deviceId and anonymousId are no longer in student_trial_profile
  // Devices are managed through trial_device table
}

export interface TrialSearchParams {
  userId?: string; // Search by user ID instead of deviceId/anonymousId
  status?: TrialStatus;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UpdateTrialStatusRequest {
  trialStatus: TrialStatus;
}

export type TrialListResponse = import('./common').ResponseObject<import('./common').PageResponse<Trial>>;
export type TrialResponse = import('./common').ResponseObject<Trial>;

