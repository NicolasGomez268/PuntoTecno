import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import Customers from './pages/Customers';
import EditCustomer from './pages/EditCustomer';
import EditOrder from './pages/EditOrder';
import EditProduct from './pages/EditProduct';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import NewCustomer from './pages/NewCustomer';
import NewOrder from './pages/NewOrder';
import NewProduct from './pages/NewProduct';
import NewSale from './pages/NewSale';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import SaleDetail from './pages/SaleDetail';
import Sales from './pages/Sales';
import AdminDashboard from './pages/admin/AdminDashboard';
import Reports from './pages/admin/Reports';
import Users from './pages/admin/Users';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

/**
 * Componente principal de la aplicación PuntoTecno
 * Gestiona el sistema de rutas y autenticación
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              }
            />
            
            {/* Dashboard según rol */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRouter />
                </PrivateRoute>
              }
            />
            
            {/* Órdenes de reparación */}
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/orders/new"
              element={
                <PrivateRoute>
                  <NewOrder />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/orders/:id/edit"
              element={
                <PrivateRoute>
                  <EditOrder />
                </PrivateRoute>
              }
            />
            
            {/* Inventario */}
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/inventory/new"
              element={
                <PrivateRoute>
                  <NewProduct />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/inventory/:id"
              element={
                <PrivateRoute>
                  <ProductDetail />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/inventory/:id/edit"
              element={
                <PrivateRoute>
                  <EditProduct />
                </PrivateRoute>
              }
            />
            
            {/* Ventas */}
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <Sales />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/sales/new"
              element={
                <PrivateRoute>
                  <NewSale />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/sales/:id"
              element={
                <PrivateRoute>
                  <SaleDetail />
                </PrivateRoute>
              }
            />
            
            {/* Clientes */}
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <Customers />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/customers/new"
              element={
                <PrivateRoute>
                  <NewCustomer />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/customers/:id/edit"
              element={
                <PrivateRoute>
                  <EditCustomer />
                </PrivateRoute>
              }
            />
            
            {/* Rutas solo para administradores */}
            <Route
              path="/users"
              element={
                <PrivateRoute adminOnly>
                  <Users />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <PrivateRoute adminOnly>
                  <Reports />
                </PrivateRoute>
              }
            />
            
            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

/**
 * Redirige al dashboard correcto según el rol del usuario
 */
function DashboardRouter() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <EmployeeDashboard />;
}

export default App;
