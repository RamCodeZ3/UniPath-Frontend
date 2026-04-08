import supabase from '../../config/supabase/supabase';
import type {
  SB_ApplicationForAdmission,
  CreateApplicationPayload,
  ApplicationStatus,
} from '../models/applicationModel';

/**
 * Crea una nueva solicitud de admisión a una universidad
 * @param profileId - ID del perfil del usuario
 * @param universityId - ID de la universidad
 * @returns La aplicación creada
 */
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

/**
 * Obtiene todas las solicitudes de un usuario
 * @param profileId - ID del perfil del usuario
 * @returns Lista de aplicaciones
 */
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

/**
 * Verifica si un usuario ya aplicó a una universidad específica
 * @param profileId - ID del perfil del usuario
 * @param universityId - ID de la universidad
 * @returns true si ya aplicó, false en caso contrario
 */
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

/**
 * Obtiene una aplicación específica por ID
 * @param applicationId - ID de la aplicación
 * @returns La aplicación
 */
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

/**
 * Actualiza el estado de una aplicación
 * @param applicationId - ID de la aplicación
 * @param status - Nuevo estado
 * @returns La aplicación actualizada
 */
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

/**
 * Obtiene el conteo de aplicaciones de un usuario por estado
 * @param profileId - ID del perfil del usuario
 * @returns Objeto con conteo de aplicaciones por estado
 */
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

/**
 * Retira una solicitud de admisión
 * @param applicationId - ID de la aplicación
 * @returns La aplicación actualizada
 */
export const withdrawApplication = async (
  applicationId: string
): Promise<SB_ApplicationForAdmission> => {
  return updateApplicationStatus(applicationId, 'withdrawn');
};
