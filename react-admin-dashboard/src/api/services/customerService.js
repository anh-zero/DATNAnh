import api from '../axios';
import { getToken } from './authService';

// Sửa đường dẫn từ "api/nguoidung" thành "/api/khachhang"
const BASE_URL = '/api/khachhang';

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

export const getAllCustomers = async (params = {}) => {
    try {
        console.log('Calling API:', BASE_URL, 'with params:', params); // Log cho debug
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params, // { page, limit, searchTerm, sortBy, order }
        });

        console.log('API response:', response.data); // Log cho debug

        if (response.data && response.data.success) {
            return {
                customers: response.data.data || [],
                pagination: response.data.pagination || {}
            };
        }
        throw new Error(response.data?.message || 'Không thể lấy danh sách khách hàng.');
    } catch (error) {
        console.error('Error fetching customers:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getCustomerById = async (customerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${customerId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy thông tin khách hàng ID ${customerId}.`);
    } catch (error) {
        console.error(`Error fetching customer ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const isFormData = customerData instanceof FormData;
        const response = await api.post(BASE_URL, customerData, {
            headers: getAuthHeaders(isFormData),
        });

        if (response.data) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo khách hàng mới.');
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        const isFormData = customerData instanceof FormData;
        const response = await api.put(`${BASE_URL}/${customerId}`, customerData, {
            headers: getAuthHeaders(isFormData),
        });

        if (response.data) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật khách hàng ID ${customerId}.`);
    } catch (error) {
        console.error(`Error updating customer ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteCustomer = async (customerId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${customerId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa khách hàng ID ${customerId}.`);
    } catch (error) {
        console.error(`Error deleting customer ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getCustomerBookings = async (customerId, page = 1, limit = 10) => {
    try {
        // Add console.log to see what URL is being requested
        console.log('Requesting URL:', `api/khachhang/${customerId}/dattour`);

        // Make the API call
        const response = await api.get(`api/khachhang/${customerId}/dattour`, {
            params: { page, limit }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching customer bookings:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
};