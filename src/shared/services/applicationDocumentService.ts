import supabase from '../../config/supabase/supabase';
import type { SB_Documents } from '../models/documentModel';

/**
 * Interface para un requerimiento de una universidad
 */
export interface UniversityRequirement {
  requirementId: string;
  enrollmentReqId: string;
  description: string;
  notes?: string;
}

/**
 * Interface para información de documentos del usuario
 */
export interface UserDocument {
  id: string;
  profile_id: string;
  document_name: string;
  type: string;
  document_path: string;
  created_at?: string;
}

/**
 * Interface para estado de requerimiento con matching
 */
export interface RequirementStatus extends UniversityRequirement {
  hasExistingDocument: boolean;
  existingDocument?: UserDocument;
}

/**
 * Interface para documentos nuevos a guardar
 */
export interface NewDocumentToSave extends Omit<SB_Documents, 'id'> {
  file: File;
}

/**
 * Obtener requerimientos de una universidad específica
 * Hace JOIN con enrollment_requirements para obtener descripción y notas
 */
export async function getUniversityRequirements(
  universityId: string
): Promise<UniversityRequirement[]> {
  try {
    const { data, error } = await supabase
      .from('university_requirements')
      .select(
        `
        id,
        requirement_id,
        notes,
        enrollment_requirements!inner(description)
      `
      )
      .eq('university_id', universityId);

    if (error) {
      throw error;
    }

    return (data || []).map((req: any) => ({
      requirementId: req.id,
      enrollmentReqId: req.requirement_id,
      description: req.enrollment_requirements?.description || 'Desconocido',
      notes: req.notes,
    }));
  } catch (error) {
    console.error('Error obteniendo requerimientos:', error);
    throw error;
  }
}

/**
 * Obtener documentos existentes del usuario
 */
export async function getUserDocuments(profileId: string): Promise<UserDocument[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, profile_id, document_name, type, document_path, created_at')
      .eq('profile_id', profileId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo documentos del usuario:', error);
    throw error;
  }
}

/**
 * Hacer matching entre requerimientos y documentos existentes
 * Retorna lista de requerimientos con información de si ya tiene documento
 */
export function matchRequirementsWithDocuments(
  requirements: UniversityRequirement[],
  documents: UserDocument[]
): RequirementStatus[] {
  return requirements.map((req) => {
    const existingDoc = documents.find((doc) => doc.type === req.description);

    return {
      ...req,
      hasExistingDocument: !!existingDoc,
      existingDocument: existingDoc,
    };
  });
}

/**
 * Subir archivo a Supabase Storage
 * Retorna la URL pública del archivo
 */
export async function uploadDocumentToStorage(
  profileId: string,
  file: File,
  fileName: string
): Promise<string> {
  try {
    const filePath = `${profileId}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents_users')
      .upload(filePath, file, {
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents_users/${filePath}`;

    return publicUrl;
  } catch (error) {
    console.error('Error subiendo archivo a storage:', error);
    throw error;
  }
}

/**
 * Guardar lote de documentos en la tabla documents
 */
export async function saveBatchDocuments(documents: SB_Documents[]): Promise<void> {
  try {
    const { error } = await supabase.from('documents').insert(documents);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error guardando documentos en lote:', error);
    throw error;
  }
}

/**
 * Crear registro de aplicación a universidad
 */
export async function createApplicationRecord(
  profileId: string,
  universityId: string
): Promise<void> {
  try {
    const { error } = await supabase.from('applications_for_admission').insert({
      profile_id: profileId,
      university_id: universityId,
      status: 'pending',
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creando aplicación:', error);
    throw error;
  }
}

/**
 * FLUJO PRINCIPAL: Confirmar aplicación con documentos
 * 1. Sube archivos a storage
 * 2. Guarda registros en tabla documents
 * 3. Crea registro en applications_for_admission
 */
export async function confirmApplicationWithDocuments(
  profileId: string,
  universityId: string,
  newDocuments: NewDocumentToSave[]
): Promise<{ success: boolean }> {
  try {
    // 1. Subir archivos a storage
    const uploadPromises = newDocuments.map((doc) =>
      uploadDocumentToStorage(profileId, doc.file, doc.document_name)
    );

    await Promise.all(uploadPromises);

    // 2. Guardar registros en tabla documents
    const docRecords: SB_Documents[] = newDocuments.map((doc) => ({
      profile_id: doc.profile_id,
      document_name: doc.document_name,
      type: doc.type,
      document_path: doc.document_path,
    }));

    if (docRecords.length > 0) {
      await saveBatchDocuments(docRecords);
    }

    // 3. Crear registro en applications_for_admission
    await createApplicationRecord(profileId, universityId);

    return { success: true };
  } catch (error) {
    console.error('Error confirmando aplicación:', error);
    throw error;
  }
}
