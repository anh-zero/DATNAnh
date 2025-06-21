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
        const response = await api.post(BASE_URL, tourData, {
            headers: getAuthHeaders(true), // True for FormData
        });
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
        const isFormData = tourData instanceof FormData;

        // Hỗ trợ debug và hotfix
        if (isFormData) {
            // Kiểm tra xem FormData có chứa cả URL và File với cùng key không
            const urlAnhBiaValues = [];
            for (const [key, value] of tourData.entries()) {
                if (key === 'url_anh_bia') {
                    urlAnhBiaValues.push(value);
                }
            }

            if (urlAnhBiaValues.length > 1) {
                console.warn("Warning: Multiple values for 'url_anh_bia' detected in FormData");

                // Giải pháp: Xóa trường url_anh_bia hiện có và chỉ giữ lại file
                const newFormData = new FormData();
                let fileFound = false;

                // Copy tất cả trường khác vào FormData mới
                for (const [key, value] of tourData.entries()) {
                    if (key !== 'url_anh_bia') {
                        newFormData.append(key, value);
                    } else if (value instanceof File && !fileFound) {
                        // Chỉ thêm file đầu tiên tìm thấy
                        newFormData.append(key, value);
                        fileFound = true;
                    }
                }

                // Thay thế FormData cũ bằng FormData mới
                tourData = newFormData;
                console.log("Fixed FormData fields:", [...tourData.keys()]);
            }
        }

        // Đảm bảo không thêm Content-Type khi gửi FormData
        const headers = getAuthHeaders(isFormData);

        // Gửi request
        const response = await api.put(`${BASE_URL}/${tourId}`, tourData, { headers });

        console.log("updateTour: Server response:", response.data);

        if (response.data && response.data.success) {
            console.log("updateTour: Success! New file path:",
                response.data.data?.url_anh_bia || "No file path returned");
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật tour ID ${tourId}.`);
    } catch (error) {
        console.error("updateTour error:", error);
        if (error.response) {
            console.error("Response error:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
            throw error.response.data || error;
        }
        throw error;
    }
};

export const deleteTour = async (tourId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${tourId}`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa tour ID ${tourId}.`);
    } catch (error) {
        console.error(`Error deleting tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourStatistics = async () => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể lấy thông tin thống kê tour.');
    } catch (error) {
        console.error('Error fetching tour statistics:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};