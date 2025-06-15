const pool = require('../config/db.config');

const ActivityTourModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (activityData, connection = null) => {
        const conn = connection || await pool.getConnection();

        try {
            const insertQuery = `
                INSERT INTO hoatdongtour (
                    id_lich_trinh_tour, 
                    ten_hoat_dong, 
                    mo_ta_chi_tiet, 
                    thoi_gian_bat_dau, 
                    thoi_gian_ket_thuc, 
                    id_dia_diem, 
                    id_dich_vu_tour
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                activityData.id_lich_trinh_tour,
                activityData.ten_hoat_dong,
                activityData.mo_ta_chi_tiet || null,
                activityData.thoi_gian_bat_dau,
                activityData.thoi_gian_ket_thuc,
                activityData.id_dia_diem || null,
                activityData.id_dich_vu_tour || null
            ];

            const [result] = await conn.query(insertQuery, params);

            if (result.insertId) {
                // Sau khi thêm xong, lấy thông tin chi tiết với JOIN đúng
                const selectQuery = `
                    SELECT 
                        ht.*,
                        dd.ten_dia_diem,
                        dvt.ten_dich_vu
                    FROM 
                        hoatdongtour ht
                        LEFT JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                        LEFT JOIN dichvutour dvt ON ht.id_dich_vu_tour = dvt.id_dich_vu_tour
                    WHERE 
                        ht.id_hoat_dong = ?
                `;

                const [activities] = await conn.query(selectQuery, [result.insertId]);

                if (!connection) {
                    conn.release();
                }
                return activities[0];
            }

            if (!connection) {
                conn.release();
            }
            throw { statusCode: 400, message: 'Không thể thêm hoạt động mới.' };
        } catch (error) {
            if (!connection) {
                conn.release();
            }
            console.error("Error in ActivityTourModel.create:", error);
            throw error;
        }
    },

    findByScheduleId: async (id_lich_trinh_tour, connection = null) => {
        const sql = `SELECT ht.*, dd.ten_dia_diem, dvt.ten_dich_vu 
                     FROM hoatdongtour ht
                     JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                     LEFT JOIN dichvutour dvt ON ht.id_dich_vu_tour = dvt.id_dich_vu_tour
                     WHERE ht.id_lich_trinh_tour = ?
                     ORDER BY ht.thoi_gian_bat_dau ASC, ht.ngay_tao ASC`;
        try {
            const [rows] = await ActivityTourModel._query(sql, [id_lich_trinh_tour], connection);
            return rows;
        } catch (error) {
            console.error("Error in ActivityTourModel.findByScheduleId:", error);
            throw error;
        }
    },

    findById: async (id_hoat_dong, connection = null) => {
        // Đảm bảo không sử dụng alias dxt hoặc bất kỳ alias không xác định nào
        const sql = `
            SELECT 
                ht.*, 
                dd.ten_dia_diem,
                dvt.ten_dich_vu
            FROM 
                hoatdongtour ht
                LEFT JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                LEFT JOIN dichvutour dvt ON ht.id_dich_vu_tour = dvt.id_dich_vu_tour
            WHERE 
                ht.id_hoat_dong = ?
        `;
        try {
            const [rows] = await ActivityTourModel._query(sql, [id_hoat_dong], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in ActivityTourModel.findById:", error);
            throw error;
        }
    },

    update: async (id_hoat_dong, activityData, connection = null) => {
        // Code cũ giữ nguyên cho đến dòng UPDATE
        const fields = [];
        const values = [];
        const allowedFields = [
            'id_dia_diem', 'id_dich_vu_tour', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc',
            'ten_hoat_dong', 'mo_ta_chi_tiet'
            // id_lich_trinh_tour typically shouldn't be updated.
        ];

        Object.keys(activityData).forEach(key => {
            if (allowedFields.includes(key) && activityData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(activityData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_hoat_dong);
        const sql = `UPDATE hoatdongtour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_hoat_dong = ?`;

        try {
            const [result] = await ActivityTourModel._query(sql, values, connection);

            // Sau khi cập nhật thành công, trả về thông tin chi tiết đã được cập nhật
            if (result.affectedRows > 0) {
                // Đảm bảo sử dụng JOIN đúng cách
                const selectQuery = `
                    SELECT 
                        ht.*,
                        dd.ten_dia_diem,
                        dvt.ten_dich_vu
                    FROM 
                        hoatdongtour ht
                        LEFT JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                        LEFT JOIN dichvutour dvt ON ht.id_dich_vu_tour = dvt.id_dich_vu_tour
                    WHERE 
                        ht.id_hoat_dong = ?
                `;

                const [activities] = await ActivityTourModel._query(selectQuery, [id_hoat_dong], connection);
                return {
                    affectedRows: result.affectedRows,
                    activity: activities[0] || null
                };
            }

            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ActivityTourModel.update for id ${id_hoat_dong}:`, error);
            throw error;
        }
    },

    delete: async (id_hoat_dong, connection = null) => {
        const sql = "DELETE FROM hoatdongtour WHERE id_hoat_dong = ?";
        try {
            const [result] = await ActivityTourModel._query(sql, [id_hoat_dong], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ActivityTourModel.delete for id ${id_hoat_dong}:`, error);
            throw error;
        }
    },

    deleteByScheduleId: async (id_lich_trinh_tour, connection = null) => {
        const sql = "DELETE FROM hoatdongtour WHERE id_lich_trinh_tour = ?";
        try {
            const [result] = await ActivityTourModel._query(sql, [id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ActivityTourModel.deleteByScheduleId for schedule id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    },

    findAll: async ({ id_lich_trinh_tour, limit = 10, offset = 0, sortBy = 'thoi_gian_bat_dau', order = 'ASC' }) => {
        // Đảm bảo giá trị số hợp lệ
        limit = parseInt(limit) || 10;
        offset = parseInt(offset) || 0;

        let whereClause = '';
        const params = [];

        if (id_lich_trinh_tour) {
            whereClause = ' WHERE id_lich_trinh_tour = ?';
            params.push(id_lich_trinh_tour);
        }

        // Đảm bảo tên cột hợp lệ để tránh SQL injection
        const allowedSortColumns = ['id_hoat_dong', 'id_lich_trinh_tour', 'ten_hoat_dong', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'ngay_tao'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'thoi_gian_bat_dau';

        // Đảm bảo order hợp lệ
        const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const countQuery = `SELECT COUNT(*) as total FROM hoatdongtour${whereClause}`;
        const selectQuery = `
            SELECT 
                ht.*, 
                dd.ten_dia_diem,
                dvt.ten_dich_vu
            FROM 
                hoatdongtour ht
                LEFT JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                LEFT JOIN dichvutour dvt ON ht.id_dich_vu_tour = dvt.id_dich_vu_tour
            ${whereClause}
            ORDER BY ht.${validSortBy} ${validOrder}
            LIMIT ? OFFSET ?
        `;

        try {
            const [countResult] = await ActivityTourModel._query(countQuery, params);
            const [activities] = await ActivityTourModel._query(
                selectQuery,
                [...params, parseInt(limit), parseInt(offset)]
            );

            return {
                activities,
                totalItems: countResult[0]?.total || 0
            };
        } catch (error) {
            console.error("Error in ActivityTourModel.findAll:", error);
            throw error;
        }
    }
};

module.exports = ActivityTourModel;