// Modelo principal de Universidad
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
  created_at?: string;
}

// Tipos para los filtros
export type UniversityType = 'publica' | 'privada';
export type UniversityModality = 'presencial' | 'virtual' | 'hibrida';
export type UniversityStatus = 'activa' | 'inactiva' | 'en_revision';

// Requisitos de inscripción (tabla base)
export interface SB_EnrollmentRequirement {
  id: string;
  description: string | null;
  validity: string | null;
  who_can_apply: string | null;
  accepted_format: string | null;
  applies_to_foreigners: boolean;
  last_updated?: string;
}

// Relación universidad-requisitos (tabla intermedia con notas)
export interface SB_UniversityRequirement {
  id: string;
  university_id: string;
  requirement_id: string;
  notas: string | null;
  // Relación expandida
  enrollment_requirement?: SB_EnrollmentRequirement;
}

// Universidad con datos relacionados (para el detalle)
export interface UniversityWithDetails extends SB_University {
  university_requirements?: SB_UniversityRequirement[];
  overviews?: {
    id: string;
    comment: string;
    profile_id: string;
  }[];
}

// Interfaz para los filtros de búsqueda
export interface UniversityFilters {
  type?: UniversityType | '';
  modality?: UniversityModality[];
  accredited?: boolean | null;
  status?: UniversityStatus | '';
  search?: string;
}

// Opciones para los selects/dropdowns
export const UNIVERSITY_TYPE_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Pública', value: 'publica' },
  { label: 'Privada', value: 'privada' },
] as const;

export const UNIVERSITY_MODALITY_OPTIONS = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Híbrida', value: 'hibrida' },
] as const;

export const UNIVERSITY_STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Activa', value: 'activa' },
  { label: 'Inactiva', value: 'inactiva' },
  { label: 'En revisión', value: 'en_revision' },
] as const;
