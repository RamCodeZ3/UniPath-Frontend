import supabase from '../../config/supabase/supabase';
import type {
  ScholarshipApplicationStatus,
  SB_ScholarshipApplication,
  ScholarshipRequirement,
  UserDocument,
  ScholarshipRequirementStatus,
  NewScholarshipDocumentToSave
} from '../models/scholarshipsModel';

import { uploadDocument, createDocument, getAllDocumentsByProfileId } from './documentServices';


export const createScholarshipApplication = async (
  profileId: string,
  scholarshipId: string
): Promise<SB_ScholarshipApplication> => {
  if (!profileId) throw new Error('El profileId es requerido');
  if (!scholarshipId) throw new Error('El scholarshipId es requerido');

  const { data, error } = await supabase
    .from('scholarship_applications')
    .insert({ profile_id: profileId, scholarship_id: scholarshipId, status: 'pending' })
    .select('*')
    .single();

  if (error) throw new Error(`Error al crear aplicación de beca: ${error.message}`);
  if (!data) throw new Error('No se pudo crear la aplicación de beca');

  return data;
};

export const getScholarshipApplicationsByProfileId = async (
  profileId: string
): Promise<SB_ScholarshipApplication[]> => {
  if (!profileId) throw new Error('El profileId es requerido');

  const { data, error } = await supabase
    .from('scholarship_applications')
    .select('*')
    .eq('profile_id', profileId);

  if (error) throw new Error(`Error al obtener aplicaciones de beca: ${error.message}`);

  return data || [];
};

export const getScholarshipApplicationById = async (
  applicationId: string
): Promise<SB_ScholarshipApplication> => {
  if (!applicationId) throw new Error('El applicationId es requerido');

  const { data, error } = await supabase
    .from('scholarship_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (error) throw new Error(`Error al obtener aplicación de beca: ${error.message}`);
  if (!data) throw new Error('Aplicación de beca no encontrada');

  return data;
};

export const isUserAppliedToScholarship = async (
  profileId: string,
  scholarshipId: string
): Promise<boolean> => {
  if (!profileId) throw new Error('El profileId es requerido');
  if (!scholarshipId) throw new Error('El scholarshipId es requerido');

  const { error, count } = await supabase
    .from('scholarship_applications')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('scholarship_id', scholarshipId);

  if (error) throw new Error(`Error al verificar aplicación de beca: ${error.message}`);

  return (count ?? 0) > 0;
};

export const updateScholarshipApplicationStatus = async (
  applicationId: string,
  status: ScholarshipApplicationStatus,
  reviewerNotes?: string
): Promise<SB_ScholarshipApplication> => {
  if (!applicationId) throw new Error('El applicationId es requerido');
  if (!status) throw new Error('El status es requerido');

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'in_review' || status === 'approved' || status === 'rejected') {
    updatePayload.reviewed_at = new Date().toISOString();
  }

  if (reviewerNotes !== undefined) {
    updatePayload.reviewer_notes = reviewerNotes;
  }

  const { data, error } = await supabase
    .from('scholarship_applications')
    .update(updatePayload)
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) throw new Error(`Error al actualizar aplicación de beca: ${error.message}`);
  if (!data) throw new Error('No se pudo actualizar la aplicación de beca');

  return data;
};

