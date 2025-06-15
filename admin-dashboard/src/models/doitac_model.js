const pool = require('../config/db.config');

const PartnerModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (partnerData, connection = null) => {
        const {
            ten_doi_tac,
            dia_chi = null,       // Thay đổi dia_chi_doi_tac thành dia_chi
            so_dien_thoai = null,
            email = null,
            mo_ta_chi_tiet_doi_tac = null,
            ma_so_thue = null,
            id_dia_diem = null
        } = partnerData;

        const sql = `INSERT INTO doitac
                        (ten_doi_tac, dia_chi, so_dien_thoai, email, mo_ta_chi_tiet_doi_tac, ma_so_thue, id_dia_diem, ngay_tao, ngay_cap_nhat) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await PartnerModel._query(sql, [
                ten_doi_tac, dia_chi, so_dien_thoai, email, mo_ta_chi_tiet_doi_tac, ma_so_thue, id_dia_diem
            ], connection);
            
            // Chỉ trả về các trường thực sự có trong DB
            const createdPartnerData = {
                id_doi_tac: result.insertId,
                ten_doi_tac,
                dia_chi,            // Thay đổi dia_chi_doi_tac thành dia_chi
                so_dien_thoai,
                email,
                mo_ta_chi_tiet_doi_tac,
                ma_so_thue,
                id_dia_diem
            };
            return createdPartnerData;
        } catch (error) {
            console.error("Error in PartnerModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit, offset, searchTerm = '', sortBy = 'ngay_tao', order = 'DESC' /*, dang_hop_tac = undefined // REMOVED */ }, connection = null) => {
        let baseSql = `FROM doitac d LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem WHERE 1=1`;
        const params = [];
        let selectFields = 'd.*, dd.ten_dia_diem as ten_dia_diem_doi_tac';

        if (searchTerm) {
            // Cập nhật tìm kiếm nếu các trường đó không còn
            baseSql += " AND (d.ten_doi_tac LIKE ? OR d.email LIKE ? OR d.so_dien_thoai LIKE ? OR d.ma_so_thue LIKE ? OR d.dia_chi_doi_tac LIKE ? OR d.mo_ta_chi_tiet_doi_tac LIKE ?)";
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        // if (dang_hop_tac !== undefined) { // REMOVED Filter logic for dang_hop_tac
        //     baseSql += " AND d.dang_hop_tac = ?";
        //     params.push(dang_hop_tac);
        // }

        const countSql = `SELECT COUNT(d.id_doi_tac) as totalItems ${baseSql}`;

        const allowedSortColumns = ['id_doi_tac', 'ten_doi_tac', 'email', 'ngay_tao', 'ma_so_thue']; // REMOVED dang_hop_tac
        let validSortBy = 'd.ngay_tao'; // Default sort
        if (allowedSortColumns.includes(sortBy)) {
            // Ensure sortBy is a valid column name from doitac table to prevent SQL injection if not using d. prefix
            if (sortBy.startsWith('d.')) { // If already prefixed
                validSortBy = sortBy;
            } else if (['id_doi_tac', 'ten_doi_tac', 'email', 'ngay_tao', 'ma_so_thue'].includes(sortBy)) { // Check against actual column names
                validSortBy = `d.${sortBy}`;
            }
        }
        const sortOrder = (order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

        const dataSql = `SELECT ${selectFields} ${baseSql} ORDER BY ${pool.escapeId(validSortBy)} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, parseInt(limit), parseInt(offset)];


        try {
            const [countRows] = await PartnerModel._query(countSql, params, connection);
            const [rows] = await PartnerModel._query(dataSql, dataParams, connection);
            return { partners: rows, totalItems: countRows[0].totalItems };
        } catch (error) {
            console.error("Error in PartnerModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_doi_tac, connection = null) => {
        const sql = `SELECT d.*, dd.ten_dia_diem as ten_dia_diem_doi_tac
                     FROM doitac d
                     LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem
                     WHERE d.id_doi_tac = ?`;
        try {
            const [rows] = await PartnerModel._query(sql, [id_doi_tac], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findById:", error);
            throw error;
        }
    },

    findByEmail: async (email, connection = null) => {
        const sql = `SELECT d.*, dd.ten_dia_diem as ten_dia_diem_doi_tac
                     FROM doitac d
                     LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem
                     WHERE d.email = ?`;
        try {
            const [rows] = await PartnerModel._query(sql, [email], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findByEmail:", error);
            throw error;
        }
    },

    findByMST: async (ma_so_thue, connection = null) => {
        const sql = `SELECT d.*, dd.ten_dia_diem as ten_dia_diem_doi_tac
                     FROM doitac d
                     LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem
                     WHERE d.ma_so_thue = ?`;
        try {
            const [rows] = await PartnerModel._query(sql, [ma_so_thue], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findByMST:", error);
            throw error;
        }
    },

    update: async (id_doi_tac, partnerData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = [
            'ten_doi_tac', 'dia_chi', 'so_dien_thoai', 'email',     // Thay đổi dia_chi_doi_tac thành dia_chi
            'mo_ta_chi_tiet_doi_tac', 'ma_so_thue', 'id_dia_diem'
        ];

        Object.keys(partnerData).forEach(key => {
            if (allowedFields.includes(key) && partnerData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(partnerData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_doi_tac);
        const sql = `UPDATE doitac SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_doi_tac = ?`;

        try {
            const [result] = await PartnerModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in PartnerModel.update for id ${id_doi_tac}:`, error);
            throw error;
        }
    },

    delete: async (id_doi_tac, connection = null) => {
        const checkServiceLinkSql = "SELECT COUNT(*) as linkCount FROM dichvutour WHERE id_doi_tac = ?";
        try {
            const [linkRows] = await PartnerModel._query(checkServiceLinkSql, [id_doi_tac], connection);
            if (linkRows[0].linkCount > 0) {
                throw { statusCode: 400, message: `Không thể xóa đối tác này vì đang liên kết với ${linkRows[0].linkCount} dịch vụ tour. Vui lòng gỡ bỏ liên kết trước.` };
            }

            const sql = "DELETE FROM doitac WHERE id_doi_tac = ?";
            const [result] = await PartnerModel._query(sql, [id_doi_tac], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in PartnerModel.delete for id ${id_doi_tac}:`, error);
            if (error.statusCode) throw error;
            throw new Error(`Database error during partner deletion: ${error.message}`);
        }
    }
};

const DoiTacModel = {
    // Các phương thức khác...

    findAll: async (options = {}) => {
        try {
            // Đảm bảo các giá trị hợp lệ
            const limit = Number(options.limit) || 10;
            const offset = Number(options.offset) || 0;
            const searchTerm = options.searchTerm || '';
            
            let whereClause = 'WHERE 1=1 ';
            const params = [];
            
            if (searchTerm) {
                // Thay đổi dia_chi_doi_tac thành dia_chi
                whereClause += 'AND (d.ten_doi_tac LIKE ? OR d.dia_chi LIKE ? OR d.mo_ta_chi_tiet_doi_tac LIKE ?) ';
                params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
            }
            
            const query = `
                SELECT d.*, dd.ten_dia_diem 
                FROM doitac d 
                LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem 
                ${whereClause}
                ORDER BY d.ngay_tao DESC
                LIMIT ? OFFSET ?
            `;
            
            console.log("SQL query:", query); // Debug log
            console.log("SQL params:", [...params, limit, offset]); // Debug log
            
            const [results] = await PartnerModel._query(
                query,
                [...params, limit, offset]
            );
            
            return results || [];
        } catch (error) {
            console.error("Error in PartnerModel.findAll:", error);
            throw error;
        }
    },

    // Các phương thức khác...
};

module.exports = PartnerModel;