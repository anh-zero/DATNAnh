import api from '../axios'; // Changed from '../apiUtil' to '../axios'
import { getToken } from './authService'; // Assuming you have a way to get the auth token

const BASE_URL = 'api/customers'; // Base URL for customer endpoints

// Helper to get authenticated headers
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const getAuthHeadersWithFormData = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        // Content-Type is set automatically by browser for FormData
    };
};


export const getAllCustomers = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params,
        });
        // Backend trả về: { success: true, data: [...customersArray], pagination: {...} }
        if (response.data && response.data.success) {
            return {
                customers: response.data.data, // Lấy mảng khách hàng từ response.data.data
                pagination: response.data.pagination, // Lấy object pagination từ response.data.pagination
            };
        }
        // Nếu cấu trúc không như mong đợi hoặc success là false, trả về một cấu trúc rỗng để tránh lỗi
        return { customers: [], pagination: {} };
    } catch (error) {
        console.error('Error fetching all customers:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getCustomerById = async (customerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${customerId}`, {
            headers: getAuthHeaders(),
        });
        // Assuming backend returns { success: true, data: customerObject }
        return response.data; // Expects { success: true, data: { ...customer_details } }
    } catch (error) {
        console.error(`Error fetching customer by ID ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        // customerData should be a plain object, not FormData unless handling file uploads
        const response = await api.post(BASE_URL, customerData, {
            headers: getAuthHeaders(), // Use JSON content type
        });
        // Assuming backend returns { success: true, message: "...", data: newCustomer }
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        // customerData should be a plain object
        const response = await api.put(`${BASE_URL}/${customerId}`, customerData, {
            headers: getAuthHeaders(), // Use JSON content type
        });
        // Assuming backend returns { success: true, message: "..." }
        return response.data;
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
        // Assuming backend returns { success: true, message: "..." }
        return response.data;
    } catch (error) {
        console.error(`Error deleting customer ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};