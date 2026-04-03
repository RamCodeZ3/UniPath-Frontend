// AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, setProfile, setEmailConfirmed,setLoading } from '../../store/auth/authSlice.ts';
import { getSession } from '../../shared/services/authService.ts';
import { getProfile } from '../../shared/services/profileService';

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const session = await getSession();

      if (!session) {
        navigate('/');
        return;
      }

      const user = session.user;
      const name = user.user_metadata?.full_name || user.email || 'Usuario';
      setUserName(name);

      dispatch(setUser(user));
      dispatch(setEmailConfirmed(!!user.email_confirmed_at)); // ← esto faltaba

      const profile = await getProfile(user.id).catch(() => null);
      dispatch(setProfile(profile));

      dispatch(setLoading(false))

      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
    };

    handleCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2">
      <p className="text-xl font-semibold">¡Bienvenido, {userName}!</p>
      <p className="text-gray-500 text-sm">Cargando sesión...</p>
    </div>
  );
}