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

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

// Interceptor to handle 401 Unauthorized errors (expired token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response && response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Use basic axios or a separate instance to avoid interceptor loop
            const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/refresh`, {
              refreshToken
            });
            
            const newAccessToken = data.token;
            localStorage.setItem('token', newAccessToken);
            isRefreshing = false;
            onRefreshed(newAccessToken);
            
            // Retry original request
            originalRequest._retry = true;
            originalRequest.headers['x-auth-token'] = newAccessToken;
            return api(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');
            if (!window.location.pathname.startsWith('/auth')) {
              window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            }
            return Promise.reject(refreshError);
          }
        }

        // If already refreshing, wait for it
        const retryOriginalRequest = new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest._retry = true;
            originalRequest.headers['x-auth-token'] = token;
            resolve(api(originalRequest));
          });
        });
        return retryOriginalRequest;
      }

      // No refresh token, just logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
    }
    return Promise.reject(error);
  }
);

// ---------------- PROGRAMS ----------------
export const getPrograms = async (params = {}) => {
  const { data } = await api.get('/programs', { params });
  return data;
};

export const reorderPrograms = async (programs) => {
  const { data } = await api.put('/programs/reorder', { programs });
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

export const toggleProgramActive = async (id) => {
  const { data } = await api.patch(`/programs/${id}/toggle-active`);
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

export const changeStudentWorkStatus = async (id, status) => {
  const { data } = await api.patch(`/student-work/${id}/status`, { status });
  return data;
};

// ---------------------- BANNERS ----------------------
export const getBanners = async (params = {}) => {
  const { data } = await api.get('/banners', { params });
  return data;
};
export const createBanner = async (bannerData) => {
  const { data } = await api.post('/banners', bannerData);
  return data;
};
export const updateBanner = async (id, bannerData) => {
  const { data } = await api.put(`/banners/${id}`, bannerData);
  return data;
};
export const reorderBanners = async (banners) => {
  const { data } = await api.put('/banners/reorder', { banners });
  return data;
};
export const deleteBanner = async (id) => {
  const { data } = await api.delete(`/banners/${id}`);
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

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  }
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No token found");
  
  const { data } = await api.get('/auth/me');
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/change-password', payload);
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

// ---------------- SITE CONFIG ----------------
export const getSiteConfig = async () => {
  const { data } = await api.get('/settings/siteConfig');
  return data;
};

export const updateSiteConfig = async (payload) => {
  const { data } = await api.put('/settings/siteConfig', payload);
  return data;
};

// ---------------- STUDENT WORK ----------------
export const submitStudentWork = async (payload) => {
  const { data } = await api.post('/student-work', payload);
  return data;
};

export const getApprovedStudentWorks = async (page = 1, limit = 9, programId = null) => {
  const url = programId 
    ? `/student-work/approved?page=${page}&limit=${limit}&programId=${programId}`
    : `/student-work/approved?page=${page}&limit=${limit}`;
  const { data } = await api.get(url);
  return data;
};

export const getAllStudentWorks = async (page = 1, limit = 5, status = 'ALL') => {
  const { data } = await api.get(`/student-work/all?page=${page}&limit=${limit}&status=${status}`);
  return data;
};

export const approveStudentWork = async (id) => {
  const { data } = await api.patch(`/student-work/${id}/approve`);
  return data;
};

export const rejectStudentWork = async (id) => {
  const { data } = await api.patch(`/student-work/${id}/reject`);
  return data;
};

export const deleteStudentWork = async (id) => {
  const { data } = await api.delete(`/student-work/${id}`);
  return data;
};

export const createStudentWork = async (payload) => {
  const { data } = await api.post('/student-work/admin', payload);
  return data;
};

export const updateStudentWork = async (id, payload) => {
  const { data } = await api.put(`/student-work/${id}`, payload);
  return data;
};

// ── LOYALTY CONFIG ──
export const getLoyaltyConfig = async () => {
  const { data } = await api.get('/settings/loyalty');
  return data;
};

export const updateLoyaltyConfig = async (payload) => {
  const { data } = await api.put('/settings/loyalty', payload);
  return data;
};

// ── PROMO CODES ──
export const getPromoCodes = async () => {
  const { data } = await api.get('/promo-codes');
  return data;
};

export const createPromoCode = async (payload) => {
  const { data } = await api.post('/promo-codes', payload);
  return data;
};

export const updatePromoCode = async (id, payload) => {
  const { data } = await api.put(`/promo-codes/${id}`, payload);
  return data;
};

export const deletePromoCode = async (id) => {
  const { data } = await api.delete(`/promo-codes/${id}`);
  return data;
};

export const previewOrder = async (payload) => {
  const { data } = await api.post('/orders/preview', payload);
  return data;
};

export const validatePromoCode = async (code, orderAmount) => {
  const { data } = await api.post('/promo-codes/validate', { code, orderAmount });
  return data;
};

// ---------------- QNA ----------------
export const submitQuestion = async (payload) => {
  const { data } = await api.post('/qna', payload);
  return data;
};

export const getMyQuestions = async (programId) => {
  const { data } = await api.get(`/qna/my`, { params: { programId } });
  return data;
};

export const getAdminQuestions = async (params = {}) => {
  const { data } = await api.get('/qna/admin', { params });
  return data;
};

export const answerQuestion = async (id, answer) => {
  const { data } = await api.put(`/qna/admin/${id}`, { answer });
  return data;
};

export default api;
