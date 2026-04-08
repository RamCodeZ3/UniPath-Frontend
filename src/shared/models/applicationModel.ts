export interface SB_ApplicationForAdmission {
  id: string;
  profile_id: string;
  university_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at?: string;
  updated_at?: string;
}

export interface CreateApplicationPayload {
  profile_id: string;
  university_id: string;
  status?: 'pending';
}

export interface ApplicationCheckResult {
  universityId: string;
  applied: boolean;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
