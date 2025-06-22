import api from '../axios';
import { getToken } from './authService';

const BASE_URL = '/api/lichtrinhtour';

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

export const getAllTourSchedules = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

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
                    schedules: response.data.data || []
                },
                pagination: {
                    totalPages: response.data.totalPages || 1,
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 1
                }
            };
        }

        throw new Error(response.data?.message || 'Không thể tải danh sách lịch trình tour.');
    } catch (error) {
        console.error('Error fetching tour schedules:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourScheduleById = async (scheduleId) => {
    try {
        const response = await api.get(`${BASE_URL}/${scheduleId}`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data?.message || `Không thể lấy thông tin lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error fetching schedule by ID ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createTourSchedule = async (scheduleData) => {
    try {
        const response = await api.post(BASE_URL, scheduleData, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể tạo lịch trình tour mới.');
    } catch (error) {
        console.error('Error creating tour schedule:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateTourSchedule = async (scheduleId, scheduleData) => {
    try {
        const response = await api.put(`${BASE_URL}/${scheduleId}`, scheduleData, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể cập nhật lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error updating schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteTourSchedule = async (scheduleId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${scheduleId}`);

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || `Không thể xóa lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error deleting schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourScheduleStatistics = async () => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể lấy thống kê lịch trình tour.');
    } catch (error) {
        console.error('Error fetching tour schedule statistics:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const cancelTourSchedule = async (scheduleId) => {
    try {
        const response = await api.patch(`${BASE_URL}/${scheduleId}/cancel`, {}, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data.data; // API có thể trả về lịch trình đã cập nhật
        }
        throw new Error(response.data?.message || `Không thể hủy lịch trình ID ${scheduleId}.`);
    } catch (error) {
        console.error(`Error cancelling schedule ID ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getTourSchedulesByTourId = async (id_san_pham_tour) => {
    try {
        // Đúng endpoint backend
        const response = await api.get(`/api/sanphamtour/${id_san_pham_tour}/lichtrinhtour`, {
            headers: getAuthHeaders(),
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || 'Không thể lấy danh sách lịch trình theo tour.');
    } catch (error) {
        console.error(`Error fetching schedules by tour ID ${id_san_pham_tour}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getScheduleBookings = async (scheduleId) => {
    const response = await api.get(`/api/lichtrinhtour/${scheduleId}/dattour`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getScheduleServices = async (scheduleId) => {
    const response = await api.get(`/api/lichtrinhtour/${scheduleId}/dichvutour`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const addServiceToSchedule = async (scheduleId, serviceData) => {
    const response = await api.post(`/api/lichtrinhtour/${scheduleId}/dichvutour`, serviceData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Lấy hoạt động của lịch trình
export const getScheduleActivities = async (scheduleId) => {
    try {
        // Sửa endpoint từ /api/hoatdongtour/by-schedule/${scheduleId}
        // Thành /api/lichtrinhtour/${scheduleId}/hoatdongtour
        const response = await api.get(`/api/lichtrinhtour/${scheduleId}/hoatdongtour`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching activities for schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const addActivityToSchedule = async (scheduleId, activityData) => {
    const response = await api.post(`/api/lichtrinhtour/${scheduleId}/hoatdongtour`, activityData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Thêm API service mới để lấy danh sách dịch vụ có sẵn
export const getAllAvailableTourServices = async () => {
    try {
        const response = await api.get('/api/dichvutour', {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching available services:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Cập nhật dịch vụ của lịch trình
export const updateServiceInSchedule = async (scheduleId, serviceId, updatedData) => {
    try {
        // Thêm ID vào dữ liệu gửi đi
        const dataWithId = {
            ...updatedData,
            id_dich_vu_tour: serviceId,
            id_lich_trinh_tour: scheduleId // Đảm bảo cũng gửi ID lịch trình
        };

        // Sửa URL để khớp với khai báo route trong index_routes.js
        const response = await api.put(`/api/dichvutour/${serviceId}`, dataWithId, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating service ID ${serviceId} in schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Xóa dịch vụ khỏi lịch trình
export const removeServiceFromSchedule = async (scheduleId, serviceId) => {
    try {
        const response = await api.delete(`/api/dichvutour/${serviceId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error removing service ID ${serviceId} from schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Cập nhật hoạt động của lịch trình
export const updateActivityInSchedule = async (scheduleId, activityId, updatedData) => {
    try {
        // Thêm ID vào dữ liệu gửi đi
        const dataWithId = {
            ...updatedData,
            id_hoat_dong: activityId,
            id_lich_trinh_tour: scheduleId
        };

        // Gọi API cập nhật hoạt động
        const response = await api.put(`/api/hoatdongtour/${activityId}`, dataWithId, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating activity ID ${activityId} in schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Xóa hoạt động khỏi lịch trình
export const removeActivityFromSchedule = async (scheduleId, activityId) => {
    try {
        const response = await api.delete(`/api/hoatdongtour/${activityId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error removing activity ID ${activityId} from schedule ${scheduleId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};