import api from '../axios';
import { getToken } from './authService';

const BASE_URL = '/api/dattour';

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

// Lấy danh sách đặt tour với phân trang và tìm kiếm
export const getAllBookings = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
        if (params.trangThaiDatTour) queryParams.append('trangThaiDatTour', params.trangThaiDatTour);
        if (params.trangThaiThanhToan) queryParams.append('trangThaiThanhToan', params.trangThaiThanhToan);
        if (params.tuNgay) queryParams.append('tuNgay', params.tuNgay);
        if (params.denNgay) queryParams.append('denNgay', params.denNgay);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.order) queryParams.append('order', params.order);

        const response = await api.get(`${BASE_URL}?${queryParams.toString()}`, {
            headers: getAuthHeaders(),
        });

        // Đoạn code ví dụ để xử lý dữ liệu bookings từ API
        const processBookingData = (booking) => {
            // Kiểm tra và xử lý chi tiết hơn cho các trường số tiền
            let tongTienDuKien = 0;
            if (booking.tong_tien_du_kien !== undefined && booking.tong_tien_du_kien !== null) {
                if (typeof booking.tong_tien_du_kien === 'string') {
                    // Loại bỏ các ký tự không phải số và dấu thập phân
                    tongTienDuKien = parseFloat(booking.tong_tien_du_kien.replace(/[^\d.-]/g, ''));
                } else {
                    tongTienDuKien = parseFloat(booking.tong_tien_du_kien);
                }
            }

            let tongTienThanhToan = 0;
            if (booking.tong_tien_thanh_toan !== undefined && booking.tong_tien_thanh_toan !== null) {
                if (typeof booking.tong_tien_thanh_toan === 'string') {
                    tongTienThanhToan = parseFloat(booking.tong_tien_thanh_toan.replace(/[^\d.-]/g, ''));
                } else {
                    tongTienThanhToan = parseFloat(booking.tong_tien_thanh_toan);
                }
            }

            console.log(`Booking ${booking.id_dat_tour} processing:`, {
                original: booking.tong_tien_du_kien,
                processed: tongTienDuKien
            });

            return {
                ...booking,
                tong_tien_du_kien: isNaN(tongTienDuKien) ? 0 : tongTienDuKien,
                tong_tien_thanh_toan: isNaN(tongTienThanhToan) ? 0 : tongTienThanhToan
            };
        };

        if (response.data.success && response.data.data) {
            // Đảm bảo luôn chuyển đổi dữ liệu
            response.data.data = response.data.data.map(processBookingData);
        } else if (response.data.bookings) {
            // Trường hợp API trả về bookings thay vì data
            response.data.bookings = response.data.bookings.map(processBookingData);
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Cập nhật phương thức getBookingById
export const getBookingById = async (bookingId) => {
    try {
        const response = await api.get(`${BASE_URL}/${bookingId}`, {
            headers: getAuthHeaders(),
        });

        console.log("Booking details raw data:", response.data);

        // Hàm xử lý dữ liệu số giống như trong getAllBookings
        const processBookingData = (booking) => {
            return {
                ...booking,
                tong_tien_du_kien: booking.tong_tien_du_kien ? parseFloat(booking.tong_tien_du_kien) : 0,
                tong_tien_thanh_toan: booking.tong_tien_thanh_toan ? parseFloat(booking.tong_tien_thanh_toan) : 0,
                gia_lich_trinh: booking.gia_lich_trinh ? parseFloat(booking.gia_lich_trinh) : 0
            };
        };

        // Kiểm tra cấu trúc dữ liệu và trả về dữ liệu phù hợp đã qua xử lý
        if (response.data && response.data.success) {
            if (response.data.data) {
                return processBookingData(response.data.data);
            } else if (response.data.booking) {
                return processBookingData(response.data.booking);
            } else {
                return processBookingData(response.data);
            }
        } else {
            return processBookingData(response.data);
        }
    } catch (error) {
        console.error(`Error fetching booking ID ${bookingId}:`, error);
        throw error.response?.data || error;
    }
};

// Tạo đơn đặt tour mới
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post(BASE_URL, bookingData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error creating booking:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Cập nhật đơn đặt tour
export const updateBooking = async (bookingId, bookingData) => {
    try {
        const response = await api.put(`${BASE_URL}/${bookingId}`, bookingData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating booking ${bookingId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Hủy đơn đặt tour
export const cancelBooking = async (bookingId, reason) => {
    try {
        const response = await api.patch(`${BASE_URL}/${bookingId}/cancel`, { reason }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error cancelling booking ${bookingId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Lấy thống kê đặt tour
export const getBookingStatistics = async () => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching booking statistics:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Thêm hàm deleteBooking

/**
 * Xóa đơn đặt tour
 * @param {number} id - ID của đơn đặt tour cần xóa
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const deleteBooking = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Thêm các headers cần thiết như token
                ...getAuthHeaders()
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa đơn đặt tour');
        }

        return data;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

// Thêm các phương thức liên quan đến người tham gia và đánh giá

// Lấy danh sách người tham gia tour
export const getBookingParticipants = async (bookingId) => {
    try {
        const response = await api.get(`/api/nguoithamgiatrongdattour/booking/${bookingId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching participants for booking ${bookingId}:`, error);
        throw error.response?.data || error;
    }
};

// Thêm người tham gia mới
export const addParticipantToBooking = async (bookingId, participantData) => {
    try {
        // Thêm id_dat_tour vào data
        const dataWithBookingId = {
            ...participantData,
            id_dat_tour: bookingId
        };
        const response = await api.post('/api/nguoithamgiatrongdattour', dataWithBookingId, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error adding participant to booking ${bookingId}:`, error);
        throw error.response?.data || error;
    }
};

// Cập nhật thông tin người tham gia
export const updateBookingParticipant = async (bookingId, participantId, participantData) => {
    try {
        const response = await api.put(`/api/nguoithamgiatrongdattour/${participantId}`,
            {
                ...participantData,
                id_dat_tour: bookingId
            },
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating participant ${participantId}:`, error);
        throw error.response?.data || error;
    }
};

// Xóa người tham gia
export const deleteBookingParticipant = async (bookingId, participantId) => {
    try {
        const response = await api.delete(`/api/nguoithamgiatrongdattour/${participantId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting participant ${participantId}:`, error);
        throw error.response?.data || error;
    }
};

// Lấy đánh giá của đơn đặt tour
export const getBookingReview = async (bookingId) => {
    try {
        const response = await api.get(`/api/danhgiatour/booking/${bookingId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching review for booking ${bookingId}:`, error);
        throw error.response?.data || error;
    }
};

export default {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    cancelBooking,
    getBookingStatistics,
    deleteBooking,
    getBookingParticipants,
    addParticipantToBooking,
    updateBookingParticipant,
    deleteBookingParticipant,
    getBookingReview
};