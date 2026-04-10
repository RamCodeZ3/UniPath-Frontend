export interface SB_University {
  id: string;
  name: string;
  acronym: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  contact_email: string | null;
  type: UniversityType;
  modality: UniversityModality;
  accredited: boolean;
  accrediting_body: string | null;
  status: UniversityStatus;
  logo_url: string | null;
  created_at?: string;
}

export type UniversityType = 'publica' | 'privada';
export type UniversityModality = 'presencial' | 'virtual' | 'semipresencial';
export type UniversityStatus = 'activa' | 'inactiva' | 'en_revision';

export interface SB_EnrollmentRequirement {
  id: string;
  description: string | null;
  validity: string | null;
  who_can_apply: string | null;
  accepted_format: string | null;
  applies_to_foreigners: boolean;
  last_updated?: string;
}

export interface SB_UniversityRequirement {
  id: string;
  university_id: string;
  requirement_id: string;
  notas: string | null;
  enrollment_requirement?: SB_EnrollmentRequirement;
}

export interface UniversityWithDetails extends SB_University {
  university_requirements?: SB_UniversityRequirement[];
  overviews?: {
    id: string;
    comment: string;
    profile_id: string;
  }[];
}

export interface UniversityFilters {
  type?: UniversityType | '';
  modality?: UniversityModality[];
  accredited?: boolean | null;
  status?: UniversityStatus | '';
  search?: string;
  page?: number;
  limit?: number;
}

export const UNIVERSITY_TYPE_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Pública', value: 'publica' },
  { label: 'Privada', value: 'privada' },
] as const;

export const UNIVERSITY_MODALITY_OPTIONS = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Semipresencial', value: 'semipresencial' },
] as const;

export const UNIVERSITY_STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Activa', value: 'activa' },
  { label: 'Inactiva', value: 'inactiva' },
  { label: 'En revisión', value: 'en_revision' },
] as const;
