export interface SB_Documents{
    id?: string;
    profile_id: string;
    document_name?: string;
    type?: string;
    document_path: string;
    enrollment_requirement_id?: string;
    created_at?: string;
}

/**
 * Requerimiento de inscripción (documento requerido)
 */
export interface SB_EnrollmentRequirement {
    id: string;
    description: string;
    is_standard: boolean;
    validity?: string | null;
    who_can_apply?: string | null;
    accepted_format?: string | null;
    applies_to_foreigners?: boolean;
    last_updated?: string;
}

export interface DocumentRecommendationResponse {
    answer: string;
    documents_used: number;
}

export interface DocumentRecommendationError {
    error: string;
}

export interface UserDocument {
  id?: string;
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
}

export interface NewDocumentToSave {
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
  file: File;
}