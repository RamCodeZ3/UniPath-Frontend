import { Outlet } from 'react-router-dom';
import Auth from './pages/auth/Auth';
import AuthCallback from './pages/auth-callback/AuthCallback';
import ConfirmEmail from './pages/confirm-email/ConfirmEmail';
import VerifyEmail from './pages/verify-email/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import Documents from './pages/documents/Documents';
import Profile from './pages/profile';
import { ProfileCreation } from './pages/profile-creation';
import { UniversityGallery } from './pages/university-gallery';
import { ApplicationDocuments } from './pages/application-documents';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AuthListener from './shared/components/AuthListener';
import { MainLayout } from './shared/components/MainLayout';

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
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/universities',
            element: <UniversityGallery />,
          },
          {
            path: '/documents',
            element: <Documents />,
          },
           {
             path: '/profile',
             element: <Profile />,
           },
           {
             path: '/apply/:universityId',
             element: <ApplicationDocuments />,
           },
         ],
      },
    ],
  },
];

export default routes;
