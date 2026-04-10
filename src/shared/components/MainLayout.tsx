import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import AuthListener from './AuthListener';

export function MainLayout(){
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthListener />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
