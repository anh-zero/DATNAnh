// Kiểm tra file src/api/services/authService.js
import api from '../axios';

export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/api/admin/login', credentials);
    console.log('Login response:', response.data);

    // Quan trọng: token nằm trong response.data.data.token theo response từ Postman
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('adminId', response.data.data.admin_id); // Ví dụ
      localStorage.setItem('username', response.data.data.username); // Ví dụ
      return true;
    }
    return false;
  } catch (error) {
    console.error('Đăng nhập thất bại:', error);
    throw error;
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole'); // Xóa userRole nếu có
  localStorage.removeItem('adminId');   // Xóa adminId nếu có
  localStorage.removeItem('username'); // Xóa username nếu có
};

export const checkAdminAuth = () => {
  const token = localStorage.getItem('token');
  return token !== null;
};