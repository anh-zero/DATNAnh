import api from '../axios';
import { getToken } from './authService';

const BASE_URL = '/api/sanphamtour';

// Inline helper function để lấy auth headers
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

export const getAllTours = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        // Add params to query string
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.order) queryParams.append('order', params.order);

        const response = await api.get(`${BASE_URL}?${queryParams.toString()}`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return {
                data: {
                    tours: response.data.data || []
                },
                pagination: {
                    totalPages: response.data.totalPages || 1,
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 1
                }
            };
        }

        throw new Error(response.data?.message || 'Không thể tải danh sách tour.');
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
        // Đối với FormData, chúng ta cần ghi đè Content-Type
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        const response = await api.post(BASE_URL, tourData, config);

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo tour mới.');
    } catch (error) {
        console.error('Error creating tour:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateTour = async (tourId, tourData) => {
    try {
        // Tạo một đối tượng config cho request này để ghi đè header mặc định
        const config = {
            headers: {
                // Interceptor trong axios.js sẽ tự động thêm token
            }
        };

        // Kiểm tra xem dữ liệu có phải là FormData không
        if (tourData instanceof FormData) {
            // Nếu là FormData, set Content-Type để ghi đè mặc định 'application/json'
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        // Nếu không phải FormData, nó sẽ dùng mặc định là 'application/json' từ instance

        const response = await api.put(`${BASE_URL}/${tourId}`, tourData, config);

        console.log("updateTour: Server response:", response.data);

        if (response.data && response.data.success) {
            console.log("updateTour: Success! New file path:",
                response.data.data?.url_anh_bia || "No file path returned");
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật tour ID ${tourId}.`);
    } catch (error) {
        // ... (phần xử lý lỗi giữ nguyên)
        console.error("updateTour error:", error);
        if (error.response) {
            console.error("Response error:", {
                status: error.response.status,
                data: error.response.data,
            });
        }
        throw error.response?.data || error;
    }
};
export const deleteTour = async (tourId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${tourId}`);
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa tour ID ${tourId}.`);
    } catch (error) {
        console.error(`Error deleting tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Đảm bảo hàm getTourStatistics được triển khai đúng

export const getTourStatistics = async () => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể lấy thống kê tour.');
    } catch (error) {
        console.error('Error fetching tour statistics:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};