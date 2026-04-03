// src/pages/auth-callback/AuthCallback.tsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import supabase from '../../config/supabase/supabase';
import { setUser, setProfile } from '../../store/authSlice';

const AuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/login');
        return;
      }

      dispatch(setUser(session.user));

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      dispatch(setProfile(profile));

      if (!profile?.birthdate || !profile?.genre || !profile?.number) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, []);

  return <p>Cargando sesión...</p>;
};

export default AuthCallback;