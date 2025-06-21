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

    findAll: async ({ limit, offset, searchTerm = '', sortBy = 'ngay_tao', order = 'DESC' }, connection = null) => {
        let baseSql = `FROM doitac d LEFT JOIN diadiem dd ON d.id_dia_diem = dd.id_dia_diem WHERE 1=1`;
        const params = [];
        let selectFields = 'd.*, dd.ten_dia_diem as ten_dia_diem_doi_tac';

        if (searchTerm) {
            baseSql += " AND (d.ten_doi_tac LIKE ? OR d.email LIKE ? OR d.so_dien_thoai LIKE ? OR d.ma_so_thue LIKE ? OR d.dia_chi LIKE ? OR d.mo_ta_chi_tiet_doi_tac LIKE ?)";
            const searchParam = `%${searchTerm}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        const countSql = `SELECT COUNT(d.id_doi_tac) as totalItems ${baseSql}`;

        // Xác định cột sắp xếp hợp lệ
        const allowedSortColumns = ['id_doi_tac', 'ten_doi_tac', 'email', 'ngay_tao', 'ma_so_thue', 'dia_chi'];
        let validSortBy = 'd.ngay_tao'; // Mặc định

        // Xử lý sortBy để thêm tiền tố bảng nếu cần
        if (sortBy) {
            // Nếu đã có tiền tố bảng
            if (sortBy.startsWith('d.') && allowedSortColumns.includes(sortBy.substring(2))) {
                validSortBy = sortBy;
            }
            // Nếu không có tiền tố bảng
            else if (allowedSortColumns.includes(sortBy)) {
                validSortBy = `d.${sortBy}`;
            }
        }

        // Xác định hướng sắp xếp hợp lệ
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        // Xây dựng câu truy vấn với ORDER BY
        const dataSql = `SELECT ${selectFields} ${baseSql} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, parseInt(limit), parseInt(offset)];

        // Thực thi câu truy vấn
        const [countRows] = await PartnerModel._query(countSql, params, connection);
        const [rows] = await PartnerModel._query(dataSql, dataParams, connection);

        return {
            partners: rows,
            totalItems: countRows[0].totalItems
        };
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
        const sql = "SELECT id_doi_tac, email FROM doitac WHERE email = ?";
        try {
            const [rows] = await PartnerModel._query(sql, [email], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in PartnerModel.findByEmail:", error);
            throw error;
        }
    },

    findByMST: async (ma_so_thue, connection = null) => {
        const sql = "SELECT id_doi_tac, ma_so_thue FROM doitac WHERE ma_so_thue = ?";
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
    },

    // Thêm phương thức countDocuments 
    countDocuments: async (query = {}, connection = null) => {
        try {
            let sqlQuery = 'SELECT COUNT(*) as total FROM doitac WHERE 1=1';
            const params = [];

            // Xử lý các điều kiện query nếu cần
            if (query.searchTerm) {
                sqlQuery += " AND (ten_doi_tac LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ? OR ma_so_thue LIKE ? OR dia_chi LIKE ?)";
                const searchParam = `%${query.searchTerm}%`;
                params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
            }

            const [result] = await PartnerModel._query(sqlQuery, params, connection);
            return result[0].total;
        } catch (error) {
            console.error("Error in PartnerModel.countDocuments:", error);
            throw error;
        }
    },

    // Thêm method find tương thích với mongo-style API
    find: async (query = {}, options = {}, connection = null) => {
        try {
            let sqlQuery = 'SELECT * FROM doitac WHERE 1=1';
            const params = [];

            // Xử lý các điều kiện query
            if (query.searchTerm) {
                sqlQuery += " AND (ten_doi_tac LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ? OR ma_so_thue LIKE ? OR dia_chi LIKE ?)";
                const searchParam = `%${query.searchTerm}%`;
                params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
            }

            // Xử lý sắp xếp
            if (options.sort) {
                const sortField = Object.keys(options.sort)[0];
                const sortOrder = options.sort[sortField] === 1 ? 'ASC' : 'DESC';

                // Đảm bảo sortField là tên cột hợp lệ để tránh SQL injection
                const validSortFields = ['id_doi_tac', 'ten_doi_tac', 'email', 'ngay_tao', 'ma_so_thue', 'dia_chi'];
                if (validSortFields.includes(sortField)) {
                    sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;
                } else {
                    sqlQuery += ' ORDER BY ngay_tao DESC'; // Default sort
                }
            } else {
                sqlQuery += ' ORDER BY ngay_tao DESC'; // Default sort
            }

            // Xử lý phân trang
            if (options.skip !== undefined && options.limit !== undefined) {
                sqlQuery += ' LIMIT ? OFFSET ?';
                params.push(parseInt(options.limit), parseInt(options.skip));
            }

            const [rows] = await PartnerModel._query(sqlQuery, params, connection);
            return rows;
        } catch (error) {
            console.error("Error in PartnerModel.find:", error);
            throw error;
        }
    }
};

module.exports = PartnerModel;