import { useNavigate, NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';
import { signOut } from '../services/authService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export const Navbar = () => {
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.auth);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
    { label: 'Universidades', path: '/universities', icon: 'pi pi-building' },
    { label: 'Documentos', path: '/documents', icon: 'pi pi-file' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src="/favicon/web-app-manifest-512x512.png"
                alt="UniPath"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900">UniPath</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <i className={`${link.icon} text-xs`} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-gray-900 leading-none">
                  {profile.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Estudiante
                </span>
              </div>
            )}
            
            <Button
              icon="pi pi-sign-out"
              label="Cerrar sesión"
              text
              severity="secondary"
              onClick={handleSignOut}
              className="hidden sm:flex text-sm"
            />
            
            <Button
              icon="pi pi-sign-out"
              text
              severity="secondary"
              onClick={handleSignOut}
              className="sm:hidden"
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation (Simple version) */}
      <nav className="md:hidden border-t border-gray-50 flex items-center justify-around py-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors no-underline ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <i className={`${link.icon} text-lg`} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
