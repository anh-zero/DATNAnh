const pool = require('../config/db.config');

const TourModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (tourData, connection = null) => {
        const conn = connection || await pool.getConnection();
        const useLocalConnection = !connection;

        try {
            if (useLocalConnection) await conn.beginTransaction();

            // Trích xuất các giá trị từ tourData
            const {
                ten_tour,
                mo_ta_chi_tiet = null,
                thoi_gian_du_kien = null,
                url_anh_bia = null
            } = tourData;

            // Kiểm tra xem cột ghi_chu có tồn tại không
            const [columns] = await TourModel._query(
                "SHOW COLUMNS FROM sanphamtour LIKE 'ghi_chu'",
                [],
                conn
            );
            const includeGhiChu = columns && columns.length > 0;

            // Tạo câu SQL động dựa trên sự tồn tại của cột ghi_chu
            let sql, params;

            if (includeGhiChu) {
                sql = `INSERT INTO sanphamtour
                    (ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia, ghi_chu, ngay_tao, ngay_cap_nhat)
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
                params = [ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia, tourData.ghi_chu || null];
            } else {
                sql = `INSERT INTO sanphamtour
                    (ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia, ngay_tao, ngay_cap_nhat)
                    VALUES (?, ?, ?, ?, NOW(), NOW())`;
                params = [ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien, url_anh_bia];
            }

            const [result] = await TourModel._query(sql, params, conn);

            if (useLocalConnection) await conn.commit();

            return { id_san_pham_tour: result.insertId, ...tourData };
        } catch (error) {
            if (useLocalConnection) await conn.rollback();
            console.error("Error in TourModel.create:", error);
            throw error;
        } finally {
            if (useLocalConnection) conn.release();
        }
    },

    findAll: async (options = {}) => {
        const { limit = 10, offset = 0, searchTerm = '', sortBy = 'ngay_tao', order = 'DESC' } = options;

        // Define conditions and params
        let whereClause = 'WHERE 1=1 ';
        const params = [];

        if (searchTerm) {
            whereClause += 'AND (ten_tour LIKE ? OR mo_ta_chi_tiet LIKE ?) ';
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        try {
            // First, check if ghi_chu column exists
            const [columns] = await TourModel._query(
                "SHOW COLUMNS FROM sanphamtour LIKE 'ghi_chu'"
            );

            const includeGhiChu = columns && columns.length > 0;

            const selectQuery = `
                SELECT
                    id_san_pham_tour,
                    ten_tour,
                    mo_ta_chi_tiet,
                    thoi_gian_du_kien,
                    url_anh_bia,
                    ${includeGhiChu ? 'ghi_chu,' : ''}
                    ngay_tao,
                    ngay_cap_nhat,
                    (SELECT COUNT(*) FROM lichtrinhtour WHERE lichtrinhtour.id_san_pham_tour = sanphamtour.id_san_pham_tour) AS schedule_count
                FROM sanphamtour ${whereClause}
                ORDER BY \`${sortBy}\` ${order}
                LIMIT ? OFFSET ?`;

            console.log("SQL Query:", selectQuery);
            console.log("SQL Params:", [...params, parseInt(limit), parseInt(offset)]);

            const [results] = await TourModel._query(
                selectQuery,
                [...params, parseInt(limit), parseInt(offset)]
            );
            return results || [];
        } catch (error) {
            console.error("Error in TourModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_san_pham_tour, connection = null) => {
        const sql = `SELECT *, 
                        (SELECT COUNT(*) FROM lichtrinhtour WHERE lichtrinhtour.id_san_pham_tour = sanphamtour.id_san_pham_tour) AS schedule_count
                     FROM sanphamtour
                     WHERE id_san_pham_tour = ?`;
        try {
            const [rows] = await TourModel._query(sql, [id_san_pham_tour], connection);
            // The SELECT * should already include ghi_chu if the column exists
            return rows[0];
        } catch (error) {
            console.error("Error in TourModel.findById:", error);
            throw error;
        }
    },

    update: async (id_san_pham_tour, tourData, connection = null) => {
        const fields = [];
        const values = [];
        // Added 'ghi_chu' to allowedFields
        const allowedFields = ['ten_tour', 'mo_ta_chi_tiet', 'thoi_gian_du_kien', 'url_anh_bia', 'ghi_chu'];

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
        // Service layer sẽ chịu trách nhiệm xóa các thực thể con (schedules, services, activities) trong một transaction.
        // Model này chỉ xóa chính sản phẩm tour.
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
        const totalToursSql = "SELECT COUNT(*) as total_san_pham_tours FROM sanphamtour";
        try {
            const [[totalResult]] = await TourModel._query(totalToursSql, [], connection);
            return {
                total_san_pham_tours: totalResult.total_san_pham_tours,
            };
        } catch (error) {
            console.error("Error in TourModel.getStatistics:", error);
            throw error;
        }
    }
};

module.exports = TourModel;