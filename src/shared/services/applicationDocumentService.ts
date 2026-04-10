import supabase from '../../config/supabase/supabase';
import type { SB_EnrollmentRequirement } from '../models/documentModel';
import {
  getAllDocumentsByProfileId,
  uploadDocument as uploadDocumentService,
  createDocument as createDocumentService,
} from './documentServices';
import type{ UniversityRequirement, RequirementStatus } from '../models/applicationModel';
import type { UserDocument, NewDocumentToSave } from '../models/documentModel';


export const getStandardRequirements = async(): Promise<SB_EnrollmentRequirement[]> => {
  try {
    
    const { data, error } = await supabase
      .from('enrollment_requirements')
      .select('*')
      .eq('is_standard', true);

    if (error) throw new Error("Hubo un error recibiendo los requerimientos:", error);

    return data || [];
  } catch (error) {
    throw error;
  }
}

export const getUniversityAdditionalRequirements = async (
  universityId: string
): Promise<UniversityRequirement[]> => {
  try {
    const { data: urData, error: urError } = await supabase
      .from('university_requirements')
      .select('id, requirement_id, notes, university_id')
      .eq('university_id', universityId);

    if (urError) {
      console.error('[getUniversityAdditionalRequirements] Error:', urError);
      throw urError;
    }

    if (!urData || urData.length === 0) {
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

    return result;
  } catch (error) {
    console.error('[getUniversityAdditionalRequirements] Error:', error);
    throw error;
  }
}

export const getAllApplicationRequirements = async (
  universityId: string
): Promise<{ standard: UniversityRequirement[]; additional: UniversityRequirement[] }> => {
  try {

    const [standardReqs, additionalReqs] = await Promise.all([
      getStandardRequirements(),
      getUniversityAdditionalRequirements(universityId),
    ]);

    // Convertir estándar al formato UniversityRequirement
    const standardMapped: UniversityRequirement[] = standardReqs.map((req) => ({
      requirementId: req.id,
      enrollmentReqId: req.id.toString().trim().toLowerCase(),
      description: req.description,
      notes: req.validity ? `Vigencia: ${req.validity}` : undefined,
      isStandard: true,
    }));

    return {
      standard: standardMapped,
      additional: additionalReqs,
    };
  } catch (error) {
    console.error('[getAllApplicationRequirements] Error:', error);
    throw error;
  }
}

export const getUniversityRequirements = async (
  universityId: string
): Promise<UniversityRequirement[]> => {
  try {

    const { data: urData, error: urError } = await supabase
      .from('university_requirements')
      .select('id, requirement_id, notes, university_id')
      .eq('university_id', universityId);

    if (urError) {
      console.error('[getUniversityRequirements] Error fetching university_requirements:', urError);
      throw urError;
    }

    if (!urData || urData.length === 0) {
      return [];
    }

    const requirementIds = urData.map((ur: any) => ur.requirement_id);

    const { data: erData, error: erError } = await supabase
      .from('enrollment_requirements')
      .select('id, description')
      .in('id', requirementIds);

    if (erError) {
      console.error('[getUniversityRequirements] Error fetching enrollment_requirements:', erError);
      throw erError;
    }

    // Mapear y combinar
    const result = urData.map((ur: any) => {
      const enrollmentReq = erData?.find((er: any) => er.id === ur.requirement_id);
      const mapped = {
        requirementId: ur.id,
        enrollmentReqId: (ur.requirement_id || '').toString().trim().toLowerCase(),
        description: enrollmentReq?.description || 'Desconocido',
        notes: ur.notes,
        isStandard: false,
      };
      return mapped;
    });
    return result;
  } catch (error) {
    console.error('[getUniversityRequirements] Error:', error);
    throw error;
  }
}

export const getUserDocuments = async (profileId: string): Promise<UserDocument[]> => {
  const docs = await getAllDocumentsByProfileId(profileId);
  return (docs || []).map((doc) => ({
    ...doc,
    enrollment_requirement_id: (doc.enrollment_requirement_id || '').toString().trim().toLowerCase(),
  }));
};

export const matchRequirementsWithDocuments = (
  requirements: UniversityRequirement[],
  documents: UserDocument[]
): RequirementStatus[] => {

  const normalizedDocMap = new Map<string, UserDocument>();
  documents.forEach((doc) => {
    const normalizedId = (doc.enrollment_requirement_id || '').toString().trim().toLowerCase();
    normalizedDocMap.set(normalizedId, doc);
  });

  return requirements.map((req) => {
    const normalizedReqId = (req.enrollmentReqId || '').toString().trim().toLowerCase();
    
    const existingDoc = normalizedDocMap.get(normalizedReqId);

    const result = {
      ...req,
      hasExistingDocument: !!existingDoc,
      existingDocument: existingDoc,
    };

    return result;
  });
}

export const uploadDocumentToStorage = async (
  profileId: string,
  file: File,
  fileName: string
): Promise<string> => {
  // Delegate to shared documentServices.uploadDocument
  return await uploadDocumentService(profileId, file, fileName);
}

export const saveBatchDocuments = async (
  documents: Array<{
    profile_id: string;
    document_path: string;
    enrollment_requirement_id: string;
  }>
): Promise<void> => {
  try {
    // Reuse createDocument for validation and insertion per document
    await Promise.all(
      documents.map((doc) =>
        createDocumentService({
          profile_id: doc.profile_id,
          document_path: doc.document_path,
          enrollment_requirement_id: doc.enrollment_requirement_id,
        })
      )
    );
  } catch (error) {
    console.error('Error guardando documentos en lote:', error);
    throw error;
  }
}

export const createApplicationRecord = async (
  profileId: string,
  universityId: string
): Promise<void> => {
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

export const confirmApplicationWithDocuments = async (
  profileId: string,
  universityId: string,
  newDocuments: NewDocumentToSave[]
): Promise<{ success: boolean }> => {
  try {
    const uploadPromises = newDocuments.map((doc) =>
      uploadDocumentToStorage(profileId, doc.file, doc.file.name)
    );

    const uploadedPaths = await Promise.all(uploadPromises);

    const docRecords = newDocuments.map((doc, idx) => ({
      profile_id: doc.profile_id,
      document_path: uploadedPaths[idx],
      enrollment_requirement_id: doc.enrollment_requirement_id,
    }));

    if (docRecords.length > 0) {
      await saveBatchDocuments(docRecords);
    }

    await createApplicationRecord(profileId, universityId);

    return { success: true };
  } catch (error) {
    console.error('Error confirmando aplicación:', error);
    throw error;
  }
}

export const createApplicationAndGetId = async (
  profileId: string,
  universityId: string
): Promise<string> => {
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


export const saveApplicationDocuments = async (
  applicationId: string,
  documents: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<void> => {
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

  } catch (error) {
    console.error('Error guardando application_documents:', error);
    throw error;
  }
}

export const createApplicationWithDocuments = async (
  profileId: string,
  universityId: string,
  documentsToLink: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<{ applicationId: string; success: boolean }> => {
  try {
    const applicationId = await createApplicationAndGetId(profileId, universityId);

    if (documentsToLink.length > 0) {
      await saveApplicationDocuments(applicationId, documentsToLink);
    }

    return { applicationId, success: true };
  } catch (error) {
    console.error('Error en createApplicationWithDocuments:', error);
    throw error;
  }
}
