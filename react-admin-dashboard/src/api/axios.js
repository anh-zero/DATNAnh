import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token vào headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Log để debug
    console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (token) {
      // Thêm prefix "Bearer " nếu chưa có
      config.headers['Authorization'] = token.startsWith('Bearer ') 
        ? token 
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi 401
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - Token might be invalid or expired');
      // Có thể logout người dùng nếu token hết hạn
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;