export const submitScholarshipApplication = async (
  applicationId: string
): Promise<SB_ScholarshipApplication> => {
  if (!applicationId) throw new Error('El applicationId es requerido');

  const { data, error } = await supabase
    .from('scholarship_applications')
    .update({ status: 'in_review', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) throw new Error(`Error al enviar aplicación de beca: ${error.message}`);
  if (!data) throw new Error('No se pudo enviar la aplicación de beca');

  return data;
};

export const withdrawScholarshipApplication = async (
  applicationId: string
): Promise<SB_ScholarshipApplication> => {
  return updateScholarshipApplicationStatus(applicationId, 'withdrawn');
};

export const getScholarshipApplicationCountByStatus = async (
  profileId: string
): Promise<Record<ScholarshipApplicationStatus, number>> => {
  if (!profileId) throw new Error('El profileId es requerido');

  const { data, error } = await supabase
    .from('scholarship_applications')
    .select('status')
    .eq('profile_id', profileId);

  if (error) throw new Error(`Error al contar aplicaciones de beca: ${error.message}`);

  const counts: Record<ScholarshipApplicationStatus, number> = {
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  };

  if (data) {
    data.forEach((app: any) => {
      counts[app.status as ScholarshipApplicationStatus]++;
    });
  }

  return counts;
};



export async function getScholarshipRequirements(
  scholarshipId: string
): Promise<ScholarshipRequirement[]> {
  if (!scholarshipId) throw new Error('El scholarshipId es requerido');

  const { data: srData, error: srError } = await supabase
    .from('scholarship_requirements')
    .select('id, enrollment_requirement_id, is_mandatory, notes, display_order')
    .eq('scholarship_id', scholarshipId)
    .order('display_order', { ascending: true });

  if (srError) throw srError;
  if (!srData || srData.length === 0) return [];

  const enrollmentReqIds = srData.map((sr: any) => sr.enrollment_requirement_id);

  const { data: erData, error: erError } = await supabase
    .from('enrollment_requirements')
    .select('id, description')
    .in('id', enrollmentReqIds);

  if (erError) throw erError;

  return srData.map((sr: any) => {
    const enrollmentReq = erData?.find((er: any) => er.id === sr.enrollment_requirement_id);
    return {
      requirementId: sr.id,
      enrollmentReqId: (sr.enrollment_requirement_id || '').toString().trim().toLowerCase(),
      description: enrollmentReq?.description || 'Desconocido',
      notes: sr.notes,
      isMandatory: sr.is_mandatory,
      displayOrder: sr.display_order,
    };
  });
}

export async function getUserDocuments(profileId: string): Promise<UserDocument[]> {
  if (!profileId) throw new Error('El profileId es requerido');

  const documents = await getAllDocumentsByProfileId(profileId);
  return (documents || []).map((doc: any) => ({
    id: doc.id,
    profile_id: doc.profile_id,
    document_path: doc.document_path,
    enrollment_requirement_id: (doc.enrollment_requirement_id || '').toString().trim().toLowerCase(),
  }));
}

export function matchRequirementsWithDocuments(
  requirements: ScholarshipRequirement[],
  documents: UserDocument[]
): ScholarshipRequirementStatus[] {
  const normalizedDocMap = new Map<string, UserDocument>();
  documents.forEach((doc) => {
    const normalizedId = (doc.enrollment_requirement_id || '').toString().trim().toLowerCase();
    normalizedDocMap.set(normalizedId, doc);
  });

  return requirements.map((req) => {
    const normalizedReqId = (req.enrollmentReqId || '').toString().trim().toLowerCase();
    const existingDoc = normalizedDocMap.get(normalizedReqId);
    return {
      ...req,
      hasExistingDocument: !!existingDoc,
      existingDocument: existingDoc,
    };
  });
}

export async function uploadDocumentToStorage(
  profileId: string,
  file: File | Blob,
  fileName?: string
): Promise<string> {
  return await uploadDocument(profileId, file, fileName);
}

export async function saveBatchDocuments(
  documents: Array<{
    profile_id: string;
    document_path: string;
    enrollment_requirement_id: string;
  }>
): Promise<void> {
  // Use `createDocument` for each record to leverage documentServices validations
  const createPromises = documents.map((doc) =>
    createDocument({
      profile_id: doc.profile_id,
      document_path: doc.document_path,
      enrollment_requirement_id: doc.enrollment_requirement_id,
    })
  );

  await Promise.all(createPromises);
}

export async function createScholarshipApplicationAndGetId(
  profileId: string,
  scholarshipId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('scholarship_applications')
    .insert({ profile_id: profileId, scholarship_id: scholarshipId, status: 'pending' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveScholarshipApplicationDocuments(
  applicationId: string,
  documents: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<void> {
  const records = documents.map((doc) => ({
    application_id: applicationId,
    document_id: doc.document_id,
    enrollment_requirement_id: doc.enrollment_requirement_id,
  }));

  const { error } = await supabase.from('scholarship_application_documents').insert(records);
  if (error) throw error;
}

export async function createScholarshipApplicationWithDocuments(
  profileId: string,
  scholarshipId: string,
  documentsToLink: Array<{ document_id: string; enrollment_requirement_id: string }>
): Promise<{ applicationId: string; success: boolean }> {
  const applicationId = await createScholarshipApplicationAndGetId(profileId, scholarshipId);

  if (documentsToLink.length > 0) {
    await saveScholarshipApplicationDocuments(applicationId, documentsToLink);
  }

  return { applicationId, success: true };
}

export async function confirmScholarshipApplicationWithDocuments(
  profileId: string,
  scholarshipId: string,
  newDocuments: NewScholarshipDocumentToSave[]
): Promise<{ success: boolean }> {
  const createdDocs = await Promise.all(
    newDocuments.map(async (doc) => {
      const publicUrl = await uploadDocumentToStorage(profileId, doc.file, doc.file.name);
      return createDocument({
        profile_id: doc.profile_id,
        document_path: publicUrl,
        enrollment_requirement_id: doc.enrollment_requirement_id,
      });
    })
  );

  if (createdDocs.length > 0) {
    // proceed to create the scholarship application
  }

  await supabase
    .from('scholarship_applications')
    .insert({ profile_id: profileId, scholarship_id: scholarshipId, status: 'pending' });

  return { success: true };
}

export async function getScholarshipApplicationDocuments(
  applicationId: string
): Promise<Array<{ id: string; application_id: string; enrollment_requirement_id: string; document_id: string | null; document_path: string | null; uploaded_at: string | null }>> {
  if (!applicationId) throw new Error('El applicationId es requerido');

  const { data, error } = await supabase
    .from('scholarship_application_documents')
    .select('*')
    .eq('application_id', applicationId);

  if (error) throw new Error(`Error al obtener documentos de aplicación de beca: ${error.message}`);

  return data || [];
}