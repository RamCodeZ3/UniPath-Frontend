export interface SB_Scholarship {
  id: string;
  university_id: string | null;
  title: string;
  status: 'open' | 'closed';
  offered_by: string;
  academic_level?: string;
  covers_tuition: boolean;
  covers_living_expenses: boolean;
  covers_transport: boolean;
  covers_other?: string;
  coverage_amount?: number;
  currency: string;
  application_start_date?: string;
  application_deadline: string;
  scholarship_start_date?: string;
  duration?: string;
  created_at?: string;
  updated_at?: string;
}

export type ScholarshipStatus = 'open' | 'closed' | 'inactive';
export type ScholarshipApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'withdrawn';

export interface SB_ScholarshipApplication {
  id: string;
  scholarship_id: string;
  profile_id: string;
  status: ScholarshipApplicationStatus;
  reviewer_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScholarshipRequirement {
  requirementId: string;
  enrollmentReqId: string;
  description: string;
  notes?: string;
  isMandatory: boolean;
  displayOrder: number;
}

export interface UserDocument {
  id: string;
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
}

export interface ScholarshipRequirementStatus extends ScholarshipRequirement {
  hasExistingDocument: boolean;
  existingDocument?: UserDocument;
}

export interface NewScholarshipDocumentToSave {
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
  file: File;
}