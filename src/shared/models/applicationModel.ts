import type { UserDocument } from "./documentModel";

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

export interface SB_ApplicationDocument {
  id: string;
  application_id: string;
  document_id: string;
  enrollment_requirement_id: string;
  created_at?: string;
}

export interface CreateApplicationDocumentPayload {
  application_id: string;
  document_id: string;
  enrollment_requirement_id: string;
}

export interface UniversityRequirement {
  requirementId: string;
  enrollmentReqId: string;
  description: string;
  notes?: string;
  isStandard: boolean;
}

export interface RequirementStatus extends UniversityRequirement {
  hasExistingDocument: boolean;
  existingDocument?: UserDocument;
}
