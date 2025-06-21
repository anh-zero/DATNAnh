import api from '../axios';

const BASE_URL = '/api/doitac';

// Helper để lấy auth headers
const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export const getAllPartners = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params // { page, limit, searchTerm, sortBy, order }
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tải danh sách đối tác.');
    } catch (error) {
        console.error('Error fetching partners:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getPartnerById = async (partnerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${partnerId}`, {
            headers: getAuthHeaders()
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể tải thông tin đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error fetching partner ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createPartner = async (partnerData) => {
    try {
        const response = await api.post(BASE_URL, partnerData, {
            headers: getAuthHeaders(partnerData instanceof FormData),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo đối tác mới.');
    } catch (error) {
        console.error('Error creating partner:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updatePartner = async (partnerId, partnerData) => {
    try {
        const response = await api.put(`${BASE_URL}/${partnerId}`, partnerData, {
            headers: getAuthHeaders(partnerData instanceof FormData),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error updating partner ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deletePartner = async (partnerId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${partnerId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error deleting partner ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Thêm các hàm mới cho tab Địa điểm hợp tác và Tours liên quan

export const getPartnerLocations = async (partnerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${partnerId}/diadiem`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy danh sách địa điểm của đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error fetching partner locations ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getPartnerTours = async (partnerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${partnerId}/tours`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy danh sách tour của đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error fetching partner tours ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getPartnerServices = async (partnerId) => {
    try {
        const response = await api.get(`${BASE_URL}/${partnerId}/dichvutour`, {
            headers: getAuthHeaders()
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể lấy danh sách dịch vụ của đối tác ID ${partnerId}.`);
    } catch (error) {
        console.error(`Error fetching partner services ${partnerId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
}

// Thêm hàm mới để lấy thống kê dịch vụ
export const getServiceTypeStatistics = async () => {
    try {
        const response = await api.get('/api/provided-services/statistics', {
            headers: getAuthHeaders()
        });

        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || 'Không thể lấy thống kê dịch vụ.');
    } catch (error) {
        console.error('Error fetching service type statistics:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};