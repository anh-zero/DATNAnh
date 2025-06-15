import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token vào headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Log để debug, thêm URL để biết request nào
    console.log(`[axios] Interceptor: Using token for request to ${config.url}:`, token ? `${token.substring(0, 20)}...` : 'No token');

    if (token) {
      // Thêm prefix "Bearer " nếu chưa có
      config.headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[axios] Request error in interceptor:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi 401
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log(`[axios] Response interceptor: Received status ${error.response.status} for ${error.config.url}`);
      if (error.response.status === 401) {
        console.error('[axios] Authentication error (401) - Token might be invalid or expired. Redirecting to login.');
        // Xóa token và thông tin user khi hết hạn
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        console.log('[axios] Cleared auth data from localStorage due to 401.');

        // Chuyển hướng về trang login
        // Using window.location.replace to ensure a full reload and state clearing for login page
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    } else if (error.request) {
      console.error('[axios] Network error or no response received:', error.request);
    } else {
      console.error('[axios] Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;