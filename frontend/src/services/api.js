import axios from 'axios';
import { useServerStatusStore } from '@/stores/serverStatus';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [0, 2000, 5000]; // Delays in ms: immediate, 2s, 5s

// Helper function to detect cold start errors
const isColdStartError = (error) => {
  if (!error) return false;
  
  // Network errors (server not responding)
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    return true;
  }
  
  // HTTP errors that indicate server is waking up
  if (error.response) {
    const status = error.response.status;
    return status === 502 || status === 503 || status === 504;
  }
  
  return false;
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add retry metadata
    if (!config._retry) {
      config._retry = {
        count: 0,
        maxRetries: MAX_RETRIES
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with smart retry logic
api.interceptors.response.use(
  (response) => {
    // Success! Mark server as connected
    const serverStatus = useServerStatusStore();
    if (serverStatus.isWakingUp) {
      serverStatus.setConnected();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const serverStatus = useServerStatusStore();
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Check if this is a cold start error and we haven't exceeded retries
    if (isColdStartError(error) && originalRequest._retry.count < originalRequest._retry.maxRetries) {
      originalRequest._retry.count++;
      
      const retryAttempt = originalRequest._retry.count;
      const delayMs = RETRY_DELAYS[retryAttempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      
      // Show user-friendly message
      if (retryAttempt === 1) {
        serverStatus.setWakingUp('Server is starting up...');
      } else {
        serverStatus.setRetrying(retryAttempt, MAX_RETRIES);
      }
      
      // Wait before retrying
      if (delayMs > 0) {
        await delay(delayMs);
      }
      
      // Extend timeout for retry attempts (server needs time to wake up)
      originalRequest.timeout = 45000; // 45 seconds for retries
      
      // Retry the request
      try {
        const response = await api.request(originalRequest);
        serverStatus.setConnected();
        return response;
      } catch (retryError) {
        // If this was the last retry, show error
        if (originalRequest._retry.count >= originalRequest._retry.maxRetries) {
          serverStatus.setError('Unable to connect to server. Please try again.');
          
          // Auto-hide error after 5 seconds
          setTimeout(() => {
            serverStatus.hideOverlay();
          }, 5000);
        }
        return Promise.reject(retryError);
      }
    }
    
    // For non-cold-start errors, just reject
    return Promise.reject(error);
  }
);

// Health check function to wake up server proactively
export const performHealthCheck = async () => {
  const serverStatus = useServerStatusStore();
  
  try {
    serverStatus.setWakingUp('Connecting to server...');
    
    // Simple health check - try to reach any public endpoint
    await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/health`, {
      timeout: 45000, // Give it time to wake up
      validateStatus: () => true // Accept any status
    });
    
    serverStatus.setConnected();
    return true;
  } catch (error) {
    // If health check fails, let the retry logic handle it on actual requests
    serverStatus.hideOverlay();
    return false;
  }
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  getAddresses: () => api.get('/auth/addresses'),
  getAllCustomers: (params) => api.get('/auth/customers', { 
    params,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  deleteCustomer: (userId) => api.delete(`/auth/customers/${userId}`),
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

// Video API
export const videoAPI = {
  getUploadUrl: (orderId) => api.get(`/video/orders/${orderId}/upload-url`),
  saveVideoToOrder: (orderId, data) => api.post(`/video/orders/${orderId}/video`, data),
  uploadVideoFile: (orderId, formData) => api.post(`/video/orders/${orderId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getOrderVideo: (orderId) => api.get(`/video/orders/${orderId}/video`)
};

// Settings API
export const settingsAPI = {
  getOrderStatuses: () => api.get('/settings/statuses'),
  createOrderStatus: (data) => api.post('/settings/statuses', data),
  updateOrderStatus: (id, data) => api.put(`/settings/statuses/${id}`, data),
  deleteOrderStatus: (id) => api.delete(`/settings/statuses/${id}`),
  getSiteSetting: (key) => api.get(`/settings/site/${key}`),
  updateSiteSetting: (key, data) => api.put(`/settings/site/${key}`, data)
};

export default api;
