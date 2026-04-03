import supabase from '../../config/supabase/supabase';

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProfile = async (userId: string, updates: object) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};