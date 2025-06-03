const pool = require('../config/db.config');
const BookingModel = require('../models/booking_model');
const BookingParticipantModel = require('../models/booking_participant_model');
const CustomerModel = require('../models/customer_model');
const TourScheduleModel = require('../models/tour_schedule_model');

const createBooking = async (bookingDataFromController, participantsData = []) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const customer = await CustomerModel.findById(bookingDataFromController.id_khach_hang, connection);
        if (!customer) {
            throw { statusCode: 400, message: `Khách hàng với ID ${bookingDataFromController.id_khach_hang} không tồn tại.` };
        }

        const tourSchedule = await TourScheduleModel.findById(bookingDataFromController.id_lich_trinh_tour, connection);
        if (!tourSchedule) {
            throw { statusCode: 400, message: `Lịch khởi hành với ID ${bookingDataFromController.id_lich_trinh_tour} không tồn tại.` };
        }
        if (tourSchedule.trang_thai_lich_trinh !== 'Đang bán' && tourSchedule.trang_thai_lich_trinh !== 'Sắp mở bán') {
             throw { statusCode: 400, message: `Lịch khởi hành này không còn mở bán (Trạng thái: ${tourSchedule.trang_thai_lich_trinh}).` };
        }

        const requestedSlots = parseInt(bookingDataFromController.so_luong_khach);
        if (isNaN(requestedSlots) || requestedSlots <= 0) {
            throw { statusCode: 400, message: 'Số lượng khách không hợp lệ.' };
        }
        if (participantsData && participantsData.length > 0 && participantsData.length !== requestedSlots) {
             throw { statusCode: 400, message: `Số lượng khách (${requestedSlots}) không khớp với số người tham gia được cung cấp (${participantsData.length}).` };
        }

        const availableSlots = tourSchedule.so_luong_cho_toi_da - tourSchedule.so_luong_cho_da_dat;
        if (availableSlots < requestedSlots) {
            throw { statusCode: 400, message: `Không đủ chỗ trống cho lịch trình này. Chỉ còn ${availableSlots} chỗ.` };
        }

        let tongTienDuKien = bookingDataFromController.tong_tien_du_kien;
        if (tongTienDuKien === undefined && tourSchedule.gia_tien) {
            tongTienDuKien = parseFloat(tourSchedule.gia_tien) * requestedSlots;
        }

        // Chuẩn bị dữ liệu cho model, sử dụng tên trường `ngay_dat`
        const dataToCreateModel = {
            id_khach_hang: bookingDataFromController.id_khach_hang,
            id_lich_trinh_tour: bookingDataFromController.id_lich_trinh_tour,
            ngay_dat: bookingDataFromController.ngay_dat_tour || new Date(), // API gửi `ngay_dat_tour`, model dùng `ngay_dat`
            so_luong_khach: requestedSlots,
            tong_tien_du_kien: tongTienDuKien,
            tong_tien_thanh_toan: bookingDataFromController.tong_tien_thanh_toan || 0,
            trang_thai_thanh_toan: bookingDataFromController.trang_thai_thanh_toan || 'Chưa thanh toán',
            trang_thai_dat_tour: bookingDataFromController.trang_thai_dat_tour || 'Chờ xác nhận',
            ghi_chu_dat_tour: bookingDataFromController.ghi_chu_dat_tour || null
        };

        const newBooking = await BookingModel.create(dataToCreateModel, connection);

        if (participantsData && participantsData.length > 0) {
            await BookingParticipantModel.createMultiple(newBooking.id_dat_tour, participantsData, connection);
        }

        await TourScheduleModel.updateBookedSlots(tourSchedule.id_lich_trinh_tour, requestedSlots, connection);

        await connection.commit();
        const createdBookingDetails = await getBookingById(newBooking.id_dat_tour);
        return createdBookingDetails;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

