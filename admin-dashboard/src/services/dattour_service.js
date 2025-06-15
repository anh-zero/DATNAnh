const BookingModel = require('../models/dattour_model');
const BookingParticipantModel = require('../models/nguoithamgiatrongdattour_model');
const TourScheduleModel = require('../models/lichtrinhtour_model');
const CustomerModel = require('../models/khachhang_model');
const pool = require('../config/db.config');
const { formatDateForDb } = require('../utils/date_utils');

const BookingService = {
    createBooking: async (bookingData, participantsData = []) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Kiểm tra và destructure bookingData để lấy id_khach_hang
            const { id_khach_hang, id_lich_trinh_tour } = bookingData;

            // Kiểm tra dữ liệu đầu vào
            if (!id_khach_hang) {
                throw new Error("id_khach_hang không được để trống");
            }

            if (!id_lich_trinh_tour) {
                throw new Error("id_lich_trinh_tour không được để trống");
            }

            // Kiểm tra lịch trình tour tồn tại
            const tourSchedule = await TourScheduleModel.findById(id_lich_trinh_tour, connection);
            if (!tourSchedule) {
                throw { statusCode: 404, message: "Lịch trình tour không tồn tại" };
            }

            // Kiểm tra khách hàng tồn tại
            const customer = await CustomerModel.findById(id_khach_hang, connection);
            if (!customer) {
                throw { statusCode: 404, message: "Khách hàng không tồn tại" };
            }

            // Tạo đơn đặt tour
            const newBooking = await BookingModel.create(bookingData, connection);

            // Nếu có danh sách người tham gia
            if (participantsData && participantsData.length > 0) {
                for (const participant of participantsData) {
                    // Đảm bảo liên kết với id_dat_tour vừa tạo
                    participant.id_dat_tour = newBooking.id_dat_tour;
                    await BookingParticipantModel.create(participant, connection);
                }
            }

            await connection.commit();

            // Lấy thông tin chi tiết đơn đặt tour để trả về
            const bookingDetails = await BookingModel.findById(newBooking.id_dat_tour, connection);

            return {
                ...bookingDetails,
                participants: participantsData
            };
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingService.createBooking:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllBookings: async (queryParams) => {
        try {
            // Đảm bảo các giá trị phân trang luôn là số hợp lệ
            const safeParams = {
                ...queryParams,
                limit: Number(queryParams.limit) || 10,
                offset: Number(queryParams.offset) || 0
            };

            const { bookings, totalItems } = await BookingModel.findAll(safeParams);
            const page = Number(queryParams.page) || 1;
            const limit = Number(queryParams.limit) || 10;
            const totalPages = Math.ceil(totalItems / limit) || 1;

            return {
                data: bookings,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    limit
                }
            };
        } catch (error) {
            console.error("Error in BookingService.getAllBookings:", error);
            throw error;
        }
    },

    getBookingById: async (id_dat_tour) => {
        try {
            const booking = await BookingModel.findById(id_dat_tour);
            if (!booking) {
                throw { statusCode: 404, message: "Đơn đặt tour không tồn tại" };
            }
            booking.participants = await BookingParticipantModel.findByBookingId(id_dat_tour);
            return booking;
        } catch (error) {
            console.error("Error in BookingService.getBookingById:", error);
            throw error;
        }
    },

    updateBooking: async (id_dat_tour, bookingData, participantsData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Validate trang_thai_dat_tour
            if (bookingData.trang_thai_dat_tour && !BookingModel.STATUSES.includes(bookingData.trang_thai_dat_tour)) {
                throw { statusCode: 400, message: `Trạng thái đặt tour không hợp lệ: ${bookingData.trang_thai_dat_tour}. Các trạng thái được chấp nhận: ${BookingModel.STATUSES.join(', ')}` };
            }

            // Validate trang_thai_thanh_toan
            if (bookingData.trang_thai_thanh_toan && !BookingModel.PAYMENT_STATUSES.includes(bookingData.trang_thai_thanh_toan)) {
                throw { statusCode: 400, message: `Trạng thái thanh toán không hợp lệ: ${bookingData.trang_thai_thanh_toan}. Các trạng thái được chấp nhận: ${BookingModel.PAYMENT_STATUSES.join(', ')}` };
            }

            const existingBooking = await BookingModel.findById(id_dat_tour, connection);
            if (!existingBooking) {
                throw { statusCode: 404, message: "Đơn đặt tour không tồn tại" };
            }

            const oldQuantity = existingBooking.so_luong_khach;
            const oldStatus = existingBooking.trang_thai_dat_tour;

            if (bookingData.ngay_dat) bookingData.ngay_dat = formatDateForDb(bookingData.ngay_dat);


            await BookingModel.update(id_dat_tour, bookingData, connection);

            // Update participants: delete existing and add new ones, or implement more granular updates
            if (participantsData !== undefined) { // Allow sending empty array to remove all
                await BookingParticipantModel.deleteByBookingId(id_dat_tour, connection);
                if (participantsData.length > 0) {
                    const formattedParticipants = participantsData.map(p => ({
                        ...p,
                        ngay_sinh: p.ngay_sinh ? formatDateForDb(p.ngay_sinh) : null
                    }));
                    await BookingParticipantModel.createMultiple(id_dat_tour, formattedParticipants, connection);
                }
            }

            // Adjust booked slots if quantity or status changes
            const newQuantity = bookingData.so_luong_khach !== undefined ? bookingData.so_luong_khach : oldQuantity;
            const newStatus = bookingData.trang_thai_dat_tour !== undefined ? bookingData.trang_thai_dat_tour : oldStatus;
            const confirmedStatuses = [BookingModel.STATUSES[0], BookingModel.STATUSES[1], BookingModel.STATUSES[4]]; // 'Mới', 'Đã xác nhận', 'Hoàn thành'
            const wasConfirmed = confirmedStatuses.includes(oldStatus);
            const isConfirmed = confirmedStatuses.includes(newStatus);
            let quantityChange = 0;

            if (isConfirmed && !wasConfirmed) { // Became confirmed
                quantityChange = newQuantity;
            } else if (!isConfirmed && wasConfirmed) { // No longer confirmed
                quantityChange = -oldQuantity;
            } else if (isConfirmed && wasConfirmed && newQuantity !== oldQuantity) { // Remained confirmed, quantity changed
                quantityChange = newQuantity - oldQuantity;
            }

            if (quantityChange !== 0) {
                const schedule = await TourScheduleModel.findById(existingBooking.id_lich_trinh_tour, connection);
                if (schedule.so_luong_cho_da_dat + quantityChange > schedule.so_luong_cho_toi_da && quantityChange > 0) {
                    throw { statusCode: 400, message: `Không đủ chỗ trống cho lịch trình này sau khi cập nhật. Còn lại ${schedule.so_luong_cho_toi_da - schedule.so_luong_cho_da_dat} chỗ.` };
                }
                if (schedule.so_luong_cho_da_dat + quantityChange < 0 && quantityChange < 0) {
                    throw { statusCode: 400, message: `Số lượng chỗ đã đặt không thể âm sau khi cập nhật.` };
                }
                await TourScheduleModel.updateBookedSlots(existingBooking.id_lich_trinh_tour, quantityChange, connection);
            }


            await connection.commit();
            return { message: "Cập nhật đơn đặt tour thành công" };
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingService.updateBooking:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteBooking: async (id_dat_tour) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin đơn đặt tour trước khi xóa
            const booking = await BookingModel.findById(id_dat_tour, connection);
            if (!booking) {
                throw { statusCode: 404, message: "Đơn đặt tour không tồn tại" };
            }

            // Xóa các người tham gia trước 
            await BookingParticipantModel.deleteByBookingId(id_dat_tour, connection);

            // Xóa đơn đặt tour
            const result = await BookingModel.delete(id_dat_tour, connection);

            // Cập nhật số lượng chỗ đã đặt trong lịch trình tour
            // Chỉ cập nhật nếu đơn không ở trạng thái đã hủy
            if (booking.trang_thai_dat_tour !== 'Đã hủy') {
                try {
                    // Sử dụng số lượng khách âm để giảm số lượng chỗ đã đặt
                    const changeAmount = -booking.so_luong_khach;
                    await TourScheduleModel.updateBookedSlots(booking.id_lich_trinh_tour, changeAmount, connection);
                } catch (error) {
                    console.warn(`Không thể cập nhật số chỗ đã đặt: ${error.message}`);
                    // Tiếp tục xử lý thay vì throw error
                }
            }

            await connection.commit();

            return {
                message: "Xóa đơn đặt tour thành công.",
                affectedRows: result.affectedRows
            };
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingService.deleteBooking:", error);
            throw error;
        } finally {
            connection.release();
        }
    },
    cancelBooking: async (id_dat_tour, cancellationData = {}) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin đơn đặt tour trước khi hủy
            const booking = await BookingModel.findById(id_dat_tour, connection);
            if (!booking) {
                throw { statusCode: 404, message: "Đơn đặt tour không tồn tại" };
            }

            // Kiểm tra xem đơn đã được hủy chưa
            if (booking.trang_thai_dat_tour === 'Đã hủy') {
                throw { statusCode: 400, message: "Đơn đặt tour đã được hủy trước đó" };
            }

            // Lưu trạng thái cũ
            const oldStatus = booking.trang_thai_dat_tour;
            const quantity = booking.so_luong_khach;

            // Lưu thông tin hủy như người hủy, lý do hủy, thời gian hủy
            const updateData = {
                trang_thai_dat_tour: 'Đã hủy',
                ...cancellationData
            };

            // Cập nhật trạng thái đơn đặt tour thành "Đã hủy"
            await BookingModel.update(id_dat_tour, updateData, connection);

            // Cập nhật số lượng chỗ đã đặt trong lịch trình tour
            // Chỉ cập nhật nếu đơn trước đó không ở trạng thái đã hủy
            const confirmedStatuses = [BookingModel.STATUSES[0], BookingModel.STATUSES[1], BookingModel.STATUSES[4]]; // 'Mới', 'Đã xác nhận', 'Hoàn thành'
            if (confirmedStatuses.includes(oldStatus)) {
                try {
                    // Sử dụng số lượng khách âm để giảm số lượng chỗ đã đặt
                    const changeAmount = -quantity;
                    await TourScheduleModel.updateBookedSlots(booking.id_lich_trinh_tour, changeAmount, connection);
                } catch (error) {
                    console.warn(`Không thể cập nhật số chỗ đã đặt khi hủy: ${error.message}`);
                    // Tiếp tục xử lý thay vì throw error
                }
            }

            await connection.commit();

            return {
                message: "Hủy đơn đặt tour thành công",
                id_dat_tour,
                trang_thai_moi: 'Đã hủy'
            };
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingService.cancelBooking:", error);
            throw error;
        } finally {
            connection.release();
        }
    },
    getBookingStatistics: async () => {
        try {
            return await BookingModel.getBookingStatistics();
        } catch (error) {
            console.error("Error in BookingService.getBookingStatistics:", error);
            throw error;
        }
    },

    // Thêm methods mới

