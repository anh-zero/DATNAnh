const pool = require('../config/db.config');

const BookingModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    // Thêm các giá trị ENUM cho trạng thái đặt tour và trạng thái thanh toán
    STATUSES: ['Mới', 'Đã xác nhận', 'Chờ thanh toán', 'Đã hủy', 'Hoàn thành'],
    PAYMENT_STATUSES: ['Chờ thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Hoàn tiền'],

    create: async (bookingData, connection = null) => {
        try {
            // Đảm bảo id_khach_hang tồn tại
            if (!bookingData.id_khach_hang) {
                throw new Error("id_khach_hang is required");
            }

            // Validation cho trang_thai_thanh_toan nếu được cung cấp
            if (bookingData.trang_thai_thanh_toan &&
                !BookingModel.PAYMENT_STATUSES.includes(bookingData.trang_thai_thanh_toan)) {
                throw new Error(`Invalid payment status: ${bookingData.trang_thai_thanh_toan}`);
            }

            // Log dữ liệu trước khi insert để debug
            console.log("Booking data for insert:", bookingData);

            const {
                id_khach_hang, id_lich_trinh_tour, ngay_dat, so_luong_khach,
                tong_tien_du_kien = null, tong_tien_thanh_toan = null,
                trang_thai_thanh_toan = 'Chưa thanh toán', // Default
                trang_thai_dat_tour = BookingModel.STATUSES[0], // Default to 'Mới'
                ghi_chu_dat_tour = null
            } = bookingData;

            // Kiểm tra trạng thái thanh toán nếu được cung cấp
            if (trang_thai_thanh_toan && !BookingModel.PAYMENT_STATUSES.includes(trang_thai_thanh_toan)) {
                throw { statusCode: 400, message: `Trạng thái thanh toán không hợp lệ: ${trang_thai_thanh_toan}. Các trạng thái được chấp nhận: ${BookingModel.PAYMENT_STATUSES.join(', ')}` };
            }

            if (!BookingModel.STATUSES.includes(trang_thai_dat_tour)) {
                throw new Error(`Trạng thái đặt tour không hợp lệ: ${trang_thai_dat_tour}.`);
            }

            // Sử dụng tên cột DB: ngay_dat, ngay_tao, ngay_cap_nhat
            const sql = `INSERT INTO dattour
                            (id_khach_hang, id_lich_trinh_tour, ngay_dat, so_luong_khach,
                             tong_tien_du_kien, tong_tien_thanh_toan, trang_thai_thanh_toan,
                             trang_thai_dat_tour, ghi_chu_dat_tour, ngay_tao, ngay_cap_nhat)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
            try {
                const [result] = await BookingModel._query(sql, [
                    id_khach_hang, id_lich_trinh_tour, ngay_dat, so_luong_khach,
                    tong_tien_du_kien, tong_tien_thanh_toan, trang_thai_thanh_toan,
                    trang_thai_dat_tour, ghi_chu_dat_tour
                ], connection);
                return { id_dat_tour: result.insertId, ...bookingData };
            } catch (error) {
                console.error("Error in BookingModel.create:", error);
                throw error;
            }
        } catch (error) {
            console.error("Error in BookingModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset = 0, searchTerm = '', trangThaiDatTour = '', trangThaiThanhToan = '', tuNgay = null, denNgay = null, sortBy = 'dt.ngay_tao', order = 'DESC' }, connection = null) => {
        // Đảm bảo limit và offset là số nguyên hợp lệ
        const safeLimit = parseInt(limit) || 10;
        const safeOffset = parseInt(offset) || 0;

        let baseSql = `
            FROM dattour dt 
            LEFT JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang
            LEFT JOIN lichtrinhtour ltt ON dt.id_lich_trinh_tour = ltt.id_lich_trinh_tour
            LEFT JOIN tour t ON ltt.id_tour = t.id_tour
            WHERE 1=1
        `;

        const params = [];

        if (searchTerm) {
            baseSql += ` AND (kh.ho_ten LIKE ? OR kh.email_lien_he LIKE ? OR t.ten_tour LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Lọc theo trạng thái đặt tour
        if (trangThaiDatTour) {
            baseSql += ` AND dt.trang_thai_dat_tour = ?`;
            params.push(trangThaiDatTour);
        }

        // Lọc theo trạng thái thanh toán
        if (trangThaiThanhToan) {
            baseSql += ` AND dt.trang_thai_thanh_toan = ?`;
            params.push(trangThaiThanhToan);
        }

        // Lọc theo khoảng thời gian
        if (tuNgay) {
            baseSql += ` AND dt.ngay_dat >= ?`;
            params.push(tuNgay);
        }

        if (denNgay) {
            baseSql += ` AND dt.ngay_dat <= ?`;
            params.push(denNgay);
        }

        // Validate sortBy để tránh SQL injection
        const allowedSortColumns = [
            'dt.ngay_tao', 'dt.ngay_dat', 'dt.trang_thai_dat_tour', 'dt.trang_thai_thanh_toan',
            'kh.ho_ten', 't.ten_tour', 'dt.so_luong_khach', 'dt.tong_tien_thanh_toan'
        ];

        if (!allowedSortColumns.includes(sortBy)) {
            sortBy = 'dt.ngay_tao'; // Default sort
        }

        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(*) as totalItems ${baseSql}`;
        const dataSql = `
            SELECT 
                dt.id_dat_tour, dt.id_khach_hang, dt.id_lich_trinh_tour, 
                dt.ngay_dat, dt.so_luong_khach, dt.trang_thai_dat_tour, 
                dt.trang_thai_thanh_toan, dt.tong_tien_thanh_toan, dt.ghi_chu_dat_tour,
                dt.ngay_tao, dt.ngay_cap_nhat,
                kh.ho_ten as ten_khach_hang, kh.email_lien_he, kh.so_dien_thoai,
                t.ten_tour, ltt.ngay_khoi_hanh, ltt.ngay_ket_thuc
            ${baseSql}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const dataParams = [...params, safeLimit, safeOffset];

        try {
            const [countRows] = await BookingModel._query(countSql, params, connection);
            const [rows] = await BookingModel._query(dataSql, dataParams, connection);
            return { bookings: rows, totalItems: countRows[0].totalItems };
        } catch (error) {
            console.error("Error in BookingModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_dat_tour, connection = null) => {
        // Sử dụng tên cột DB: ngay_dat, ngay_tao, ngay_cap_nhat
        const sql = `SELECT
                        dt.id_dat_tour, dt.id_khach_hang, dt.id_lich_trinh_tour,
                        dt.ngay_dat, dt.so_luong_khach, dt.tong_tien_du_kien,
                        dt.tong_tien_thanh_toan, dt.trang_thai_thanh_toan, dt.trang_thai_dat_tour,
                        dt.ghi_chu_dat_tour, dt.ngay_tao, dt.ngay_cap_nhat,
                        kh.ho_ten as ten_khach_hang, kh.email_lien_he as email_khach_hang, kh.so_dien_thoai as sdt_khach_hang, kh.dia_chi_kh,
                        lt.ngay_khoi_hanh, lt.ngay_ket_thuc, lt.gia_tien as gia_lich_trinh, lt.so_luong_cho_toi_da, lt.so_luong_cho_da_dat, lt.trang_thai_lich_trinh,
                        spt.id_san_pham_tour, spt.ten_tour, spt.thoi_gian_du_kien as thoi_gian_tour, spt.url_anh_bia
                     FROM dattour dt
                     JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang
                     JOIN lichtrinhtour lt ON dt.id_lich_trinh_tour = lt.id_lich_trinh_tour
                     JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour
                     WHERE dt.id_dat_tour = ?`;
        try {
            const [rows] = await BookingModel._query(sql, [id_dat_tour], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in BookingModel.findById:", error);
            throw error;
        }
    },

    update: async (id_dat_tour, bookingData, connection = null) => {
        // Kiểm tra trạng thái thanh toán nếu được cập nhật
        if (bookingData.trang_thai_thanh_toan && !BookingModel.PAYMENT_STATUSES.includes(bookingData.trang_thai_thanh_toan)) {
            throw { statusCode: 400, message: `Trạng thái thanh toán không hợp lệ: ${bookingData.trang_thai_thanh_toan}. Các trạng thái được chấp nhận: ${BookingModel.PAYMENT_STATUSES.join(', ')}` };
        }

        const fields = [];
        const values = [];
        const allowedFields = [
            'ngay_dat', 'so_luong_khach', 'tong_tien_du_kien', // Đã đổi tên ngay_dat
            'tong_tien_thanh_toan', 'trang_thai_thanh_toan', 'trang_thai_dat_tour', 'ghi_chu_dat_tour'
        ];

        // Kiểm tra trạng thái thanh toán nếu được cập nhật
        if (bookingData.trang_thai_thanh_toan && !BookingModel.PAYMENT_STATUSES.includes(bookingData.trang_thai_thanh_toan)) {
            throw { statusCode: 400, message: `Trạng thái thanh toán không hợp lệ: ${bookingData.trang_thai_thanh_toan}. Các trạng thái được chấp nhận: ${BookingModel.PAYMENT_STATUSES.join(', ')}` };
        }

        Object.keys(bookingData).forEach(key => {
            if (allowedFields.includes(key) && bookingData[key] !== undefined) {
                fields.push(`${key} = ?`); // Key ở đây là tên thuộc tính JS, sẽ khớp tên cột DB đã đổi
                if (key === 'ngay_dat' && bookingData[key]) {
                    values.push(new Date(bookingData[key]));
                } else {
                    values.push(bookingData[key]);
                }
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        if (bookingData.trang_thai_dat_tour && !BookingModel.STATUSES.includes(bookingData.trang_thai_dat_tour)) {
            throw new Error(`Trang thái đặt tour không hợp lệ khi cập nhật: ${bookingData.trang_thai_dat_tour}.`);
        }

        values.push(id_dat_tour);
        // Sử dụng tên cột DB: ngay_cap_nhat
        const sql = `UPDATE dattour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_dat_tour = ?`;

        try {
            const [result] = await BookingModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in BookingModel.update for id ${id_dat_tour}:`, error);
            throw error;
        }
    },

    delete: async (id_dat_tour, connection = null) => { // Giữ nguyên
        const sql = "DELETE FROM dattour WHERE id_dat_tour = ?";
        try {
            const [result] = await BookingModel._query(sql, [id_dat_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in BookingModel.delete for id ${id_dat_tour}:`, error);
            throw error;
        }
    },
    getBookingStatistics: async (connection = null) => { // Giữ nguyên
        const totalBookingsSql = "SELECT COUNT(*) as total_bookings FROM dattour";
        const pendingBookingsSql = "SELECT COUNT(*) as pending_bookings FROM dattour WHERE trang_thai_dat_tour IN ('Chờ xác nhận', 'Đang chờ xử lý')";
        const confirmedBookingsSql = "SELECT COUNT(*) as confirmed_bookings FROM dattour WHERE trang_thai_dat_tour = 'Đã xác nhận'";
        const completedBookingsSql = "SELECT COUNT(*) as completed_bookings FROM dattour WHERE trang_thai_dat_tour = 'Đã hoàn thành'";
        const cancelledBookingsSql = "SELECT COUNT(*) as cancelled_bookings FROM dattour WHERE trang_thai_dat_tour LIKE 'Đã hủy%'";
        const totalRevenueSql = "SELECT SUM(tong_tien_thanh_toan) as total_revenue FROM dattour WHERE trang_thai_thanh_toan = 'Đã thanh toán'";
        const bookingsByStatusSql = "SELECT trang_thai_dat_tour, COUNT(*) as count FROM dattour GROUP BY trang_thai_dat_tour";
        const paymentStatusSql = "SELECT trang_thai_thanh_toan, COUNT(*) as count FROM dattour GROUP BY trang_thai_thanh_toan";
        try {
            const [[totalResult]] = await BookingModel._query(totalBookingsSql, [], connection);
            const [[pendingResult]] = await BookingModel._query(pendingBookingsSql, [], connection);
            const [[confirmedResult]] = await BookingModel._query(confirmedBookingsSql, [], connection);
            const [[completedResult]] = await BookingModel._query(completedBookingsSql, [], connection);
            const [[cancelledResult]] = await BookingModel._query(cancelledBookingsSql, [], connection);
            const [[revenueResult]] = await BookingModel._query(totalRevenueSql, [], connection);
            const [statusCounts] = await BookingModel._query(bookingsByStatusSql, [], connection);
            const [paymentCounts] = await BookingModel._query(paymentStatusSql, [], connection);
            return {
                total_bookings: totalResult.total_bookings || 0,
                pending_bookings: pendingResult.pending_bookings || 0,
                confirmed_bookings: confirmedResult.confirmed_bookings || 0,
                completed_bookings: completedResult.completed_bookings || 0,
                cancelled_bookings: cancelledResult.cancelled_bookings || 0,
                total_revenue: revenueResult.total_revenue || 0,
                bookings_by_status: statusCounts,
                bookings_by_payment_status: paymentCounts,
            };
        } catch (error) {
            console.error("Error in BookingModel.getStatistics:", error);
            throw error;
        }
    },
};
module.exports = BookingModel;