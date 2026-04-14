import axios from 'axios';

const API_BASE = 'http://localhost/webshop/backend/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
};

export const categories = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const products = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (productId, formData) => api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  setPrimaryImage: (productId, imageId) => api.put(`/products/${productId}/images/primary/${imageId}`),
  reorderImages: (productId, order) => api.put(`/products/${productId}/images/reorder`, { order }),
};

export const cart = {
  get: () => api.get('/cart'),
  add: (product_id, quantity) => api.post('/cart', { product_id, quantity }),
  update: (product_id, quantity) => api.put('/cart', { product_id, quantity }),
  remove: (product_id) => api.delete(`/cart/${product_id}`),
};

export const orders = {
  place: (shipping, payment_method) => api.post('/orders', { shipping, payment_method }),
  getMyOrders: () => api.get('/orders'),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  adminGetAll: () => api.get('/admin/orders'),
  adminUpdateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  adminGetOrderDetails: (id) => api.get(`/admin/orders/${id}/details`),
};

export default api;