import { useNavigate, NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { signOut } from '../services/authService';
import { useSelector } from 'react-redux';
import { useRef } from 'react';
import type { RootState } from '../../store/store';
import type { MenuItem } from 'primereact/menuitem';

export const Navbar = () => {
  const navigate = useNavigate();
  const { profile, user } = useSelector((state: RootState) => state.auth);
  const menu = useRef<Menu>(null);

  const userName = profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuario';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
    { label: 'Universidades', path: '/universities', icon: 'pi pi-building' },
  ];

  const userMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      template: (item, options) => {
          return (
              <button 
                  onClick={(e) => { navigate('/profile/create'); options.onClick(e); }} 
                  className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer"
              >
                  <span className={item.icon + ' mr-3 text-blue-600'}></span>
                  <span className="font-medium text-sm">{item.label}</span>
              </button>
          );
      }
    },
    {
      label: 'Mis Documentos',
      icon: 'pi pi-file',
      template: (item, options) => {
          return (
              <button 
                  onClick={(e) => { navigate('/documents'); options.onClick(e); }} 
                  className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer"
              >
                  <span className={item.icon + ' mr-3 text-blue-600'}></span>
                  <span className="font-medium text-sm">{item.label}</span>
              </button>
          );
      }
    },
    {
      separator: true
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      template: (item, options) => {
          return (
              <button 
                  onClick={(e) => { handleSignOut(); options.onClick(e); }} 
                  className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
              >
                  <span className={item.icon + ' mr-3'}></span>
                  <span className="font-medium text-sm">{item.label}</span>
              </button>
          );
      }
    }
  ];

  const getInitials = (name: string) => {
    if (!name || name === 'Usuario') return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

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
            <Menu 
              model={userMenuItems} 
              popup 
              ref={menu} 
              id="popup_menu_user" 
              className="w-56 shadow-xl border-gray-100 rounded-xl mt-2"
            />
            
            <button
              onClick={(e) => menu.current?.toggle(e)}
              aria-controls="popup_menu_user"
              aria-haspopup
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group bg-transparent cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:scale-105 transition-transform duration-200">
                {getInitials(userName)}
              </div>
              
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-semibold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">
                  Estudiante
                </span>
              </div>
              
              <i className="pi pi-chevron-down text-[10px] text-gray-400 group-hover:text-blue-600 transition-colors ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation (Simple version) */}
      <nav className="md:hidden border-t border-gray-50 flex items-center justify-around py-2 bg-white/80 backdrop-blur-md">
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
