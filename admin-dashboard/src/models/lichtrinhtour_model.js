const pool = require('../config/db.config');
const { formatDateForDb } = require('../utils/date_utils'); // Giả sử bạn có hàm này

const TourScheduleModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    // ENUM values for trang_thai_lich_trinh
    STATUSES: ['Sắp mở bán', 'Đang mở bán', 'Hết chỗ', 'Đã khởi hành', 'Đã kết thúc', 'Đã hủy'],

    create: async (scheduleData, connection = null) => {
        const {
            id_san_pham_tour,
            ngay_khoi_hanh,
            ngay_ket_thuc,
            gia_tien,
            so_luong_cho_toi_da,
            so_luong_cho_da_dat = 0,
            trang_thai_lich_trinh = TourScheduleModel.STATUSES[0] // Default to 'Sắp mở bán'
        } = scheduleData;

        const formattedNgayKhoiHanh = formatDateForDb(ngay_khoi_hanh);
        const formattedNgayKetThuc = formatDateForDb(ngay_ket_thuc);

        const sql = `INSERT INTO lichtrinhtour
                        (id_san_pham_tour, ngay_khoi_hanh, ngay_ket_thuc, gia_tien, so_luong_cho_toi_da, so_luong_cho_da_dat, trang_thai_lich_trinh, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await TourScheduleModel._query(sql, [
                id_san_pham_tour, formattedNgayKhoiHanh, formattedNgayKetThuc, gia_tien, so_luong_cho_toi_da, so_luong_cho_da_dat, trang_thai_lich_trinh
            ], connection);
            return { id_lich_trinh_tour: result.insertId, ...scheduleData, ngay_khoi_hanh: formattedNgayKhoiHanh, ngay_ket_thuc: formattedNgayKetThuc };
        } catch (error) {
            console.error("Error in TourScheduleModel.create:", error);
            throw error;
        }
    },

    findAllBySanPhamTourId: async (id_san_pham_tour, { sortBy = 'ngay_khoi_hanh', order = 'ASC' }, connection = null) => {
        const allowedSortColumns = [
            'id_lich_trinh_tour', 'ngay_khoi_hanh', 'ngay_ket_thuc',
            'gia_tien', 'trang_thai_lich_trinh', 'ngay_tao', 'so_luong_cho_toi_da', 'so_luong_cho_da_dat'
        ];
        let validSortBy = 'ngay_khoi_hanh';
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }
        const sortOrder = (order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

        const sql = `SELECT * FROM lichtrinhtour
                     WHERE id_san_pham_tour = ?
                     ORDER BY ${pool.escapeId(validSortBy)} ${sortOrder}`;
        try {
            const [rows] = await TourScheduleModel._query(sql, [id_san_pham_tour], connection);
            return rows;
        } catch (error) {
            console.error("Error in TourScheduleModel.findAllBySanPhamTourId:", error);
            throw error;
        }
    },

    findById: async (id_lich_trinh_tour, connection = null) => {
        // Thay đổi query để JOIN bảng sanphamtour
        const sql = `
            SELECT lt.*, 
                   spt.id_san_pham_tour, 
                   spt.ten_tour, 
                   spt.thoi_gian_du_kien,
                   spt.url_anh_bia,
                   spt.mo_ta_chi_tiet
            FROM lichtrinhtour lt
            LEFT JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour
            WHERE lt.id_lich_trinh_tour = ?`;

        try {
            const [rows] = await TourScheduleModel._query(sql, [id_lich_trinh_tour], connection);
            if (rows.length === 0) return null;

            // Restructure để có đúng format
            const schedule = { ...rows[0] };
            const sanphamtour = {
                id_san_pham_tour: rows[0].id_san_pham_tour,
                ten_tour: rows[0].ten_tour,
                thoi_gian_du_kien: rows[0].thoi_gian_du_kien,
                url_anh_bia: rows[0].url_anh_bia,
                mo_ta_chi_tiet: rows[0].mo_ta_chi_tiet
            };

            // Xóa các field trùng
            delete schedule.ten_tour;
            delete schedule.thoi_gian_du_kien;
            delete schedule.url_anh_bia;
            delete schedule.mo_ta_chi_tiet;

            // Gán sanphamtour vào schedule
            schedule.sanphamtour = sanphamtour;

            return schedule;
        } catch (error) {
            console.error("Error in TourScheduleModel.findById:", error);
            throw error;
        }
    },

    update: async (id_lich_trinh_tour, scheduleData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = ['ngay_khoi_hanh', 'ngay_ket_thuc', 'gia_tien', 'so_luong_cho_toi_da', 'so_luong_cho_da_dat', 'trang_thai_lich_trinh'];

        Object.keys(scheduleData).forEach(key => {
            if (allowedFields.includes(key) && scheduleData[key] !== undefined) {
                fields.push(`${key} = ?`);
                if ((key === 'ngay_khoi_hanh' || key === 'ngay_ket_thuc') && scheduleData[key]) {
                    values.push(formatDateForDb(scheduleData[key]));
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
        // Service layer sẽ chịu trách nhiệm xóa các dịch vụ (dichvutour) và hoạt động (hoatdongtour) liên quan
        // cũng như kiểm tra các booking trước khi xóa lịch trình này.
        const checkBookingSql = "SELECT COUNT(*) as bookingCount FROM dattour WHERE id_lich_trinh_tour = ?";
        try {
            const [bookingRows] = await TourScheduleModel._query(checkBookingSql, [id_lich_trinh_tour], connection);
            if (bookingRows[0].bookingCount > 0) {
                throw { statusCode: 400, message: `Không thể xóa lịch khởi hành này vì đã có ${bookingRows[0].bookingCount} đơn đặt tour liên quan. Bạn có thể cân nhắc hủy lịch trình.` };
            }

            // Service layer should handle deletion of dichvutour and hoatdongtour records associated with this schedule ID
            // Example:
            // await ServiceTourModel.deleteByScheduleId(id_lich_trinh_tour, connection);
            // await ActivityTourModel.deleteByScheduleId(id_lich_trinh_tour, connection);

            const sql = "DELETE FROM lichtrinhtour WHERE id_lich_trinh_tour = ?";
            const [result] = await TourScheduleModel._query(sql, [id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.delete for id ${id_lich_trinh_tour}:`, error);
            if (error.statusCode) throw error;
            throw new Error(`Database error during tour schedule deletion: ${error.message}`);
        }
    },

    deleteBySanPhamTourId: async (id_san_pham_tour, connection = null) => {
        // Called by TourService when deleting a tour product.
        // Assumes related bookings, services, activities for these schedules are handled/checked by TourService.
        const sql = "DELETE FROM lichtrinhtour WHERE id_san_pham_tour = ?";
        try {
            const [result] = await TourScheduleModel._query(sql, [id_san_pham_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.deleteBySanPhamTourId for tour id ${id_san_pham_tour}:`, error);
            throw error;
        }
    },

    updateBookedSlots: async (id_lich_trinh_tour, changeAmount, connection = null) => {
        try {
            // Trước khi cập nhật, kiểm tra để đảm bảo số lượng không âm
            const [currentData] = await TourScheduleModel._query(
                'SELECT so_luong_cho_da_dat, gioi_han_khach FROM lichtrinhtour WHERE id_lich_trinh_tour = ?',
                [id_lich_trinh_tour],
                connection
            );

            if (!currentData || currentData.length === 0) {
                throw new Error(`Không tìm thấy lịch trình tour với ID ${id_lich_trinh_tour}`);
            }

            const currentBookedSlots = currentData[0].so_luong_cho_da_dat;
            const maxSlots = currentData[0].gioi_han_khach;
            const newBookedSlots = currentBookedSlots + changeAmount;

            // Kiểm tra trước để tránh vi phạm constraint
            if (newBookedSlots < 0) {
                console.warn(`Cảnh báo: Không thể giảm số chỗ đã đặt xuống dưới 0. ID lịch trình: ${id_lich_trinh_tour}`);
                // Đặt lại thành 0 thay vì số âm
                const sql = `UPDATE lichtrinhtour
                         SET so_luong_cho_da_dat = 0, ngay_cap_nhat = NOW()
                         WHERE id_lich_trinh_tour = ?`;
                const [result] = await TourScheduleModel._query(sql, [id_lich_trinh_tour], connection);
                return { affectedRows: result.affectedRows };
            }

            if (newBookedSlots > maxSlots) {
                console.warn(`Cảnh báo: Không thể tăng số chỗ đã đặt vượt quá ${maxSlots}. ID lịch trình: ${id_lich_trinh_tour}`);
                throw new Error(`Số lượng đặt vượt quá giới hạn cho phép (${maxSlots}).`);
            }

            // Nếu không vi phạm constraint, tiến hành cập nhật
            const sql = `UPDATE lichtrinhtour
                         SET so_luong_cho_da_dat = so_luong_cho_da_dat + ?, ngay_cap_nhat = NOW()
                         WHERE id_lich_trinh_tour = ?`;
            const [result] = await TourScheduleModel._query(sql, [changeAmount, id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourScheduleModel.updateBookedSlots for id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset = 0, searchTerm = '', sortBy = 'ngay_khoi_hanh', order = 'ASC' }) => {
        let whereClause = '';
        const params = [];

        if (searchTerm) {
            whereClause = ` WHERE
                ltt.id_lich_trinh_tour LIKE ? OR
                spt.ten_tour LIKE ?`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Đảm bảo tên cột hợp lệ để tránh SQL injection
        const allowedSortColumns = [
            'ngay_khoi_hanh', 'ngay_ket_thuc', 'gia_tien', 'so_luong_cho_toi_da', 'so_luong_cho_da_dat'
        ];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'ngay_khoi_hanh';
        const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const countQuery = `
            SELECT COUNT(*) as total
            FROM lichtrinhtour ltt
            JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
            ${whereClause}`;

        const selectQuery = `
            SELECT 
                ltt.*,
                spt.ten_tour
            FROM lichtrinhtour ltt
            LEFT JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
            ${whereClause}
            ORDER BY ltt.${validSortBy} ${validOrder}
            LIMIT ? OFFSET ?`;

        try {
            const [countRows] = await TourScheduleModel._query(countQuery, params);
            const [schedules] = await TourScheduleModel._query(
                selectQuery,
                [...params, parseInt(limit), parseInt(offset)]
            );

            return {
                schedules,
                totalItems: countRows[0]?.total || 0
            };
        } catch (error) {
            console.error("Error in TourScheduleModel.findAll:", error);
            throw error;
        }
    }
};

module.exports = TourScheduleModel;