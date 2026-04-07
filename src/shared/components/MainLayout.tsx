import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import AuthListener from './AuthListener';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthListener />
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
