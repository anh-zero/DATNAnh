const pool = require('../config/db.config');

const BookingModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (bookingData, connection = null) => {
        const {
            id_khach_hang,
            id_lich_trinh_tour,
            ngay_dat, // Đã đổi tên từ ngay_dat_TIMESTAMP
            so_luong_khach,
            tong_tien_du_kien,
            tong_tien_thanh_toan = 0,
            trang_thai_thanh_toan = 'Chưa thanh toán',
            trang_thai_dat_tour = 'Chờ xác nhận',
            ghi_chu_dat_tour = null
        } = bookingData;

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
    },

    findAll: async ({ limit, offset, searchTerm, trangThaiDatTour, trangThaiThanhToan, tuNgay, denNgay, sortBy = 'dt.ngay_tao', order = 'DESC' }, connection = null) => {
        let selectClause = `SELECT
                                dt.id_dat_tour, dt.ngay_dat, dt.so_luong_khach, -- Sử dụng dt.ngay_dat
                                dt.tong_tien_thanh_toan, dt.trang_thai_thanh_toan, dt.trang_thai_dat_tour,
                                dt.ngay_tao, dt.ngay_cap_nhat, -- Sử dụng dt.ngay_tao, dt.ngay_cap_nhat
                                kh.ho_ten as ten_khach_hang, kh.email_lien_he as email_khach_hang,
                                spt.ten_tour, lt.ngay_khoi_hanh
                            FROM dattour dt
                            JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang
                            JOIN lichtrinhtour lt ON dt.id_lich_trinh_tour = lt.id_lich_trinh_tour
                            JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour`;
        let whereClause = " WHERE 1=1";
        const params = [];

        if (searchTerm) {
            whereClause += ` AND (CAST(dt.id_dat_tour AS CHAR) LIKE ? OR kh.ho_ten LIKE ? OR spt.ten_tour LIKE ? OR kh.email_lien_he LIKE ? OR kh.so_dien_thoai LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        if (trangThaiDatTour) {
            whereClause += ` AND dt.trang_thai_dat_tour = ?`;
            params.push(trangThaiDatTour);
        }
        if (trangThaiThanhToan) {
            whereClause += ` AND dt.trang_thai_thanh_toan = ?`;
            params.push(trangThaiThanhToan);
        }
        if (tuNgay) {
            whereClause += ` AND DATE(dt.ngay_dat) >= ?`; // Sử dụng dt.ngay_dat
            params.push(tuNgay);
        }
        if (denNgay) {
            whereClause += ` AND DATE(dt.ngay_dat) <= ?`; // Sử dụng dt.ngay_dat
            params.push(denNgay);
        }

        const allowedSortColumns = ['dt.ngay_dat', 'dt.ngay_tao', 'kh.ho_ten', 'spt.ten_tour', 'dt.tong_tien_thanh_toan', 'dt.trang_thai_dat_tour', 'dt.trang_thai_thanh_toan'];
        let validSortBy = 'dt.ngay_tao'; // Mặc định
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }

        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(dt.id_dat_tour) as totalItems FROM dattour dt JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang JOIN lichtrinhtour lt ON dt.id_lich_trinh_tour = lt.id_lich_trinh_tour JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour ${whereClause}`;
        const dataSql = `${selectClause} ${whereClause} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, parseInt(limit), parseInt(offset)];

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
        const fields = [];
        const values = [];
        const allowedFields = [
            'ngay_dat', 'so_luong_khach', 'tong_tien_du_kien', // Đã đổi tên ngay_dat
            'tong_tien_thanh_toan', 'trang_thai_thanh_toan', 'trang_thai_dat_tour', 'ghi_chu_dat_tour'
        ];

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