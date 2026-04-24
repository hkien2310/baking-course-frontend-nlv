import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
});

// Interceptor to attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- PROGRAMS ----------------
export const getPrograms = async (params = {}) => {
  const { data } = await api.get('/programs', { params });
  return data;
};

export const getUpcomingPrograms = async (limit = 3) => {
  const { data } = await api.get('/programs/upcoming', { params: { limit } });
  return data;
};

export const getProgramBySlug = async (slug) => {
  const { data } = await api.get(`/programs/${slug}`);
  return data;
};

export const createProgram = async (payload) => {
  const { data } = await api.post('/programs', payload);
  return data;
};

export const updateProgram = async (id, payload) => {
  const { data } = await api.put(`/programs/${id}`, payload);
  return data;
};

export const deleteProgram = async (id) => {
  const { data } = await api.delete(`/programs/${id}`);
  return data;
};

// ---------------- CATEGORIES (Program) ----------------
export const getCategories = async (params = {}) => {
  const { data } = await api.get('/categories', { params });
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

export const reorderCategories = async (items) => {
  const { data } = await api.put('/categories/reorder', { items });
  return data;
};


// ---------------- TIMETABLES ----------------
export const getTimetables = async () => {
  const { data } = await api.get('/programs/timetable/all');
  return data;
};

export const toggleProgramFeature = async (id, isFeatured) => {
  const { data } = await api.patch(`/programs/${id}/feature`, { isFeatured });
  return data;
};

// ---------------- CHIEFS & TESTIMONIALS ----------------
export const getChiefs = async (params = {}) => {
  const { data } = await api.get('/chiefs', { params });
  return data;
};

export const getChiefById = async (id) => {
  const { data } = await api.get(`/chiefs/${id}`);
  return data;
};

export const createChief = async (payload) => {
  const { data } = await api.post('/chiefs', payload);
  return data;
};

export const updateChief = async (id, payload) => {
  const { data } = await api.put(`/chiefs/${id}`, payload);
  return data;
};

export const deleteChief = async (id) => {
  const { data } = await api.delete(`/chiefs/${id}`);
  return data;
};

export const getTestimonials = async () => {
  const { data } = await api.get('/testimonials');
  return data;
};

export const createTestimonial = async (payload) => {
  const { data } = await api.post('/testimonials', payload);
  return data;
};

export const updateTestimonial = async (id, payload) => {
  const { data } = await api.put(`/testimonials/${id}`, payload);
  return data;
};

export const deleteTestimonial = async (id) => {
  const { data } = await api.delete(`/testimonials/${id}`);
  return data;
};

// ---------------- CONTACTS ----------------
export const getContacts = async () => {
  const { data } = await api.get('/contacts');
  return data;
};

export const submitContact = async (payload) => {
  const { data } = await api.post('/contacts', payload);
  return data;
};

export const deleteContact = async (id) => {
  const { data } = await api.delete(`/contacts/${id}`);
  return data;
};

// ---------------- ENROLLMENTS ----------------
export const getEnrollments = async () => {
  const { data } = await api.get('/enrollments');
  return data;
};

export const submitEnrollment = async (payload) => {
  const { data } = await api.post('/enrollments', payload);
  return data;
};

export const updateEnrollmentStatus = async (id, status) => {
  const { data } = await api.patch(`/enrollments/${id}`, { status });
  return data;
};

export const deleteEnrollment = async (id) => {
  const { data } = await api.delete(`/enrollments/${id}`);
  return data;
};

// ---------------- POSTS ----------------
export const getPosts = async (params = {}) => {
  const { data } = await api.get('/posts', { params });
  return data;
};

export const getPostBySlug = async (slug) => {
  const { data } = await api.get(`/posts/${slug}`);
  return data;
};

export const createPost = async (payload) => {
  const { data } = await api.post('/posts', payload);
  return data;
};

export const updatePost = async (id, payload) => {
  const { data } = await api.put(`/posts/${id}`, payload);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

// ---------------- FILE UPLOAD ----------------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { url: '/uploads/image-123456.jpg' }
};

// ---------------- AUTH ----------------
export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No token found");
  
  const { data } = await api.get('/auth/me');
  return data;
};

// ---------------- ORDERS ----------------
export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const submitOrderProof = async (id, payload) => {
  const { data } = await api.patch(`/orders/${id}/proof`, payload);
  return data;
};

export const cancelOrder = async (id) => {
  const { data } = await api.patch(`/orders/${id}/cancel`);
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const confirmOrder = async (id, adminNote) => {
  const { data } = await api.patch(`/orders/${id}/confirm`, { adminNote });
  return data;
};

export const rejectOrder = async (id, adminNote) => {
  const { data } = await api.patch(`/orders/${id}/reject`, { adminNote });
  return data;
};

// ---------------- PAYMENT CONFIG ----------------
export const getPaymentConfig = async () => {
  const { data } = await api.get('/payment-config');
  return data;
};

export const getPaymentConfigAdmin = async () => {
  const { data } = await api.get('/payment-config/admin');
  return data;
};

export const updatePaymentConfig = async (payload) => {
  const { data } = await api.put('/payment-config', payload);
  return data;
};

// ---------------- VNPAY ----------------
export const createVnpayPaymentUrl = async (orderId, bankCode) => {
  const { data } = await api.post('/vnpay/create-payment-url', { orderId, bankCode });
  return data; // { paymentUrl }
};

// ---------------- DASHBOARD STATS ----------------
export const getDashboardStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

export default api;
