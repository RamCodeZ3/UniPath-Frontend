import supabase from '../../config/supabase/supabase';
import type { SB_ProfileModel } from '../models/profileModel';

export const getProfile = async (userId: string): Promise<SB_ProfileModel | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const isProfileComplete = (profile: SB_ProfileModel | null): boolean => {
  if (!profile) return false;
  
  return !!(
    profile.birthdate &&
    profile.number &&
    profile.genre
  );
};

export const getProfileWithStatus = async (userId: string): Promise<{ profile: SB_ProfileModel | null; isComplete: boolean }> => {
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