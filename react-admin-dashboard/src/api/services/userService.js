import api from '../axios';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await api.get(`/api/users/${username}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (username, userData) => {
  try {
    const response = await api.put(`/api/users/${username}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (username) => {
  try {
    const response = await api.delete(`/api/users/${username}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};