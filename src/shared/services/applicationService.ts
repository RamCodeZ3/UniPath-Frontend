import supabase from '../../config/supabase/supabase';
import type {
  SB_ApplicationForAdmission,
  CreateApplicationPayload,
  ApplicationStatus,
} from '../models/applicationModel';


export const createApplication = async (
  profileId: string,
  universityId: string
): Promise<SB_ApplicationForAdmission> => {
  if (!profileId) throw new Error('El profileId es requerido');
  if (!universityId) throw new Error('El universityId es requerido');

  const payload: CreateApplicationPayload = {
    profile_id: profileId,
    university_id: universityId,
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('applications_for_admission')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear aplicación: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo crear la aplicación');
  }

  return data;
};

export const getApplicationsByProfileId = async (
  profileId: string
): Promise<SB_ApplicationForAdmission[]> => {
  if (!profileId) throw new Error('El profileId es requerido');

  const { data, error } = await supabase
    .from('applications_for_admission')
    .select('*')
    .eq('profile_id', profileId);

  if (error) {
    throw new Error(`Error al obtener aplicaciones: ${error.message}`);
  }

  return data || [];
};

export const isUserAppliedToUniversity = async (
  profileId: string,
  universityId: string
): Promise<boolean> => {
  if (!profileId) throw new Error('El profileId es requerido');
  if (!universityId) throw new Error('El universityId es requerido');

  const { error, count } = await supabase
    .from('applications_for_admission')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('university_id', universityId);

  if (error) {
    throw new Error(`Error al verificar aplicación: ${error.message}`);
  }

  return (count ?? 0) > 0;
};

export const getApplicationById = async (
  applicationId: string
): Promise<SB_ApplicationForAdmission> => {
  if (!applicationId) throw new Error('El applicationId es requerido');

  const { data, error } = await supabase
    .from('applications_for_admission')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (error) {
    throw new Error(`Error al obtener aplicación: ${error.message}`);
  }

  if (!data) {
    throw new Error('Aplicación no encontrada');
  }

  return data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus
): Promise<SB_ApplicationForAdmission> => {
  if (!applicationId) throw new Error('El applicationId es requerido');
  if (!status) throw new Error('El status es requerido');

  const { data, error } = await supabase
    .from('applications_for_admission')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar aplicación: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo actualizar la aplicación');
  }

  return data;
};

export const getApplicationCountByStatus = async (
  profileId: string
): Promise<Record<ApplicationStatus, number>> => {
  if (!profileId) throw new Error('El profileId es requerido');

  const { data, error } = await supabase
    .from('applications_for_admission')
    .select('status')
    .eq('profile_id', profileId);

  if (error) {
    throw new Error(`Error al contar aplicaciones: ${error.message}`);
  }

  const counts: Record<ApplicationStatus, number> = {
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
  };

  if (data) {
    data.forEach((app: any) => {
      counts[app.status as ApplicationStatus]++;
    });
  }

  return counts;
};

export const withdrawApplication = async (
  applicationId: string
): Promise<SB_ApplicationForAdmission> => {
  return updateApplicationStatus(applicationId, 'withdrawn');
};
