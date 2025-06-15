import api from '../axios';
import { getToken } from './authService';

const BASE_URL = 'api/tours';

const getAuthHeaders = (isFormData = false) => {
    const token = getToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    // For FormData, 'Content-Type' is set automatically by the browser
    return headers;
};

export const getAllTours = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params, // { page, limit, searchTerm, sortBy, order }
        });
        if (response.data && response.data.success) {
            return {
                data: response.data.data || response.data.tours, // Adjust based on backend response
                pagination: response.data.pagination,
            };
        }
        throw new Error(response.data?.message || 'Không thể lấy danh sách tour.');
    } catch (error) {
        console.error('Error fetching all tours:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourById = async (tourId) => {
    try {
        const response = await api.get(`${BASE_URL}/${tourId}`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || `Không thể lấy thông tin tour ID ${tourId}.`);
    } catch (error) {
        console.error(`Error fetching tour by ID ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// tourData should be FormData if it includes an image file
export const createTour = async (tourData) => {
    try {
        const response = await api.post(BASE_URL, tourData, {
            headers: getAuthHeaders(true), // True for FormData
        });
        return response.data; // Expects { success, message, data: newTourObject }
    } catch (error) {
        console.error('Error creating tour:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// tourData should be FormData if it includes an image file
export const updateTour = async (tourId, tourData) => {
    try {
        const response = await api.put(`${BASE_URL}/${tourId}`, tourData, {
            headers: getAuthHeaders(true), // True for FormData
        });
        return response.data; // Expects { success, message, data: updatedTourObject }
    } catch (error) {
        console.error(`Error updating tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteTour = async (tourId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${tourId}`, {
            headers: getAuthHeaders(),
        });
        return response.data; // Expects { success, message }
    } catch (error) {
        console.error(`Error deleting tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Optional: if you have statistics for tours
export const getTourStatistics = async () => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        // Handle cases where stats might not exist or fail
        console.warn('Could not fetch tour statistics:', response.data?.message);
        return { total_san_pham_tours: 0 }; // Default or error state
    } catch (error) {
        console.error('Error fetching tour statistics:', error.response?.data || error.message);
        // throw error.response?.data || error; // Or return a default
        return { total_san_pham_tours: 0 };
    }
};