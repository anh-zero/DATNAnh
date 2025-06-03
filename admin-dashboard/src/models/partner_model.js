const pool = require('../config/db.config');

const PartnerModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (partnerData, connection = null) => {
        const {
            ten_doi_tac,
            dia_chi = null,
            so_dien_thoai = null,
            email = null,
            mo_ta_chi_tiet_doi_tac = null,
            ma_so_thue = null
        } = partnerData;

        const sql = `INSERT INTO doitac
                        (ten_doi_tac, dia_chi, so_dien_thoai, email, mo_ta_chi_tiet_doi_tac, ma_so_thue, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await PartnerModel._query(sql, [
                ten_doi_tac, dia_chi, so_dien_thoai, email, mo_ta_chi_tiet_doi_tac, ma_so_thue
            ], connection);
            return { id_doi_tac: result.insertId, ...partnerData };
        } catch (error) {
            console.error("Error in PartnerModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit, offset, searchTerm, sortBy = 'ngay_tao', order = 'DESC' }, connection = null) => {
        let baseSql = `FROM doitac WHERE 1=1`;
        const params = [];

        if (searchTerm) {
            baseSql += ` AND (ten_doi_tac LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ? OR ma_so_thue LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        const allowedSortColumns = ['ten_doi_tac', 'ngay_tao', 'email'];
        let validSortBy = 'ngay_tao';
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }

        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(*) as totalItems ${baseSql}`;
        const dataSql = `SELECT id_doi_tac, ten_doi_tac, email, so_dien_thoai, ma_so_thue, ngay_tao
                         ${baseSql} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
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
        const sql = `SELECT * FROM doitac WHERE id_doi_tac = ?`;
        try {
            const [rows] = await PartnerModel._query(sql, [id_doi_tac], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findById:", error);
            throw error;
        }
    },

    findByEmail: async (email, connection = null) => {
        if (!email) return null;
        const sql = "SELECT id_doi_tac FROM doitac WHERE email = ?";
        try {
            const [rows] = await PartnerModel._query(sql, [email], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findByEmail:", error);
            throw error;
        }
    },

    findByTaxCode: async (ma_so_thue, connection = null) => {
        if (!ma_so_thue) return null;
        const sql = "SELECT id_doi_tac FROM doitac WHERE ma_so_thue = ?";
        try {
            const [rows] = await PartnerModel._query(sql, [ma_so_thue], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findByTaxCode:", error);
            throw error;
        }
    },

    update: async (id_doi_tac, partnerData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = ['ten_doi_tac', 'dia_chi', 'so_dien_thoai', 'email', 'mo_ta_chi_tiet_doi_tac', 'ma_so_thue'];

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
        // Kiểm tra xem đối tác có đang được liên kết với tour nào không
        const checkLinkSql = "SELECT COUNT(*) as linkCount FROM sanphamtour_doitac WHERE id_doi_tac = ?";
        try {
            const [linkRows] = await PartnerModel._query(checkLinkSql, [id_doi_tac], connection);
            if (linkRows[0].linkCount > 0) {
                throw { statusCode: 400, message: `Không thể xóa đối tác này vì đang được liên kết với ${linkRows[0].linkCount} tour.` };
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
module.exports = PartnerModel;