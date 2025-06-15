import api from '../axios';
import { getToken } from './authService';  // Thay đổi ở đây - import getToken thay vì getAuthHeaders

const BASE_URL = 'api/diadiem';

// Tạo hàm getAuthHeaders trong file này
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getAllLocations = async (params = {}) => {
    const { page = 1, limit = 100, search = '' } = params;

    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        if (search) {
            queryParams.append('searchTerm', search);
        }

        const response = await api.get(`${BASE_URL}?${queryParams.toString()}`, {
            headers: getAuthHeaders()
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch locations');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching locations:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Thêm các hàm khác như createLocation, updateLocation nếu cần