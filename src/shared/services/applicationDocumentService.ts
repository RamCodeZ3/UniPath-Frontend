import supabase from '../../config/supabase/supabase';

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
 * Ahora directamente con enrollment_requirement_id
 */
export interface UserDocument {
  id: string;
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
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
export interface NewDocumentToSave {
  profile_id: string;
  document_path: string;
  enrollment_requirement_id: string;
  file: File;
}

/**
 * Obtener requerimientos de una universidad específica
 */
export async function getUniversityRequirements(
  universityId: string
): Promise<UniversityRequirement[]> {
  try {
    console.log('[getUniversityRequirements] Fetching for university:', universityId);

    // Primero obtener los university_requirements
    const { data: urData, error: urError } = await supabase
      .from('university_requirements')
      .select('id, requirement_id, notes, university_id')
      .eq('university_id', universityId);

    if (urError) {
      console.error('[getUniversityRequirements] Error fetching university_requirements:', urError);
      throw urError;
    }

    console.log('[getUniversityRequirements] University requirements:', urData);

    if (!urData || urData.length === 0) {
      console.warn('[getUniversityRequirements] No requirements found for university:', universityId);
      return [];
    }

    // Obtener todos los requirement_ids
    const requirementIds = urData.map((ur: any) => ur.requirement_id);

    // Luego obtener los enrollment_requirements
    const { data: erData, error: erError } = await supabase
      .from('enrollment_requirements')
      .select('id, description')
      .in('id', requirementIds);

    if (erError) {
      console.error('[getUniversityRequirements] Error fetching enrollment_requirements:', erError);
      throw erError;
    }

    console.log('[getUniversityRequirements] Enrollment requirements:', erData);

    // Mapear y combinar
    return urData.map((ur: any) => {
      const enrollmentReq = erData?.find((er: any) => er.id === ur.requirement_id);
      return {
        requirementId: ur.id,
        enrollmentReqId: ur.requirement_id,
        description: enrollmentReq?.description || 'Desconocido',
        notes: ur.notes,
      };
    });
  } catch (error) {
    console.error('[getUniversityRequirements] Error:', error);
    throw error;
  }
}

/**
 * Obtener documentos existentes del usuario
 * Ahora matchea por enrollment_requirement_id
 */
export async function getUserDocuments(profileId: string): Promise<UserDocument[]> {
  try {
    console.log('[getUserDocuments] Fetching for profile:', profileId);

    const { data, error } = await supabase
      .from('documents')
      .select('id, profile_id, document_path, enrollment_requirement_id, created_at')
      .eq('profile_id', profileId);

    if (error) {
      console.error('[getUserDocuments] Error:', error);
      console.error('[getUserDocuments] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Si hay error pero no es crítico, retornar array vacío
      return [];
    }

    console.log('[getUserDocuments] Data:', data);

    return data || [];
  } catch (error) {
    console.error('[getUserDocuments] Catch error:', error);
    // Retornar vacío en caso de error para permitir continuar
    return [];
  }
}

/**
 * Hacer matching entre requerimientos y documentos existentes
 * Ahora el matching es directo por enrollment_requirement_id
 */
export function matchRequirementsWithDocuments(
  requirements: UniversityRequirement[],
  documents: UserDocument[]
): RequirementStatus[] {
  return requirements.map((req) => {
    // Buscar si existe un documento con el mismo enrollment_requirement_id
    const existingDoc = documents.find(
      (doc) => doc.enrollment_requirement_id === req.enrollmentReqId
    );

    return {
      ...req,
      hasExistingDocument: !!existingDoc,
      existingDocument: existingDoc,
    };
  });
}

/**
 * Subir archivo a Supabase Storage
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
 * Nueva estructura: solo profile_id, document_path, enrollment_requirement_id
 */
export async function saveBatchDocuments(
  documents: Array<{
    profile_id: string;
    document_path: string;
    enrollment_requirement_id: string;
  }>
): Promise<void> {
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
      uploadDocumentToStorage(profileId, doc.file, doc.file.name)
    );

    const uploadedPaths = await Promise.all(uploadPromises);
    console.log('[confirmApplicationWithDocuments] Uploaded paths:', uploadedPaths);

    // 2. Guardar registros en tabla documents
    const docRecords = newDocuments.map((doc) => ({
      profile_id: doc.profile_id,
      document_path: doc.document_path,
      enrollment_requirement_id: doc.enrollment_requirement_id,
    }));

    if (docRecords.length > 0) {
      await saveBatchDocuments(docRecords);
      console.log('[confirmApplicationWithDocuments] Saved documents:', docRecords);
    }

    // 3. Crear registro en applications_for_admission
    await createApplicationRecord(profileId, universityId);
    console.log('[confirmApplicationWithDocuments] Application created');

    return { success: true };
  } catch (error) {
    console.error('Error confirmando aplicación:', error);
    throw error;
  }
}