const updateBooking = async (id_dat_tour, bookingDataFromController, newParticipantsData = null) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const existingBooking = await BookingModel.findById(id_dat_tour, connection);
        if (!existingBooking) {
            throw { statusCode: 404, message: 'Đơn đặt tour không tồn tại.' };
        }
        const tourSchedule = await TourScheduleModel.findById(existingBooking.id_lich_trinh_tour, connection);
        if (!tourSchedule) {
            throw { statusCode: 500, message: 'Lịch trình liên kết với đơn đặt tour không tồn tại.' };
        }

        let slotDifference = 0;
        // Chuẩn bị dữ liệu cho model, ánh xạ `ngay_dat_tour` từ controller sang `ngay_dat` cho model nếu có
        const dataToUpdateModel = { ...bookingDataFromController };
        if (bookingDataFromController.ngay_dat_tour !== undefined) {
            dataToUpdateModel.ngay_dat = bookingDataFromController.ngay_dat_tour;
            delete dataToUpdateModel.ngay_dat_tour; // Xóa key cũ
        }
        delete dataToUpdateModel.id_khach_hang; // Không cho cập nhật qua API này
        delete dataToUpdateModel.id_lich_trinh_tour;


        if (dataToUpdateModel.so_luong_khach !== undefined && parseInt(dataToUpdateModel.so_luong_khach) !== existingBooking.so_luong_khach) {
            // ... (logic tính slotDifference và tong_tien_du_kien như cũ) ...
            const newSlotsRequested = parseInt(dataToUpdateModel.so_luong_khach);
            if (isNaN(newSlotsRequested) || newSlotsRequested <= 0) {
                throw { statusCode: 400, message: 'Số lượng khách mới không hợp lệ.' };
            }
            slotDifference = newSlotsRequested - existingBooking.so_luong_khach;
            const currentAvailableSlots = tourSchedule.so_luong_cho_toi_da - (tourSchedule.so_luong_cho_da_dat - existingBooking.so_luong_khach);
            if (currentAvailableSlots < newSlotsRequested) {
                throw { statusCode: 400, message: `Không đủ chỗ trống để cập nhật số lượng khách. Chỉ còn ${currentAvailableSlots} chỗ (không tính đơn này).` };
            }
            if (tourSchedule.gia_tien) {
                dataToUpdateModel.tong_tien_du_kien = parseFloat(tourSchedule.gia_tien) * newSlotsRequested;
            }
        }

        const result = await BookingModel.update(id_dat_tour, dataToUpdateModel, connection);

        if (newParticipantsData !== null && Array.isArray(newParticipantsData)) {
            // ... (logic cập nhật participants như cũ) ...
             await BookingParticipantModel.deleteByBookingId(id_dat_tour, connection);
            if (newParticipantsData.length > 0) {
                if (dataToUpdateModel.so_luong_khach && newParticipantsData.length !== dataToUpdateModel.so_luong_khach) {
                     throw { statusCode: 400, message: `Số lượng khách (${dataToUpdateModel.so_luong_khach}) không khớp với số người tham gia được cung cấp (${newParticipantsData.length}).` };
                }
                await BookingParticipantModel.createMultiple(id_dat_tour, newParticipantsData, connection);
            }
        }

        if (slotDifference !== 0) {
            await TourScheduleModel.updateBookedSlots(existingBooking.id_lich_trinh_tour, slotDifference, connection);
        }

        await connection.commit();
        const updatedBookingDetails = await getBookingById(id_dat_tour);
        return { message: 'Cập nhật đơn đặt tour thành công.', booking: updatedBookingDetails };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// ... (getAllBookings, getBookingById, cancelBooking, getBookingStatistics giữ nguyên)
const getAllBookings = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { searchTerm, trangThaiDatTour, trangThaiThanhToan, tuNgay, denNgay, sortBy, order } = filters;

    const { bookings, totalItems } = await BookingModel.findAll({
        limit: parseInt(limit), offset, searchTerm, trangThaiDatTour, trangThaiThanhToan, tuNgay, denNgay, sortBy, order
    });
    return {
        bookings,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const getBookingById = async (id_dat_tour) => {
    const booking = await BookingModel.findById(id_dat_tour);
    if (!booking) {
        throw { statusCode: 404, message: 'Đơn đặt tour không tồn tại.' };
    }
    booking.participants = await BookingParticipantModel.findByBookingId(id_dat_tour);
    return booking;
};

const cancelBooking = async (id_dat_tour, reasonMessage = "Đã hủy bởi admin") => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const booking = await BookingModel.findById(id_dat_tour, connection);
        if (!booking) {
            throw { statusCode: 404, message: 'Đơn đặt tour không tồn tại.' };
        }
        if (booking.trang_thai_dat_tour.startsWith('Đã hủy')) {
             throw { statusCode: 400, message: 'Đơn đặt tour này đã được hủy trước đó.' };
        }
        if (booking.trang_thai_dat_tour === 'Đã hoàn thành') {
            throw { statusCode: 400, message: 'Không thể hủy đơn đặt tour đã hoàn thành.' };
        }

        const updateData = {
            trang_thai_dat_tour: reasonMessage,
        };
        await BookingModel.update(id_dat_tour, updateData, connection);
        await TourScheduleModel.updateBookedSlots(booking.id_lich_trinh_tour, -booking.so_luong_khach, connection);
        await connection.commit();
        const cancelledBookingDetails = await getBookingById(id_dat_tour);
        return { message: `Đơn đặt tour đã được hủy (Lý do: ${reasonMessage}).`, booking: cancelledBookingDetails };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
const getBookingStatistics = async () => {
    return BookingModel.getBookingStatistics();
};

module.exports = { createBooking, getAllBookings, getBookingById, updateBooking, cancelBooking, getBookingStatistics };