getBookingsByScheduleId: async (id_lich_trinh_tour, page = 1, limit = 10) => {
        try {
            const offset = (page - 1) * limit;

            // Lấy tổng số đơn đặt tour cho lịch trình (phần này đã đúng)
            const countSql = `SELECT COUNT(*) AS total FROM dattour WHERE id_lich_trinh_tour = ?`;
            const [countResult] = await pool.query(countSql, [id_lich_trinh_tour]);
            const totalItems = countResult[0].total;

            // ---- SỬA LẠI CÂU SQL Ở ĐÂY ----
            const sql = `
                SELECT dt.*, kh.ho_ten, kh.email_lien_he, kh.so_dien_thoai
                FROM dattour dt
                JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang
                WHERE dt.id_lich_trinh_tour = ?
                ORDER BY dt.ngay_tao DESC
                LIMIT ? OFFSET ?
            `;
            // ---- KẾT THÚC PHẦN SỬA ----

            const [bookings] = await pool.query(sql, [id_lich_trinh_tour, limit, offset]);

            return {
                bookings,
                totalItems
            };
        } catch (error) {
            console.error("Error in BookingService.getBookingsByScheduleId:", error);
            throw error;
        }
    },

    getBookingsByCustomerId: async (queryParams) => {
        try {
            const {
                id_khach_hang,
                limit,
                offset,
                trangThaiDatTour,
                tuNgay,
                denNgay,
                sortBy,
                order
            } = queryParams;
            const customerExists = await CustomerModel.findById(id_khach_hang);
            if (!customerExists) {
                // Ném ra lỗi 404 nếu không tìm thấy khách hàng
                // Controller sẽ bắt lỗi này và trả về response tương ứng
                throw { statusCode: 404, message: `Không tìm thấy khách hàng với ID ${id_khach_hang}.` };
            }

            // Xây dựng truy vấn cơ sở
            let sql = `
                SELECT dt.*, ltt.ngay_khoi_hanh, ltt.ngay_ket_thuc,
                       spt.ten_tour, spt.url_anh_bia
                FROM dattour dt
                JOIN lichtrinhtour ltt ON dt.id_lich_trinh_tour = ltt.id_lich_trinh_tour
                JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
                WHERE dt.id_khach_hang = ?
            `;

            // Tham số truy vấn
            const sqlParams = [id_khach_hang];

            // Thêm điều kiện lọc theo trạng thái nếu có
            if (trangThaiDatTour) {
                sql += ` AND dt.trang_thai_dat_tour = ?`;
                sqlParams.push(trangThaiDatTour);
            }

            // Thêm điều kiện lọc theo ngày nếu có
            if (tuNgay) {
                sql += ` AND ltt.ngay_khoi_hanh >= ?`;
                sqlParams.push(tuNgay);
            }

            if (denNgay) {
                sql += ` AND ltt.ngay_khoi_hanh <= ?`;
                sqlParams.push(denNgay);
            }

            // Đếm tổng số dòng
            const countSql = `SELECT COUNT(*) as total FROM (${sql}) AS subquery`;
            const [countResult] = await pool.query(countSql, sqlParams);
            const totalItems = countResult[0].total;

            // Thêm sắp xếp và phân trang
            sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
            sqlParams.push(limit, offset);

            // Thực hiện truy vấn
            const [bookings] = await pool.query(sql, sqlParams);

            return {
                bookings,
                totalItems
            };
        } catch (error) {
            console.error("Error in BookingService.getBookingsByCustomerId:", error);
            throw error;
        }
    }
};

module.exports = BookingService;