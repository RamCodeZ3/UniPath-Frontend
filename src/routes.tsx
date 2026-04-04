import { Outlet } from 'react-router-dom';
import Auth from './pages/auth/Auth';
import AuthCallback from './pages/auth-callback/AuthCallback';
import ConfirmEmail from './pages/confirm-email/ConfirmEmail';
import VerifyEmail from './pages/verify-email/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import { ProfileCreation } from './pages/profile-creation';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AuthListener from './shared/components/AuthListener';

function RootLayout() {
  return (
    <>
      <AuthListener />
      <Outlet />
    </>
  );
}

const routes = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Auth />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/confirm-email',
        element: <ConfirmEmail />,
      },
      {
        path: '/profile/create',
        element: <ProfileCreation />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

export default routes;
