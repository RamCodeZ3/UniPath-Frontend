import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../config/store/store';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, emailConfirmed, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/" />;
  if (!emailConfirmed) return <Navigate to="/confirm-email" />;

  return <>{children}</>;
}