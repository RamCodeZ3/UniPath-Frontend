import supabase from '../../config/supabase/supabase';
import type { SB_EnrollmentRequirement } from '../models/documentModel';

/**
 * Interface para un requerimiento de una universidad
 */
export interface UniversityRequirement {
  requirementId: string;
  enrollmentReqId: string;
  description: string;
  notes?: string;
  isStandard: boolean;
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
 * Obtener todos los documentos estándar (is_standard = true)
 */
export async function getStandardRequirements(): Promise<SB_EnrollmentRequirement[]> {
  try {
    console.log('[getStandardRequirements] Fetching standard requirements...');
    
    const { data, error } = await supabase
      .from('enrollment_requirements')
      .select('*')
      .eq('is_standard', true);

    if (error) {
      console.error('[getStandardRequirements] Error:', error);
      throw error;
    }

    console.log('[getStandardRequirements] Found:', data?.length || 0, 'standard requirements');
    return data || [];
  } catch (error) {
    console.error('[getStandardRequirements] Error:', error);
    throw error;
  }
}

/**
 * Obtener requerimientos adicionales de una universidad específica (no estándar)
 */
export async function getUniversityAdditionalRequirements(
  universityId: string
): Promise<UniversityRequirement[]> {
  try {
    console.log('[getUniversityAdditionalRequirements] Fetching for university:', universityId);

    // Obtener university_requirements con sus enrollment_requirements
    const { data: urData, error: urError } = await supabase
      .from('university_requirements')
      .select('id, requirement_id, notes, university_id')
      .eq('university_id', universityId);

    if (urError) {
      console.error('[getUniversityAdditionalRequirements] Error:', urError);
      throw urError;
    }

    if (!urData || urData.length === 0) {
      console.log('[getUniversityAdditionalRequirements] No additional requirements found');
      return [];
    }

    // Obtener los enrollment_requirements que NO son estándar
    const requirementIds = urData.map((ur: any) => ur.requirement_id);
    
    const { data: erData, error: erError } = await supabase
      .from('enrollment_requirements')
      .select('id, description, is_standard')
      .in('id', requirementIds)
      .eq('is_standard', false);

    if (erError) {
      console.error('[getUniversityAdditionalRequirements] Error fetching enrollment_requirements:', erError);
      throw erError;
    }

    // Mapear solo los adicionales (no estándar)
    const result = urData
      .filter((ur: any) => erData?.some((er: any) => er.id === ur.requirement_id))
      .map((ur: any) => {
        const enrollmentReq = erData?.find((er: any) => er.id === ur.requirement_id);
        return {
          requirementId: ur.id,
          enrollmentReqId: (ur.requirement_id || '').toString().trim().toLowerCase(),
          description: enrollmentReq?.description || 'Desconocido',
          notes: ur.notes,
          isStandard: false,
        };
      });

    console.log('[getUniversityAdditionalRequirements] Found:', result.length, 'additional requirements');
    return result;
  } catch (error) {
    console.error('[getUniversityAdditionalRequirements] Error:', error);
    throw error;
  }
}

/**
 * Obtener TODOS los requerimientos para una aplicación:
 * - Documentos estándar (siempre requeridos)
 * - Documentos adicionales de la universidad
 */
export async function getAllApplicationRequirements(
  universityId: string
): Promise<{ standard: UniversityRequirement[]; additional: UniversityRequirement[] }> {
  try {
    console.log('[getAllApplicationRequirements] Fetching all requirements for university:', universityId);

    // Obtener estándar y adicionales en paralelo
    const [standardReqs, additionalReqs] = await Promise.all([
      getStandardRequirements(),
      getUniversityAdditionalRequirements(universityId),
    ]);

    // Convertir estándar al formato UniversityRequirement
    const standardMapped: UniversityRequirement[] = standardReqs.map((req) => ({
      requirementId: req.id, // Para estándar, usamos el mismo ID
      enrollmentReqId: req.id.toString().trim().toLowerCase(),
      description: req.description,
      notes: req.validity ? `Vigencia: ${req.validity}` : undefined,
      isStandard: true,
    }));

    console.log('[getAllApplicationRequirements] Standard:', standardMapped.length, 'Additional:', additionalReqs.length);

    return {
      standard: standardMapped,
      additional: additionalReqs,
    };
  } catch (error) {
    console.error('[getAllApplicationRequirements] Error:', error);
    throw error;
  }
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
    const result = urData.map((ur: any) => {
      const enrollmentReq = erData?.find((er: any) => er.id === ur.requirement_id);
      const mapped = {
        requirementId: ur.id,
        enrollmentReqId: (ur.requirement_id || '').toString().trim().toLowerCase(), // Normalize: trim and lowercase
        description: enrollmentReq?.description || 'Desconocido',
        notes: ur.notes,
        isStandard: false, // Los que vienen de university_requirements son adicionales
      };
      console.log('[getUniversityRequirements] Mapped requirement:', {
        requirementId: mapped.requirementId,
        enrollmentReqId: mapped.enrollmentReqId,
        type: typeof mapped.enrollmentReqId,
        description: mapped.description,
      });
      return mapped;
    });
    console.log('[getUniversityRequirements] Final result:', result);
    return result;
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

    // Verificar que el usuario esté autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[getUserDocuments] Current session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      sessionError,
    });

    if (!session?.user?.id) {
      console.warn('[getUserDocuments] No authenticated session found');
      return [];
    }

    // Intentar consulta normal primero (con RLS)
    const { data, error } = await supabase
      .from('documents')
      .select('id, profile_id, document_path, enrollment_requirement_id')
      .eq('profile_id', profileId);

    if (error) {
      console.error('[getUserDocuments] RLS query error:', error);
      console.error('[getUserDocuments] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Si falla por RLS, intentar alternativa: usar rpc() si existe
      console.warn('[getUserDocuments] Intentando consulta alternativa sin RLS restrictions...');
      
      // Intenta usando auth header directamente como último recurso
      try {
        const { data: altData } = await supabase
          .from('documents')
          .select('id, profile_id, document_path, enrollment_requirement_id')
          .eq('profile_id', profileId)
          .throwOnError();
        
        if (altData) {
          console.log('[getUserDocuments] Alternate query succeeded:', altData);
          return (altData || []).map((doc) => ({
            ...doc,
            enrollment_requirement_id: (doc.enrollment_requirement_id || '').toString().trim().toLowerCase(),
          }));
        }
      } catch (altError) {
        console.error('[getUserDocuments] Alternate query also failed:', altError);
      }

      // Si ambas fallan, retornar vacío
      console.warn('[getUserDocuments] Could not fetch documents - returning empty array');
      return [];
    }

    console.log('[getUserDocuments] Data retrieved successfully:', data);

    if (data && data.length > 0) {
      console.log(`[getUserDocuments] Found ${data.length} documents for profile ${profileId}`);
      data.forEach((doc: UserDocument, index: number) => {
        // Normalize enrollment_requirement_id: trim, lowercase
        const normalizedId = (doc.enrollment_requirement_id || '').toString().trim().toLowerCase();
        console.log(`[getUserDocuments] Document ${index}:`, {
          id: doc.id,
          profile_id: doc.profile_id,
          document_path: doc.document_path,
          enrollment_requirement_id: doc.enrollment_requirement_id,
          normalizedId: normalizedId,
          type: typeof doc.enrollment_requirement_id,
        });
      });
    } else {
      console.log('[getUserDocuments] No documents found for this profile');
    }

    // Return with normalized IDs (trim and lowercase)
    return (data || []).map((doc) => ({
      ...doc,
      enrollment_requirement_id: (doc.enrollment_requirement_id || '').toString().trim().toLowerCase(),
    }));
  } catch (error) {
    console.error('[getUserDocuments] Catch error:', error);
    // Retornar vacío en caso de error para permitir continuar
    return [];
  }
}

