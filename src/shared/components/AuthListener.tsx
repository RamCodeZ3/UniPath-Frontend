import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, setProfile, setLoading, setEmailConfirmed } from '../../store/auth/authSlice';
import { getSession, onAuthStateChange } from '../services/authService';
import { getProfileWithStatus } from '../services/profileService';

// Rutas donde NO se debe hacer redirección automática
const AUTH_FLOW_ROUTES = [
  '/auth/callback',
  '/verify-email',
  '/confirm-email',
  '/profile/create',
];

export default function AuthListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isInitialized = useRef(false);

  const isAuthFlowRoute = (pathname: string) => {
    return AUTH_FLOW_ROUTES.some(route => pathname.startsWith(route));
  };

  const redirectBasedOnStatus = async (user: any, forceRedirect = false) => {
    const currentPath = window.location.pathname;
    
    // No redirigir si estamos en una ruta del flujo de auth (a menos que se force)
    if (!forceRedirect && isAuthFlowRoute(currentPath)) {
      console.log('[AuthListener] En ruta de auth flow, no redirigir:', currentPath);
      return;
    }

    const emailConfirmed = !!user.email_confirmed_at;
    dispatch(setEmailConfirmed(emailConfirmed));

    if (!emailConfirmed) {
      // Solo redirigir a verify-email si NO estamos ya ahí
      if (currentPath !== '/verify-email') {
        const email = user.email || '';
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
      }
      return;
    }

    // Verificar si el perfil existe Y está completo
    const { profile, isComplete } = await getProfileWithStatus(user.id).catch(() => ({ profile: null, isComplete: false }));
    dispatch(setProfile(profile));

    if (!isComplete) {
      // Solo redirigir a profile/create si NO estamos ya ahí
      if (!currentPath.startsWith('/profile/create')) {
        const nameFromMetadata = user.user_metadata?.name || user.user_metadata?.full_name || profile?.name || '';
        const provider = user.app_metadata?.provider;
        
        // Google OAuth: step 1 (para confirmar/editar nombre)
        // Email/Password: step 2 (ya ingresó nombre en registro)
        const step = provider === 'google' ? 1 : 2;
        
        navigate(`/profile/create?step=${step}&prefillName=${encodeURIComponent(nameFromMetadata)}`, { replace: true });
      }
      return;
    }

    // Si tiene todo completo, redirigir a dashboard (excepto si ya está ahí)
    if (currentPath !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // Solo inicializar una vez
    if (isInitialized.current) return;
    isInitialized.current = true;

    const currentPath = window.location.pathname;

    console.log('[AuthListener] Inicializando, ruta actual:', currentPath);

    getSession().then((session) => {
      if (session) {
        console.log('[AuthListener] Sesión encontrada:', session.user.email);
        dispatch(setUser(session.user));
        dispatch(setEmailConfirmed(!!session.user.email_confirmed_at));
        
        // Solo redirigir automáticamente si estamos en la página de login (/)
        // y el usuario ya tiene sesión
        if (currentPath === '/') {
          redirectBasedOnStatus(session.user, true);
        }
      }
      dispatch(setLoading(false));
    });

    const { data: { subscription } } = onAuthStateChange(
      async (event, session) => {
        console.log('[AuthListener] Auth event:', event, 'path:', window.location.pathname);
        
        if (event === 'SIGNED_IN' && session) {
          dispatch(setUser(session.user));
          dispatch(setEmailConfirmed(!!session.user.email_confirmed_at));
          // No hacer redirección aquí - dejar que las páginas individuales manejen su flujo
        }
        
        if (event === 'SIGNED_OUT') {
          dispatch(setUser(null));
          dispatch(setProfile(null));
          dispatch(setEmailConfirmed(false));
          navigate('/', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
