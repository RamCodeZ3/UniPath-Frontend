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
        console.log('[AuthCallback] Getting session...');
        const session = await getSession();
        console.log('[AuthCallback] Session:', session);

        if (!session) {
          console.log('[AuthCallback] No session, redirecting to /');
          navigate('/', { replace: true });
          return;
        }

        const user = session.user;
        console.log('[AuthCallback] User:', user);
        console.log('[AuthCallback] Email confirmed:', !!user.email_confirmed_at);
        console.log('[AuthCallback] User provider:', user.app_metadata?.provider);

        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'Usuario';
        setUserName(name);

        dispatch(setUser(user));

        const emailConfirmed = !!user.email_confirmed_at;
        dispatch(setEmailConfirmed(emailConfirmed));

        if (!emailConfirmed) {
          console.log('[AuthCallback] Email not confirmed, redirecting to /verify-email');
          dispatch(setLoading(false));
          const email = user.email || '';
          navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
          return;
        }

        // Verificar si el perfil existe Y está completo
        console.log('[AuthCallback] Checking profile for user:', user.id);
        const { profile, isComplete } = await getProfileWithStatus(user.id).catch((err) => {
          console.log('[AuthCallback] getProfileWithStatus error:', err);
          return { profile: null, isComplete: false };
        });
        
        console.log('[AuthCallback] Profile:', profile);
        console.log('[AuthCallback] Profile is complete:', isComplete);
        
        dispatch(setProfile(profile));
        dispatch(setLoading(false));

        if (!isComplete) {
          // Perfil no existe o está incompleto -> ir a completar perfil
          // Google OAuth: ir al step 1 para que pueda confirmar/editar su nombre
          const nameFromMetadata = user.user_metadata?.name || user.user_metadata?.full_name || profile?.name || '';
          console.log('[AuthCallback] Profile incomplete, redirecting to /profile/create step 1 with name:', nameFromMetadata);
          navigate(`/profile/create?step=1&prefillName=${encodeURIComponent(nameFromMetadata)}`, { replace: true });
        } else {
          // Perfil completo -> ir al dashboard
          console.log('[AuthCallback] Profile complete, redirecting to /dashboard');
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
