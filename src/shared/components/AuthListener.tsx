import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, clearAuth, setEmailConfirmed } from '../../store/authSlice';
import supabase from '../../config/supabase/supabase';

const AuthListener = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setUser(session.user));
      }
    });

    // Escuchar cambios en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch(setUser(session.user));
          dispatch(setEmailConfirmed(!!session.user.email_confirmed_at));
        }
        if (event === 'SIGNED_OUT') {
          dispatch(clearAuth());
          navigate('/login'); // ⬅️ solo esto se agregó
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
};

export default AuthListener;