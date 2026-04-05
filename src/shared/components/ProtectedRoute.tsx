import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store/store';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, emailConfirmed, profile, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Construir la URL de redirección a profile/create con los parámetros necesarios
  const profileCreateUrl = useMemo(() => {
    if (!user) return '/profile/create';
    
    const nameFromMetadata = user.user_metadata?.name || user.user_metadata?.full_name || '';
    const provider = user.app_metadata?.provider;
    
    // Google OAuth: step 1 (para confirmar/editar nombre)
    // Email/Password: step 2 (ya ingresó nombre en registro)
    const step = provider === 'google' ? 1 : 2;
    
    const params = new URLSearchParams();
    params.set('step', String(step));
    if (nameFromMetadata) {
      params.set('prefillName', nameFromMetadata);
    }
    
    return `/profile/create?${params.toString()}`;
  }, [user]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!emailConfirmed) return <Navigate to="/verify-email" replace />;
  if (!profile) return <Navigate to={profileCreateUrl} replace />;

  return <>{children}</>;
}
