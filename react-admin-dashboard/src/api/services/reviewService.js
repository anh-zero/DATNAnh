import api from '../axios';
import { getToken } from './authService';

const BASE_URL = '/api/danhgiatour';

// Helper function để lấy auth headers
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

// Lấy danh sách đánh giá với phân trang và tìm kiếm
export const getAllReviews = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
        if (params.trangThai) queryParams.append('trangThai', params.trangThai);
        if (params.diemDanhGia) queryParams.append('diemDanhGia', params.diemDanhGia);
        if (params.tuNgay) queryParams.append('tuNgay', params.tuNgay);
        if (params.denNgay) queryParams.append('denNgay', params.denNgay);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.order) queryParams.append('order', params.order);

        const response = await api.get(`${BASE_URL}?${queryParams.toString()}`, {
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Lấy tất cả đánh giá để tính toán thống kê (không phân trang)
export const getAllReviewsForStats = async () => {
    try {
        const response = await api.get(`${BASE_URL}?limit=1000`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews for stats:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Lấy chi tiết đánh giá theo ID
export const getReviewById = async (reviewId) => {
    try {
        const response = await api.get(`${BASE_URL}/${reviewId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching review ID ${reviewId}:`, error);
        throw error.response?.data || error;
    }
};

// Cập nhật đánh giá (duyệt/từ chối, thêm phản hồi)
export const updateReview = async (reviewId, reviewData) => {
    try {
        const response = await api.put(`${BASE_URL}/${reviewId}`, reviewData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating review ${reviewId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${reviewId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting review ${reviewId}:`, error);
        throw error.response?.data || error;
    }
};

// Duyệt đánh giá
export const approveReview = async (reviewId) => {
    try {
        const response = await api.patch(`${BASE_URL}/${reviewId}/approve`, {}, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error approving review ${reviewId}:`, error);
        throw error.response?.data || error;
    }
};

export default {
    getAllReviews,
    getAllReviewsForStats,
    getReviewById,
    updateReview,
    deleteReview,
    approveReview
};