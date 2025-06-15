const pool = require('../config/db.config');

const ServiceTourModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (serviceData, connection = null) => {
        try {
            // Xóa id_dia_diem nếu có
            if (serviceData.id_dia_diem) {
                delete serviceData.id_dia_diem;
            }
            
            const sql = `
                INSERT INTO dichvutour (
                    id_lich_trinh_tour, 
                    id_doi_tac, 
                    ten_dich_vu, 
                    loai_dich_vu, 
                    ghi_chu, 
                    gia_nhap, 
                    so_luong, 
                    don_vi_tinh, 
                    thoi_gian_bat_dau, 
                    thoi_gian_ket_thuc
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                serviceData.id_lich_trinh_tour,
                serviceData.id_doi_tac,
                serviceData.ten_dich_vu,
                serviceData.loai_dich_vu || null,
                serviceData.ghi_chu || null,
                serviceData.gia_nhap || null,
                serviceData.so_luong || null,
                serviceData.don_vi_tinh || null,
                serviceData.thoi_gian_bat_dau || null,
                serviceData.thoi_gian_ket_thuc || null
            ];
            
            const [result] = await ServiceTourModel._query(sql, values, connection);
            const id = result.insertId;
            
            return { id_dich_vu_tour: id, ...serviceData };
        } catch (error) {
            console.error("Error in ServiceTourModel.create:", error);
            throw error;
        }
    },

    findByScheduleId: async (id_lich_trinh_tour, connection = null) => {
        try {
            const sql = `
                SELECT dvt.*, dt.ten_doi_tac
                FROM dichvutour dvt
                LEFT JOIN doitac dt ON dvt.id_doi_tac = dt.id_doi_tac
                WHERE dvt.id_lich_trinh_tour = ?
                ORDER BY dvt.ngay_tao DESC
            `;
            const [rows] = await ServiceTourModel._query(sql, [id_lich_trinh_tour], connection);
            return rows;
        } catch (error) {
            console.error(`Error in ServiceTourModel.findByScheduleId for schedule id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    },

    findById: async (id_dich_vu_tour, connection = null) => {
        try {
            const sql = `
                SELECT dvt.*, dt.ten_doi_tac
                FROM dichvutour dvt
                LEFT JOIN doitac dt ON dvt.id_doi_tac = dt.id_doi_tac
                WHERE dvt.id_dich_vu_tour = ?
            `;
            const [rows] = await ServiceTourModel._query(sql, [id_dich_vu_tour], connection);
            if (rows.length === 0) {
                return null;
            }
            return rows[0];
        } catch (error) {
            console.error(`Error in ServiceTourModel.findById for ID ${id_dich_vu_tour}:`, error);
            throw error;
        }
    },

    update: async (id_dich_vu_tour, serviceData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = [
            'id_doi_tac', 'id_dia_diem', 'ten_dich_vu', 'loai_dich_vu', 'ghi_chu',
            'gia_nhap', 'so_luong', 'don_vi_tinh', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc'
            // id_lich_trinh_tour typically shouldn't be updated this way, rather re-create if schedule changes.
        ];

        Object.keys(serviceData).forEach(key => {
            if (allowedFields.includes(key) && serviceData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(serviceData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_dich_vu_tour);
        const sql = `UPDATE dichvutour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_dich_vu_tour = ?`;

        try {
            const [result] = await ServiceTourModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ServiceTourModel.update for id ${id_dich_vu_tour}:`, error);
            throw error;
        }
    },

    delete: async (id_dich_vu_tour, connection = null) => {
        // Check if this service is linked to any hoatdongtour
        const checkActivitySql = "SELECT COUNT(*) as count FROM hoatdongtour WHERE id_dich_vu_tour = ?";
        try {
            const [activityRows] = await ServiceTourModel._query(checkActivitySql, [id_dich_vu_tour], connection);
            if (activityRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa dịch vụ này vì đang được liên kết với ${activityRows[0].count} hoạt động tour.` };
            }

            const sql = "DELETE FROM dichvutour WHERE id_dich_vu_tour = ?";
            const [result] = await ServiceTourModel._query(sql, [id_dich_vu_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ServiceTourModel.delete for id ${id_dich_vu_tour}:`, error);
            if (error.statusCode) throw error;
            throw new Error(`Database error during tour service deletion: ${error.message}`);
        }
    },

    deleteByScheduleId: async (id_lich_trinh_tour, connection = null) => {
        // This is a bulk delete, ensure activities linked to these services are handled or this is intended.
        // For simplicity, this example doesn't re-check activities for each service being deleted in bulk.
        // Proper handling might involve iterating and calling individual delete, or a more complex SQL.
        const sql = "DELETE FROM dichvutour WHERE id_lich_trinh_tour = ?";
        try {
            const [result] = await ServiceTourModel._query(sql, [id_lich_trinh_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in ServiceTourModel.deleteByScheduleId for schedule id ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset = 0, searchTerm = '' }, connection = null) => {
        try {
            // Query to get paginated services
            const searchPattern = `%${searchTerm}%`;
            
            const servicesSql = `
                SELECT dvt.*, dt.ten_doi_tac 
                FROM dichvutour dvt
                LEFT JOIN doitac dt ON dvt.id_doi_tac = dt.id_doi_tac
                WHERE 
                    (dvt.ten_dich_vu LIKE ? OR 
                    dvt.loai_dich_vu LIKE ? OR
                    dt.ten_doi_tac LIKE ?)
                ORDER BY dvt.ngay_tao DESC
                LIMIT ? OFFSET ?
            `;
            
            // Pass parameters in correct order
            const serviceParams = [searchPattern, searchPattern, searchPattern, limit, offset];
            const [services] = await ServiceTourModel._query(servicesSql, serviceParams, connection);
            
            // Query to count total records for pagination
            const countSql = `
                SELECT COUNT(*) as total 
                FROM dichvutour dvt 
                LEFT JOIN doitac dt ON dvt.id_doi_tac = dt.id_doi_tac
                WHERE 
                    (dvt.ten_dich_vu LIKE ? OR 
                    dvt.loai_dich_vu LIKE ? OR
                    dt.ten_doi_tac LIKE ?)
            `;
            
            const countParams = [searchPattern, searchPattern, searchPattern];
            const [totalResult] = await ServiceTourModel._query(countSql, countParams, connection);
            
            return {
                services,
                totalCount: totalResult[0].total
            };
        } catch (error) {
            console.error("Error in ServiceTourModel.findAll:", error);
            throw error;
        }
    },
};

module.exports = ServiceTourModel;