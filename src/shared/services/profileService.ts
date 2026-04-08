import supabase from '../../config/supabase/supabase';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  birthdate: string | null;
  number: string | null;
  genre: string | null;
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Verifica si el perfil del usuario está completo
 * Un perfil se considera completo si tiene: birthdate, number y genre
 */
export const isProfileComplete = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  return !!(
    profile.birthdate &&
    profile.number &&
    profile.genre
  );
};

/**
 * Obtiene el perfil y verifica si está completo
 * Retorna { profile, isComplete }
 */
export const getProfileWithStatus = async (userId: string): Promise<{ profile: Profile | null; isComplete: boolean }> => {
  const profile = await getProfile(userId);
  return {
    profile,
    isComplete: isProfileComplete(profile),
  };
};

export const updateProfile = async (userId: string, updates: object) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const createProfile = async (userId: string, profileData: {
  name: string;
  birthdate: string;
  number: string;
  genre: string;
}) => {
  // Usar upsert: inserta si no existe, actualiza si ya existe
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, ...profileData },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};