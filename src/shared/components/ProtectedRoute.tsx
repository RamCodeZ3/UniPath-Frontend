import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store/store';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, emailConfirmed, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/login" />;

  if (!emailConfirmed) return <Navigate to="/confirm-email" />;

  return children;
};

export default ProtectedRoute;