import Login from './pages/login/Login';
import AuthCallback from './pages/auth-callback/AuthCallback';
import ConfirmEmail from './pages/confirm-email/ConfirmEmail';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './shared/components/ProtectedRoute';

const routes = [
  {
    path: '/login',
    element: <Login />,
  },

  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/confirm-email',
    element: <ConfirmEmail />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
      <Dashboard />{/* tu página principal */}
      </ProtectedRoute>
    ),
  },
];

export default routes;