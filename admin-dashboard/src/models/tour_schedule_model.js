const pool = require('../config/db.config');

const TourScheduleModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (scheduleData, connection = null) => {
        const {
            id_san_pham_tour,
            ngay_khoi_hanh,
            ngay_ket_thuc,
            gia_tien,
            so_luong_cho_toi_da,
            so_luong_cho_da_dat = 0, // Mặc định khi mới tạo
            trang_thai_lich_trinh = 'Sắp mở bán' // Mặc định
        } = scheduleData;

        // Format dates to YYYY-MM-DD for MySQL DATE type
        const formattedNgayKhoiHanh = new Date(ngay_khoi_hanh).toISOString().slice(0, 10);
        const formattedNgayKetThuc = new Date(ngay_ket_thuc).toISOString().slice(0, 10);

        const sql = `INSERT INTO lichtrinhtour
                        (id_san_pham_tour, ngay_khoi_hanh, ngay_ket_thuc, gia_tien, so_luong_cho_toi_da, so_luong_cho_da_dat, trang_thai_lich_trinh, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await TourScheduleModel._query(sql, [
                id_san_pham_tour, formattedNgayKhoiHanh, formattedNgayKetThuc, gia_tien,
                so_luong_cho_toi_da, so_luong_cho_da_dat, trang_thai_lich_trinh
            ], connection);
            return { id_lich_trinh_tour: result.insertId, ...scheduleData, ngay_khoi_hanh: formattedNgayKhoiHanh, ngay_ket_thuc: formattedNgayKetThuc };
        } catch (error) {
            console.error("Error in TourScheduleModel.create:", error);
            throw error;
        }
    },

    findAllBySanPhamTourId: async (id_san_pham_tour, { sortBy = 'ngay_khoi_hanh', order = 'ASC' }, connection = null) => {
        // Không phân trang ở đây, thường danh sách lịch trình của 1 tour không quá nhiều
        // Nếu cần phân trang, thêm limit/offset
        const allowedSortColumns = ['ngay_khoi_hanh', 'gia_tien', 'trang_thai_lich_trinh', 'ngay_tao'];
        let validSortBy = 'ngay_khoi_hanh';
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }
        const sortOrder = (order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

        const sql = `SELECT * FROM lichtrinhtour
                     WHERE id_san_pham_tour = ?
                     ORDER BY ${validSortBy} ${sortOrder}`;
        try {
            const [rows] = await TourScheduleModel._query(sql, [id_san_pham_tour], connection);
            return rows;
        } catch (error) {
            console.error("Error in TourScheduleModel.findAllBySanPhamTourId:", error);
            throw error;
        }
    },

    findById: async (id_lich_trinh_tour, connection = null) => {
        const sql = `SELECT * FROM lichtrinhtour WHERE id_lich_trinh_tour = ?`;
        try {
            const [rows] = await TourScheduleModel._query(sql, [id_lich_trinh_tour], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in TourScheduleModel.findById:", error);
            throw error;
        }
    },

    update: async (id_lich_trinh_tour, scheduleData, connection = null) => {
        const fields = [];
        const values = [];
        // Các trường cho phép cập nhật
        const allowedFields = ['ngay_khoi_hanh', 'ngay_ket_thuc', 'gia_tien', 'so_luong_cho_toi_da', 'so_luong_cho_da_dat', 'trang_thai_lich_trinh'];

        Object.keys(scheduleData).forEach(key => {
            if (allowedFields.includes(key) && scheduleData[key] !== undefined) {
                fields.push(`${key} = ?`);
                if (key === 'ngay_khoi_hanh' || key === 'ngay_ket_thuc') {
                    values.push(new Date(scheduleData[key]).toISOString().slice(0, 10));
                } else {
                    values.push(scheduleData[key]);
                }
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_lich_trinh_tour);
        const sql = `UPDATE lichtrinhtour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_lich_trinh_tour = ?`;

        try {
            const [result] = await TourScheduleModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.update for id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    },

    delete: async (id_lich_trinh_tour, connection = null) => {
        // Cần kiểm tra xem lịch trình này có booking nào không trước khi xóa
        // Hoặc chỉ cho phép cập nhật trạng thái thành 'Đã hủy'
        const checkBookingSql = "SELECT COUNT(*) as bookingCount FROM dattour WHERE id_lich_trinh_tour = ?";
         try {
            const [bookingRows] = await TourScheduleModel._query(checkBookingSql, [id_lich_trinh_tour], connection);
            if (bookingRows[0].bookingCount > 0) {
                // Thay vì xóa, có thể cập nhật trạng thái
                // Hoặc throw lỗi nếu chính sách là không cho xóa khi có booking
                // return TourScheduleModel.update(id_lich_trinh_tour, { trang_thai_lich_trinh: 'Đã hủy' }, connection);
                throw { statusCode: 400, message: `Không thể xóa lịch khởi hành này vì đã có ${bookingRows[0].bookingCount} đơn đặt tour liên quan. Bạn có thể cân nhắc hủy lịch trình.` };
            }

            const sql = "DELETE FROM lichtrinhtour WHERE id_lich_trinh_tour = ?";
            const [result] = await TourScheduleModel._query(sql, [id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.delete for id ${id_lich_trinh_tour}:`, error);
            if (error.statusCode) throw error;
            throw new Error(`Database error during tour schedule deletion: ${error.message}`);
        }
    },

    // Hàm này có thể cần thiết khi xóa sản phẩm tour
    deleteBySanPhamTourId: async (id_san_pham_tour, connection = null) => {
        // CẢNH BÁO: Hàm này sẽ xóa TẤT CẢ lịch trình của một tour.
        // Cần kiểm tra booking cho từng lịch trình trước khi xóa hàng loạt.
        // Hoặc, logic này nên được xử lý cẩn thận ở tầng service.
        // Ví dụ đơn giản:
        const sql = "DELETE FROM lichtrinhtour WHERE id_san_pham_tour = ?";
        try {
            const [result] = await TourScheduleModel._query(sql, [id_san_pham_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.deleteBySanPhamTourId for tour id ${id_san_pham_tour}:`, error);
            throw error;
        }
    },

    updateBookedSlots: async (id_lich_trinh_tour, quantityChange, connection = null) => {
        // quantityChange có thể là số dương (khi có booking mới) hoặc số âm (khi hủy booking)
        const sql = `UPDATE lichtrinhtour
                     SET so_luong_cho_da_dat = so_luong_cho_da_dat + ?, ngay_cap_nhat = NOW()
                     WHERE id_lich_trinh_tour = ?`;
        try {
            const [result] = await TourScheduleModel._query(sql, [quantityChange, id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.updateBookedSlots for id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    }
};
module.exports = TourScheduleModel;