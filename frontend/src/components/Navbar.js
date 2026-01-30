import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de navegación principal
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Solo mostrar si estamos en la parte superior
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "px-4 py-2 rounded-md font-medium text-sm transition-all duration-300";
    return isActive(path)
      ? `${baseClass} bg-primary text-white shadow-sm`
      : `${baseClass} text-gray-600`;
  };

  const handleNavHover = (e, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.transform = 'scale(1.15)';
      e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6), 0 0 20px rgba(37, 99, 235, 0.4), 0 8px 25px rgba(59, 130, 246, 0.3)';
      e.currentTarget.style.color = '#1e40af';
      e.currentTarget.style.backgroundColor = '#dbeafe';
    } else {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.color = '';
      e.currentTarget.style.backgroundColor = '';
    }
  };

  return (
    <nav 
      className="bg-white border-b border-gray-200 sticky top-0 z-50 transition-transform duration-300 shadow-sm"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <img src="/logoblaco.png" alt="PuntoTecno" className="h-10 w-auto object-contain" />
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">PuntoTecno</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/dashboard" 
              className={navLinkClass('/dashboard')}
              onMouseEnter={(e) => !isActive('/dashboard') && handleNavHover(e, true)}
              onMouseLeave={(e) => !isActive('/dashboard') && handleNavHover(e, false)}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/orders" 
              className={navLinkClass('/orders')}
              onMouseEnter={(e) => !isActive('/orders') && handleNavHover(e, true)}
              onMouseLeave={(e) => !isActive('/orders') && handleNavHover(e, false)}
            >
              Órdenes
            </Link>
            
            <Link 
              to="/inventory" 
              className={navLinkClass('/inventory')}
              onMouseEnter={(e) => !isActive('/inventory') && handleNavHover(e, true)}
              onMouseLeave={(e) => !isActive('/inventory') && handleNavHover(e, false)}
            >
              Inventario
            </Link>
            
            <Link 
              to="/sales" 
              className={navLinkClass('/sales')}
              onMouseEnter={(e) => !isActive('/sales') && handleNavHover(e, true)}
              onMouseLeave={(e) => !isActive('/sales') && handleNavHover(e, false)}
            >
              Ventas
            </Link>
            
            <Link 
              to="/customers" 
              className={navLinkClass('/customers')}
              onMouseEnter={(e) => !isActive('/customers') && handleNavHover(e, true)}
              onMouseLeave={(e) => !isActive('/customers') && handleNavHover(e, false)}
            >
              Clientes
            </Link>
          </div>

          {/* Desktop User Menu & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md font-medium text-sm border border-red-600 transition-all duration-300 shadow-md"
              style={{
                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(239, 68, 68, 0.4), 0 10px 10px -5px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.2)';
              }}
            >
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* User Info in Mobile */}
            <div className="pb-3 mb-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
              </p>
            </div>

            {/* Navigation Links */}
            <Link 
              to="/dashboard" 
              className={`${navLinkClass('/dashboard')} block w-full text-left`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </div>
            </Link>
            
            <Link 
              to="/orders" 
              className={`${navLinkClass('/orders')} block w-full text-left`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Órdenes
              </div>
            </Link>
            
            <Link 
              to="/inventory" 
              className={`${navLinkClass('/inventory')} block w-full text-left`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Inventario
              </div>
            </Link>
            
            <Link 
              to="/sales" 
              className={`${navLinkClass('/sales')} block w-full text-left`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ventas
              </div>
            </Link>
            
            <Link 
              to="/customers" 
              className={`${navLinkClass('/customers')} block w-full text-left`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Clientes
              </div>
            </Link>

            {/* Logout Button in Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full mt-4 px-4 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
