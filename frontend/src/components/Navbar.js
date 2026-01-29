import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de navegación principal
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm";
    return isActive(path)
      ? `${baseClass} bg-primary text-white shadow-sm`
      : `${baseClass} text-gray-600 hover:text-gray-900 hover:bg-gray-50`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <img src="/logoblaco.png" alt="PuntoTecno" className="h-12 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">PuntoTecno</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>
            
            <Link to="/orders" className={navLinkClass('/orders')}>
              Órdenes
            </Link>
            
            <Link to="/inventory" className={navLinkClass('/inventory')}>
              Inventario
            </Link>
            
            <Link to="/sales" className={navLinkClass('/sales')}>
              Ventas
            </Link>
            
            <Link to="/customers" className={navLinkClass('/customers')}>
              Clientes
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 font-medium text-sm border border-gray-200 hover:border-red-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 px-4 py-3">
        <div className="flex flex-col space-y-2">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>
            Dashboard
          </Link>
          
          <Link to="/orders" className={navLinkClass('/orders')}>
            Órdenes
          </Link>
          
          <Link to="/inventory" className={navLinkClass('/inventory')}>
            Inventario
          </Link>
          
          <Link to="/sales" className={navLinkClass('/sales')}>
            Ventas
          </Link>
          
          <Link to="/customers" className={navLinkClass('/customers')}>
            Clientes
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
