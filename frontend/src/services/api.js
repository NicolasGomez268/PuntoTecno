import axios from 'axios';

/**
 * Instancia de Axios configurada para la API de PuntoTecno
 */
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Servicios de autenticación
 */
export const authService = {
  login: async (username, password) => {
    const response = await axios.post('http://localhost:8000/api/token/', {
      username,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

/**
 * Servicios de órdenes
 */
export const ordersService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders/orders/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/orders/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/orders/orders/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/orders/orders/${id}/`, data);
    return response.data;
  },

  updateStatus: async (id, status, notes = '') => {
    const response = await api.post(`/orders/orders/${id}/update_status/`, {
      status,
      notes,
    });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/orders/orders/dashboard/');
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/orders/my_orders/');
    return response.data;
  },
};

/**
 * Servicios de clientes
 */
export const customersService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders/customers/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/customers/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/orders/customers/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/orders/customers/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/orders/customers/${id}/`);
    return response.data;
  },

  getOrders: async (id) => {
    const response = await api.get(`/orders/customers/${id}/orders/`);
    return response.data;
  },
};

/**
 * Servicios de inventario
 */
export const inventoryService = {
  // Productos
  getProducts: async (params = {}) => {
    const response = await api.get('/inventory/products/', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/inventory/products/${id}/`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/inventory/products/', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.patch(`/inventory/products/${id}/`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/inventory/products/${id}/`);
    return response.data;
  },

  updateStock: async (id, movementType, quantity, reason) => {
    const response = await api.post(`/inventory/products/${id}/update_stock/`, {
      movement_type: movementType,
      quantity,
      reason,
    });
    return response.data;
  },

  getLowStockAlerts: async () => {
    const response = await api.get('/inventory/products/low_stock_alerts/');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/inventory/products/statistics/');
    return response.data;
  },

  // Categorías
  getCategories: async () => {
    const response = await api.get('/inventory/categories/');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/inventory/categories/', data);
    return response.data;
  },

  // Movimientos
  getMovements: async (params = {}) => {
    const response = await api.get('/inventory/movements/', { params });
    return response.data;
  },

  getStockMovements: async (params = {}) => {
    const response = await api.get('/inventory/movements/', { params });
    return response.data;
  },
};

/**
 * Servicios de ventas
 */
export const salesService = {
  // Ventas
  getSales: async (params = {}) => {
    const response = await api.get('/sales/sales/', { params });
    return response.data;
  },

  getSaleById: async (id) => {
    const response = await api.get(`/sales/sales/${id}/`);
    return response.data;
  },

  createSale: async (data) => {
    const response = await api.post('/sales/sales/', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/sales/sales/dashboard/');
    return response.data;
  },

  getDailyReport: async (date) => {
    const response = await api.get('/sales/sales/daily_report/', {
      params: { date }
    });
    return response.data;
  },
};

/**
 * Servicios de usuarios (solo admin)
 */
export const usersService = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/users/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  },
};

/**
 * Servicios de presupuestos
 */
export const servicesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/services/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/services/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/services/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}/`);
    return response.data;
  },
};
