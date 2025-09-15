import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002',
  withCredentials: true, // This ensures httpOnly cookies are sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add any additional headers if needed
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Clear any client-side auth state and redirect to login
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// Admin API functions
export const adminAPI = {
  // Users
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`),
  
  getUserById: (id: number) => 
    api.get(`/users/${id}`),
  
  updateUser: (id: number, data: any) => 
    api.put(`/users/${id}`, data),
  
  deleteUser: (id: number) => 
    api.delete(`/users/${id}`),
  
  toggleUserStatus: (id: number) => 
    api.put(`/users/${id}/toggle-status`),

  // Sellers
  getSellers: (page = 1, limit = 10, search = '', status = '') => 
    api.get(`/admin/sellers/verified?page=${page}&limit=${limit}&search=${search}&status=${status}`),
  
  getPendingSellers: (page = 1, limit = 10) => 
    api.get(`/admin/sellers/pending?page=${page}&limit=${limit}`),
  
  approveSeller: (id: number) => 
    api.post(`/admin/sellers/${id}/verify`),
  
  rejectSeller: (id: number, reason?: string) => 
    api.post(`/admin/sellers/${id}/reject`, { reason }),
  
  verifySeller: (id: number) => 
    api.post(`/admin/sellers/${id}/verify`),
  
  toggleSellerStatus: (id: number) => 
    api.put(`/admin/sellers/${id}/toggle-status`),
    
  deleteSeller: (id: number) => 
    api.delete(`/admin/sellers/${id}`),

  // Products
  getProducts: (page = 1, limit = 10, search = '') => 
    api.get(`/products?page=${page}&limit=${limit}&search=${search}`),
  
  getProductById: (id: number) => 
    api.get(`/products/${id}`),
  
  createProduct: (data: FormData) => 
    api.post('/products/create-with-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  updateProduct: (id: number, data: any) => 
    api.put(`/products/${id}`, data),
    
  deleteProduct: (id: number) => 
    api.delete(`/admin/products/${id}`),
    
  toggleProductStatus: (id: number) => 
    api.patch(`/admin/products/${id}/toggle-status`),

  // Orders (assuming you have order endpoints)
  getOrders: (page = 1, limit = 10, status = '') => 
    api.get(`/orders?page=${page}&limit=${limit}&status=${status}`),
  
  updateOrderStatus: (id: number, status: string) => 
    api.put(`/orders/${id}/status`, { status }),

  // Email System
  sendEmail: (data: { subject: string; message: string; recipients: string[] }) => 
    api.post('/mailer/send', data),
  
  sendWelcomeEmail: (email: string) => 
    api.post('/mailer/welcome', { email }),

  // Notifications
  getNotifications: (page = 1, limit = 10) => 
    api.get(`/admin/notifications?page=${page}&limit=${limit}`),
    
  markNotificationAsRead: (id: number) => 
    api.patch(`/admin/notifications/${id}/read`),
    
  markAllNotificationsAsRead: () => 
    api.patch('/admin/notifications/mark-all-read'),
    
  deleteNotification: (id: number) => 
    api.delete(`/admin/notifications/${id}`),
    
  createNotification: (data: any) => 
    api.post('/admin/notifications', data),

  // Dashboard Stats
  getDashboardStats: () => 
    api.get('/admin/dashboard/stats'),
};

export default api;
