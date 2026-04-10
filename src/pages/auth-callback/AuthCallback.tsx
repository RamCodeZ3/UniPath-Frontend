import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, setProfile, setEmailConfirmed, setLoading } from '../../store/auth/authSlice.ts';
import { getSession } from '../../shared/services/authService.ts';
import { getProfileWithStatus } from '../../shared/services/profileService';

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await getSession();

        if (!session) {
          navigate('/', { replace: true });
          return;
        }

        const user = session.user;

        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'Usuario';
        setUserName(name);

        dispatch(setUser(user));

        const emailConfirmed = !!user.email_confirmed_at;
        dispatch(setEmailConfirmed(emailConfirmed));

        if (!emailConfirmed) {
          dispatch(setLoading(false));
          const email = user.email || '';
          navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
          return;
        }

        // Verificar si el perfil existe Y está completo
        const { profile, isComplete } = await getProfileWithStatus(user.id).catch(() => {
          return { profile: null, isComplete: false };
        });
        
        dispatch(setProfile(profile));
        dispatch(setLoading(false));

        if (!isComplete) {
          const nameFromMetadata = user.user_metadata?.name || user.user_metadata?.full_name || profile?.name || '';
          navigate(`/profile/create?step=1&prefillName=${encodeURIComponent(nameFromMetadata)}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        console.error('[AuthCallback] Error:', err);
        setError(err.message || 'Error desconocido');
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <p className="text-xl font-semibold text-red-600">Error</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2">
      <p className="text-xl font-semibold">¡Bienvenido, {userName}!</p>
      <p className="text-gray-500 text-sm">Cargando sesión...</p>
    </div>
  );
}
