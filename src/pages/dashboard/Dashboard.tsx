import { useNavigate } from 'react-router-dom';
import { signOut } from '../../shared/services/authService';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'red' }}>DASHBOARD</h1>
      <button
        onClick={handleSignOut}
        style={{ padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}