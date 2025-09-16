import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:4002',
  timeout: 10000,
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to log responses and handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required - redirecting to login');
      // Don't redirect here - let components handle it
    }
    
    return Promise.reject(error);
  }
);

// Specific API functions for seller operations
export const sellerAPI = {
  // Get seller's products
  getMyProducts: () => api.get('/products/my-products'),
  
  // Create product with image
  createProductWithImage: (formData: FormData) => {
    return api.post('/products/create-with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update product
  updateProduct: (id: number, data: any) => {
    if (data instanceof FormData) {
      return api.put(`/products/my-product/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put(`/products/my-product/${id}`, data);
    }
  },
  
  // Delete product
  deleteProduct: (id: number) => api.delete(`/products/my-product/${id}`),
  
  // Get product by ID
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  // Get product with images
  getProductWithImages: (id: number) => api.get(`/products/${id}/with-images`),
};

// General API functions
export const generalAPI = {
  // Get all products
  getAllProducts: () => api.get('/products'),
  
  // Get paginated products with images
  getPaginatedProducts: (page: number = 1, limit: number = 12) => 
    api.get(`/products/paginated?page=${page}&limit=${limit}`),
  
  // Search products
  searchProducts: (query: string) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  
  // Get product image
  getProductImage: (id: number) => api.get(`/products/product-image/${id}`),
  
  // Serve image file
  getImageFile: (filename: string) => `http://localhost:4002/products/serve-image/${filename}`,
  
  // Static image URL
  getStaticImage: (filename: string) => `http://localhost:4002/products/static/${filename}`,
};

// Cart API functions
export const cartAPI = {
  // Add product to cart
  addToCart: (productId: number, quantity: number = 1) => 
    api.post('/cart/add', { productId, quantity }),
  
  // Get cart items
  getCartItems: () => api.get('/cart/items'),
  
  // Update cart item quantity
  updateCartItem: (cartId: number, quantity: number) => 
    api.put(`/cart/items/${cartId}`, { quantity }),
  
  // Remove item from cart
  removeFromCart: (cartId: number) => api.delete(`/cart/items/${cartId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/cart/clear'),
  
  // Get cart total
  getCartTotal: () => api.get('/cart/total'),
};

// Order API functions
export const orderAPI = {
  // Create order from cart
  createOrderFromCart: () => api.post('/orders/from-cart'),
  
  // Get user's orders
  getUserOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/orders?page=${page}&limit=${limit}`),
  
  // Get order by ID
  getOrder: (orderId: number) => api.get(`/orders/${orderId}`),
  
  // Cancel order
  cancelOrder: (orderId: number) => api.post(`/orders/${orderId}/cancel`),
};

// Seller order API functions
export const sellerOrderAPI = {
  // Get seller's orders
  getSellerOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/orders/seller/orders?page=${page}&limit=${limit}`),
  
  // Update order status
  updateOrderStatus: (orderId: number, status: string) => 
    api.patch(`/orders/${orderId}/status`, { status }),
  
  // Get seller financials
  getSellerFinancials: () => api.get('/orders/seller/financials'),
};

// Seller Dashboard API functions
export const sellerDashboardAPI = {
  // Get dashboard overview with stats
  getDashboardOverview: () => api.get('/sellers/dashboard/overview'),
  
  // Get dashboard orders
  getDashboardOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/sellers/dashboard/orders?page=${page}&limit=${limit}`),
  
  // Get recent orders
  getRecentOrders: (limit: number = 5) => 
    api.get(`/sellers/dashboard/recent-orders?limit=${limit}`),
  
  // Get financial records
  getFinancialRecords: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/sellers/dashboard/financial-records?${params.toString()}`);
  },
  
  // Get dashboard report
  getDashboardReport: () => api.get('/sellers/dashboard/report'),
};

// Mail API functions for seller communication
export const mailAPI = {
  // Send seller-to-buyer message
  sendSellerToBuyer: (messageData: {
    fromName: string;
    fromEmail: string;
    toName: string;
    toEmail: string;
    subject: string;
    message: string;
    productName?: string;
    orderId?: string;
  }) => api.post('/mailer/seller-to-buyer', messageData),

  // Test email functionality
  sendTestEmail: (email: string) => api.post('/mailer/test', { email }),

  // Send order confirmation email
  sendOrderConfirmation: (orderData: any) => api.post('/mailer/order-confirmation', orderData),

  // Send order status update
  sendOrderStatusUpdate: (updateData: {
    email: string;
    customerName: string;
    orderId: string;
    status: string;
    trackingNumber?: string;
  }) => api.post('/mailer/order-status-update', updateData),
};

export default api;