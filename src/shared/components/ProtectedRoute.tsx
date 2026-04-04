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

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/" replace />;
  if (!emailConfirmed) return <Navigate to="/verify-email" replace />;
  if (!profile) return <Navigate to="/profile/create" replace />;

  return <>{children}</>;
}
