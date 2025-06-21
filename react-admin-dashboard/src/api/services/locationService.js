import api from '../axios';
import { getToken } from './authService';

const BASE_URL = '/api/diadiem';

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

export const getAllLocations = async (params = {}) => {
    try {
        console.log('Calling API:', BASE_URL, 'with params:', params);
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params, // { page, limit, searchTerm, sortBy, order }
        });

        console.log('API response:', response.data);

        if (response.data && response.data.success) {
            return {
                locations: response.data.data || [],
                pagination: response.data.pagination || {}
            };
        }
        throw new Error(response.data?.message || 'Không thể lấy danh sách địa điểm.');
    } catch (error) {
        console.error('Error fetching locations:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getLocationById = async (locationId) => {
    try {
        const response = await api.get(`${BASE_URL}/${locationId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy thông tin địa điểm ID ${locationId}.`);
    } catch (error) {
        console.error(`Error fetching location ${locationId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createLocation = async (locationData) => {
    try {
        const response = await api.post(BASE_URL, locationData, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo địa điểm mới.');
    } catch (error) {
        console.error('Error creating location:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateLocation = async (locationId, locationData) => {
    try {
        const response = await api.put(`${BASE_URL}/${locationId}`, locationData, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật địa điểm ID ${locationId}.`);
    } catch (error) {
        console.error(`Error updating location ${locationId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteLocation = async (locationId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${locationId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa địa điểm ID ${locationId}.`);
    } catch (error) {
        console.error(`Error deleting location ${locationId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getLocationActivities = async (locationId, params = {}) => {
    try {
        const response = await api.get(`${BASE_URL}/${locationId}/hoatdongtour`, {
            headers: getAuthHeaders(),
            params: params
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy hoạt động của địa điểm ID ${locationId}.`);
    } catch (error) {
        console.error(`Error fetching location activities ${locationId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getLocationPartners = async (locationId, params = {}) => {
    try {
        const response = await api.get(`${BASE_URL}/${locationId}/doitac`, {
            headers: getAuthHeaders(),
            params: params
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy đối tác của địa điểm ID ${locationId}.`);
    } catch (error) {
        console.error(`Error fetching location partners ${locationId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};