import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  getAddresses: () => api.get('/auth/addresses'),
  getAllCustomers: (params) => api.get('/auth/customers', { params }),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  verifyMagicLink: (token) => api.get(`/auth/verify-magic-link/${token}`),
  setupPassword: (data) => api.post('/auth/setup-password', data)
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getCustomerOrders: (params) => api.get('/orders', { params }),
  getStats: () => api.get('/orders/stats'),
  getRecent: () => api.get('/orders/recent'),
  getStatuses: () => api.get('/orders/statuses'),
  getById: (id) => api.get(`/orders/${id}`),
  approve: (id, data) => api.post(`/orders/${id}/approve`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
};

// Support API
export const supportAPI = {
  createTicket: (data) => api.post('/support', data),
  getAll: (params) => api.get('/support', { params }),
  getCustomerTickets: (params) => api.get('/support', { params }),
  getRecent: () => api.get('/support/recent'),
  getById: (id) => api.get(`/support/${id}`),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data)
};

// Returns API
export const returnsAPI = {
  create: (data) => api.post('/returns', data),
  getAll: (params) => api.get('/returns', { params }),
  getCustomerReturns: (params) => api.get('/returns', { params }),
  getById: (id) => api.get(`/returns/${id}`),
  updateStatus: (id, data) => api.put(`/returns/${id}/status`, data)
};

export default api;

