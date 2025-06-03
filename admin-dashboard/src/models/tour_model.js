const pool = require('../config/db.config');

const TourModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (tourData, connection = null) => {
        const {
            ten_tour,
            mo_ta_chi_tiet = null,
            thoi_gian_du_kien = null,
            url_anh_bia = null
            // Không có id_nguoi_tao theo EER mới nhất
        } = tourData;

        const sql = `INSERT INTO sanphamtour
                        (ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await TourModel._query(sql, [
                ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia
            ], connection);
            return { id_san_pham_tour: result.insertId, ...tourData };
        } catch (error) {
            console.error("Error in TourModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit, offset, searchTerm, sortBy = 'ngay_tao', order = 'DESC' }, connection = null) => {
        let baseSql = `FROM sanphamtour WHERE 1=1`;
        const params = [];

        if (searchTerm) {
            // Tìm kiếm trong ten_tour và mo_ta_chi_tiet
            baseSql += ` AND (ten_tour LIKE ? OR mo_ta_chi_tiet LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        const allowedSortColumns = ['ten_tour', 'ngay_tao', 'thoi_gian_du_kien'];
        let validSortBy = 'ngay_tao';
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }

        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(*) as totalItems ${baseSql}`;
        const dataSql = `SELECT id_san_pham_tour, ten_tour, thoi_gian_du_kien, url_anh_bia, ngay_tao, ngay_cap_nhat
                         ${baseSql} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, parseInt(limit), parseInt(offset)];

        try {
            const [countRows] = await TourModel._query(countSql, params, connection);
            const [rows] = await TourModel._query(dataSql, dataParams, connection);
            return { tours: rows, totalItems: countRows[0].totalItems };
        } catch (error) {
            console.error("Error in TourModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_san_pham_tour, connection = null) => {
        const sql = `SELECT * FROM sanphamtour WHERE id_san_pham_tour = ?`;
        try {
            const [rows] = await TourModel._query(sql, [id_san_pham_tour], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in TourModel.findById:", error);
            throw error;
        }
    },

    update: async (id_san_pham_tour, tourData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = ['ten_tour', 'mo_ta_chi_tiet', 'thoi_gian_du_kien', 'url_anh_bia'];

        Object.keys(tourData).forEach(key => {
            if (allowedFields.includes(key) && tourData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(tourData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_san_pham_tour);
        const sql = `UPDATE sanphamtour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_san_pham_tour = ?`;

        try {
            const [result] = await TourModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourModel.update for id ${id_san_pham_tour}:`, error);
            throw error;
        }
    },

    delete: async (id_san_pham_tour, connection = null) => {
        // Trước khi xóa, service sẽ cần kiểm tra các ràng buộc (ví dụ: lichtrinhtour, sanphamtour_doitac)
        // và thực hiện xóa các bản ghi liên quan trong một transaction.
        const sql = "DELETE FROM sanphamtour WHERE id_san_pham_tour = ?";
        try {
            const [result] = await TourModel._query(sql, [id_san_pham_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourModel.delete for id ${id_san_pham_tour}:`, error);
            throw error;
        }
    },

    getStatistics: async (connection = null) => {
        // Thống kê này có thể cần join với lichtrinhtour và dattour để có ý nghĩa hơn
        // Hiện tại, chỉ đếm tổng số sản phẩm tour
        const totalToursSql = "SELECT COUNT(*) as total_san_pham_tours FROM sanphamtour";
        // Ví dụ: Thêm trạng thái cho sanphamtour (nếu có) để đếm tour đang hoạt động
        // const activeToursSql = "SELECT COUNT(*) as active_tours FROM sanphamtour WHERE trang_thai_sp_tour = 'active'";

        try {
            const [[totalResult]] = await TourModel._query(totalToursSql, [], connection);
            // const [[activeResult]] = await TourModel._query(activeToursSql, [], connection);
            return {
                total_san_pham_tours: totalResult.total_san_pham_tours,
                // active_tours: activeResult.active_tours,
                // Các thống kê khác sẽ phức tạp hơn và cần join bảng
            };
        } catch (error) {
            console.error("Error in TourModel.getStatistics:", error);
            throw error;
        }
    }
};
module.exports = TourModel;