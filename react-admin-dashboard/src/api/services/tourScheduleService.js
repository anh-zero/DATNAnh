import api from '../axios';
import { getToken } from './authService';

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const getBaseUrlForTour = (tourId) => `api/tours/${tourId}/schedules`;

export const getAllSchedulesForTour = async (tourId, params = {}) => {
    try {
        const response = await api.get(getBaseUrlForTour(tourId), {
            headers: getAuthHeaders(),
            params: params, // { sortBy, order }
        });
        if (response.data && response.data.success) {
            return response.data.data; 
        }
        throw new Error(response.data?.message || `Không thể lấy danh sách lịch trình cho tour ID ${tourId}.`);
    } catch (error) {
        console.error(`Error fetching schedules for tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourScheduleById = async (tourId, scheduleId) => {
    try {
        const response = await api.get(`${getBaseUrlForTour(tourId)}/${scheduleId}`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || `Không thể lấy thông tin lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error fetching schedule ID ${scheduleId} for tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createTourSchedule = async (tourId, scheduleData) => {
    try {
        const response = await api.post(getBaseUrlForTour(tourId), scheduleData, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo lịch trình mới.');
    } catch (error) {
        console.error('Error creating tour schedule:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateTourSchedule = async (tourId, scheduleId, scheduleData) => {
    try {
        const response = await api.put(`${getBaseUrlForTour(tourId)}/${scheduleId}`, scheduleData, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error updating schedule ID ${scheduleId} for tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteTourSchedule = async (tourId, scheduleId) => {
    try {
        const response = await api.delete(`${getBaseUrlForTour(tourId)}/${scheduleId}`, {
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error deleting schedule ID ${scheduleId} for tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const cancelTourSchedule = async (tourId, scheduleId) => {
    try {
        // Body có thể rỗng hoặc chứa lý do hủy nếu API backend yêu cầu
        const response = await api.patch(`${getBaseUrlForTour(tourId)}/${scheduleId}/cancel`, {}, { 
            headers: getAuthHeaders(),
        });
        if (response.data && response.data.success) {
            return response.data.data; // API có thể trả về lịch trình đã cập nhật
        }
        throw new Error(response.data?.message || `Không thể hủy lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error cancelling schedule ID ${scheduleId} for tour ${tourId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};