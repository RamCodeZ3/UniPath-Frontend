/**
 * Service para manejar los documentos principales del perfil basados en los requerimientos de la base de datos
 */
import supabase from '../../config/supabase/supabase';

/**
 * Lista de descripciones exactas o parciales para identificar los 6 documentos principales
 * en la tabla enrollment_requirements de la base de datos.
 */
export const MAIN_DOCUMENT_DESCRIPTIONS = [
  'Acta de nacimiento legalizada reciente',
  'Certificado de bachiller',
  'Record de notas 4 firmas',
  'Foto 2x2',
  'Certificado Médico',
  'Cédula ambos lados',
];

/**
 * Obtener todos los requerimientos de inscripción disponibles
 */
export async function getAllEnrollmentRequirements() {
  try {
    const { data, error } = await supabase
      .from('enrollment_requirements')
      .select('id, description')
      .order('description', { ascending: true });

    if (error) {
      console.error('Error fetching enrollment requirements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllEnrollmentRequirements:', error);
    return [];
  }
}

/**
 * Obtener documentos principales del usuario
 */
export async function getUserMainDocuments(profileId: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, profile_id, document_path, enrollment_requirement_id')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching main documents from Supabase:', error);
      console.error('Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserMainDocuments:', error);
    return [];
  }
}

/**
 * Subir archivo a Supabase Storage
 */
export async function uploadDocumentToStorage(
  profileId: string,
  file: File,
  requirementId: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `${requirementId}_${timestamp}_${file.name}`;
    const filePath = `${profileId}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents_users')
      .upload(filePath, file, { upsert: false });

    if (error) {
      throw error;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents_users/${filePath}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading document to storage:', error);
    throw error;
  }
}

/**
 * Guardar documento en la tabla documents vinculándolo a un enrollment_requirement_id
 */
export async function saveDocumentRecord(
  profileId: string,
  documentPath: string,
  enrollmentRequirementId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .insert({
        profile_id: profileId,
        document_path: documentPath,
        enrollment_requirement_id: enrollmentRequirementId,
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving document record:', error);
    throw error;
  }
}

/**
 * Eliminar documento
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
