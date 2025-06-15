const pool = require('../config/db.config');

const LocationModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    TYPES: ['Điểm tham quan', 'Thành phố', 'Khách sạn', 'Nhà hàng', 'Sân bay', 'Khác'], // ENUM values

    create: async (locationData, connection = null) => {
        const {
            ten_dia_diem,
            mo_ta = null,
            dia_chi = null,
            thanh_pho = null,
            quoc_gia = null,
            loai_dia_diem = LocationModel.TYPES[5], // Default to 'Khác'
            kinh_do = null,
            vi_do = null
        } = locationData;

        if (loai_dia_diem && !LocationModel.TYPES.includes(loai_dia_diem)) {
            throw new Error(`Loại địa điểm không hợp lệ: ${loai_dia_diem}.`);
        }

        const sql = `INSERT INTO diadiem
                        (ten_dia_diem, mo_ta, dia_chi, thanh_pho, quoc_gia, loai_dia_diem, kinh_do, vi_do, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await LocationModel._query(sql, [
                ten_dia_diem, mo_ta, dia_chi, thanh_pho, quoc_gia, loai_dia_diem, kinh_do, vi_do
            ], connection);
            return { id_dia_diem: result.insertId, ...locationData };
        } catch (error) {
            console.error("Error in LocationModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset = 0, page, searchTerm, sortBy = 'ngay_tao', order = 'DESC' }, connection = null) => {
        // Đảm bảo limit và offset là số nguyên hợp lệ
        const safeLimit = parseInt(limit) || 10; // Default 10 nếu parse thất bại
        let safeOffset = 0;

        if (offset !== undefined) {
            safeOffset = parseInt(offset) || 0;
        } else if (page !== undefined) {
            safeOffset = (parseInt(page) - 1) * safeLimit || 0;
        }

        // Đảm bảo các giá trị không thể là NULL khi truyền vào SQL
        const sqlQuery = `
            SELECT * FROM diadiem 
            WHERE ten_dia_diem LIKE ? 
            ORDER BY ${sortBy} ${order} 
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) as totalItems FROM diadiem
            WHERE ten_dia_diem LIKE ?
        `;

        const searchParam = searchTerm ? `%${searchTerm}%` : '%';

        try {
            const [rows] = await LocationModel._query(sqlQuery, [searchParam, safeLimit, safeOffset], connection);
            const [countResult] = await LocationModel._query(countQuery, [searchParam], connection);

            return {
                locations: rows,
                totalItems: countResult[0].totalItems
            };
        } catch (error) {
            console.error('Error in LocationModel.findAll:', error);
            throw error;
        }
    },

    findById: async (id_dia_diem, connection = null) => {
        const sql = `SELECT * FROM diadiem WHERE id_dia_diem = ?`;
        try {
            const [rows] = await LocationModel._query(sql, [id_dia_diem], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in LocationModel.findById:", error);
            throw error;
        }
    },

    update: async (id_dia_diem, locationData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = [
            'ten_dia_diem', 'mo_ta', 'dia_chi', 'thanh_pho', 'quoc_gia',
            'loai_dia_diem', 'kinh_do', 'vi_do'
        ];

        Object.keys(locationData).forEach(key => {
            if (allowedFields.includes(key) && locationData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(locationData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_dia_diem);
        const sql = `UPDATE diadiem SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_dia_diem = ?`;

        try {
            if (locationData.loai_dia_diem && !LocationModel.TYPES.includes(locationData.loai_dia_diem)) {
                throw new Error(`Loại địa điểm không hợp lệ khi cập nhật: ${locationData.loai_dia_diem}.`);
            }
            const [result] = await LocationModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in LocationModel.update for id ${id_dia_diem}:`, error);
            throw error;
        }
    },

    delete: async (id_dia_diem, connection = null) => {
        // Add checks here if locations are linked to active tour activities or services
        // For example, check `hoatdongtour` and `dichvutour`
        // const checkActivitySql = "SELECT COUNT(*) as count FROM hoatdongtour WHERE id_dia_diem = ?";
        // const checkServiceSql = "SELECT COUNT(*) as count FROM dichvutour WHERE id_dia_diem = ?";
        // ... execute checks and throw error if linked ...

        const sql = "DELETE FROM diadiem WHERE id_dia_diem = ?";
        try {
            const [result] = await LocationModel._query(sql, [id_dia_diem], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in LocationModel.delete for id ${id_dia_diem}:`, error);
            throw error;
        }
    }
};

module.exports = LocationModel;