import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Settings,
  Users,
  FileText,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Repeat,
} from 'lucide-react';

const Layout = () => {
  const { user, operator, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      name: 'Inicio', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      roles: ['operador', 'jefe', 'administrador'] 
    },
    { 
      name: 'Mantenimiento', 
      icon: Wrench, 
      path: '/maintenance', 
      roles: ['operador', 'jefe', 'administrador'] 
    },
    { 
      name: 'Plantillas Recurrentes', 
      icon: Repeat, 
      path: '/recurring-templates', 
      roles: ['jefe', 'administrador'] 
    },
    { 
      name: 'Inventario', 
      icon: Package, 
      path: '/inventory', 
      roles: ['jefe', 'administrador'] 
    },
    { 
      name: 'Equipos', 
      icon: Settings, 
      path: '/equipment', 
      roles: ['operador', 'jefe', 'administrador'] 
    },
    { 
      name: 'Operadores', 
      icon: Users, 
      path: '/operators', 
      roles: ['jefe', 'administrador'] 
    },
    { 
      name: 'Requisiciones', 
      icon: ShoppingCart, 
      path: '/requisitions', 
      roles: ['operador', 'jefe', 'administrador'] 
    },
    { 
      name: 'Reportes', 
      icon: FileText, 
      path: '/reports', 
      roles: ['jefe', 'administrador'] 
    },
    { 
      name: 'Configuración', 
      icon: Settings, 
      path: '/settings', 
      roles: ['administrador'] 
    },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole || 'operador')
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-primary-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Settings className="w-8 h-8" />
              <span className="font-bold text-lg">DEVAD-MTO</span>
            </div>
          ) : (
            <Settings className="w-8 h-8 mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
          <ul className="space-y-1 px-3">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`
                  }
                  title={!sidebarOpen ? item.name : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle button */}
        <div className="p-4 border-t border-primary-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-primary-100 hover:bg-primary-800 hover:text-white transition-colors"
          >
            {sidebarOpen ? (
              <>
                <X className="w-5 h-5" />
                <span>Contraer</span>
              </>
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Bienvenido, {operator?.nombre || user?.email}
            </h1>
            <p className="text-sm text-gray-500">
              {userRole === 'administrador' && 'Administrador del Sistema'}
              {userRole === 'jefe' && 'Jefe de Mantenimiento'}
              {userRole === 'operador' && `Operador - ${operator?.puesto || 'Técnico'}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{operator?.nombre || 'Usuario'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
