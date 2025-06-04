import api from '../axios';
import { getToken } from './authService';

const BASE_URL = 'api/bookings'; // Base URL for booking endpoints

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getAllBookings = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, {
            headers: getAuthHeaders(),
            params: params, // { page, limit, searchTerm, sortBy, order, filterStatus, filterPaymentStatus, tourId, customerId }
        });
        // Backend nên trả về: { success: true, message: "...", data: [...bookingsArray], pagination: {...} }
        // Hoặc có thể là response.data.bookings và response.data.pagination trực tiếp từ controller
        if (response.data && response.data.success) {
            const bookings = response.data.data || response.data.bookings; // Điều chỉnh tùy theo response backend
            const pagination = response.data.pagination;
            return { bookings, pagination };
        }
        console.warn("Unexpected response structure for getAllBookings:", response.data);
        return { bookings: [], pagination: {} };
    } catch (error) {
        console.error('Error fetching all bookings:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getBookingById = async (bookingId) => {
    try {
        const response = await api.get(`${BASE_URL}/${bookingId}`, {
            headers: getAuthHeaders(),
        });
        // Backend nên trả về: { success: true, message: "...", data: bookingObject }
        if (response.data && response.data.success) {
            return response.data.data; // bookingObject chứa chi tiết, bao gồm thông tin tour, khách hàng
        }
        console.warn("Unexpected response structure for getBookingById:", response.data);
        return null;
    } catch (error) {
        console.error(`Error fetching booking by ID ${bookingId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Việc tạo booking mới từ admin có thể phức tạp hơn (chọn tour, khách hàng, tính giá)
// Có thể admin chỉ cập nhật trạng thái hoặc tạo booking thủ công với đầy đủ thông tin.
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post(BASE_URL, bookingData, {
            headers: getAuthHeaders(),
        });
        return response.data; // Mong đợi { success, message, data: newBookingObject }
    } catch (error) {
        console.error('Error creating booking:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateBooking = async (bookingId, bookingData) => {
    try {
        // bookingData có thể chỉ chứa các trường cần cập nhật, ví dụ: trạng thái
        const response = await api.put(`${BASE_URL}/${bookingId}`, bookingData, {
            headers: getAuthHeaders(),
        });
        return response.data; // Mong đợi { success, message, data: updatedBookingObject }
    } catch (error) {
        console.error(`Error updating booking ${bookingId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Xóa booking có thể không phải là xóa vật lý mà là cập nhật trạng thái thành 'Đã hủy'
// Hoặc nếu cho phép xóa, cần cẩn trọng.
export const deleteBooking = async (bookingId) => {
    try {
        const response = await api.delete(`${BASE_URL}/${bookingId}`, {
            headers: getAuthHeaders(),
        });
        return response.data; // Mong đợi { success, message }
    } catch (error) {
        console.error(`Error deleting booking ${bookingId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// API call để lấy danh sách tour (để chọn khi tạo/sửa booking)
export const getToursForSelect = async () => {
    try {
        // Giả sử có endpoint 'api/tours/select-list' trả về { id_tour, ten_tour }
        const response = await api.get('api/tours/select-list', { headers: getAuthHeaders() });
        if (response.data && response.data.success) {
            return response.data.data; // Mảng các tour [{ id_tour, ten_tour }]
        }
        return [];
    } catch (error) {
        console.error('Error fetching tours for select:', error);
        return [];
    }
};

// API call để lấy danh sách khách hàng (để chọn khi tạo/sửa booking)
export const getCustomersForSelect = async (searchTerm = '') => {
     try {
        // Giả sử có endpoint 'api/customers/select-list'
        const response = await api.get('api/customers/select-list', {
            headers: getAuthHeaders(),
            params: { searchTerm }
        });
        if (response.data && response.data.success) {
            return response.data.data; // Mảng khách hàng [{ id_khach_hang, ho_ten, email_lien_he }]
        }
        return [];
    } catch (error) {
        console.error('Error fetching customers for select:', error);
        return [];
    }
};