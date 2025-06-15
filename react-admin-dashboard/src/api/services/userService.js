import api from '../axios';
import { getToken } from './authService';

const BASE_URL = 'api/nguoidung';

// Helper để lấy auth headers
const getAuthHeaders = (isFormData = false) => {
  const token = getToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, {
      headers: getAuthHeaders(),
      params: params, // { page, limit, search, sortBy, order }
    });

    if (response.data && response.data.success) {
      return {
        users: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    }
    throw new Error(response.data?.message || 'Không thể lấy danh sách người dùng.');
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`${BASE_URL}/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post(BASE_URL, userData, {
      headers: getAuthHeaders(true), // true để xử lý FormData
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`${BASE_URL}/${userId}`, userData, {
      headers: getAuthHeaders(true), // true để xử lý FormData
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Phương thức cập nhật trạng thái người dùng
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/${userId}/status`, { dang_hoat_dong: status }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating user status ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Phương thức đặt lại mật khẩu
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await api.post(`${BASE_URL}/${userId}/reset-password`, { new_password: newPassword }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error resetting password for user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};