/**
 * Hacer matching entre requerimientos y documentos existentes
 * Ahora el matching es directo por enrollment_requirement_id
 * Comparación case-insensitive y con trim para máxima robustez
 */
export function matchRequirementsWithDocuments(
  requirements: UniversityRequirement[],
  documents: UserDocument[]
): RequirementStatus[] {
  console.log('[matchRequirementsWithDocuments] Starting match...');
  console.log('[matchRequirementsWithDocuments] Requirements count:', requirements.length);
  console.log('[matchRequirementsWithDocuments] Documents count:', documents.length);

  // Normalizar todos los IDs de documentos para búsqueda rápida
  const normalizedDocMap = new Map<string, UserDocument>();
  documents.forEach((doc) => {
    const normalizedId = (doc.enrollment_requirement_id || '').toString().trim().toLowerCase();
    normalizedDocMap.set(normalizedId, doc);
    console.log('[matchRequirementsWithDocuments] Added to map:', {
      normalizedId,
      originalId: doc.enrollment_requirement_id,
    });
  });

  return requirements.map((req) => {
    // Normalizar el ID del requerimiento de la misma manera
    const normalizedReqId = (req.enrollmentReqId || '').toString().trim().toLowerCase();
    
    // Buscar en el mapa normalizado
    const existingDoc = normalizedDocMap.get(normalizedReqId);

    console.log('[matchRequirementsWithDocuments] Comparing requirement:', {
      normalizedReqId,
      originalReqId: req.enrollmentReqId,
      found: !!existingDoc,
      documentId: existingDoc?.id,
      description: req.description,
    });

    const result = {
      ...req,
      hasExistingDocument: !!existingDoc,
      existingDocument: existingDoc,
    };

    return result;
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

/**
 * Crear registro de aplicación y retornar el ID
 */
export async function createApplicationAndGetId(
  profileId: string,
  universityId: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('applications_for_admission')
      .insert({
        profile_id: profileId,
        university_id: universityId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error creando aplicación:', error);
    throw error;
  }
}

/**
 * Guardar documentos asociados a una aplicación en application_documents
 */
export async function saveApplicationDocuments(
  applicationId: string,
  documents: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<void> {
  try {
    const records = documents.map((doc) => ({
      application_id: applicationId,
      document_id: doc.document_id,
      enrollment_requirement_id: doc.enrollment_requirement_id,
    }));

    const { error } = await supabase.from('application_documents').insert(records);

    if (error) {
      throw error;
    }

    console.log('[saveApplicationDocuments] Saved', records.length, 'application documents');
  } catch (error) {
    console.error('Error guardando application_documents:', error);
    throw error;
  }
}

/**
 * FLUJO COMPLETO: Crear aplicación con todos los documentos vinculados
 * 1. Crea registro en applications_for_admission
 * 2. Guarda relaciones en application_documents
 */
export async function createApplicationWithDocuments(
  profileId: string,
  universityId: string,
  documentsToLink: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<{ applicationId: string; success: boolean }> {
  try {
    // 1. Crear aplicación y obtener ID
    const applicationId = await createApplicationAndGetId(profileId, universityId);
    console.log('[createApplicationWithDocuments] Application created with ID:', applicationId);

    // 2. Guardar relaciones de documentos
    if (documentsToLink.length > 0) {
      await saveApplicationDocuments(applicationId, documentsToLink);
    }

    return { applicationId, success: true };
  } catch (error) {
    console.error('Error en createApplicationWithDocuments:', error);
    throw error;
  }
}
