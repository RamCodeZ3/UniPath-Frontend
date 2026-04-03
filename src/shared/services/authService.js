// src/services/authService.js
import { supabase } from '../config/supabase/supabase';

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) console.error('Error al iniciar sesión:', error);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error al cerrar sesión:', error);
};