import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, setProfile } from '../../store/authSlice';
import { getSession } from '../../shared/services/authService.ts';
import { getProfile } from '../../shared/services/profileService';

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const session = await getSession();

      if (!session) {
        navigate('/');
        return;
      }

      dispatch(setUser(session.user));

      const profile = await getProfile(session.user.id);
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
}