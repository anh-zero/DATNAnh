const pool = require('../config/db.config');

const UserModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    // Tìm user bằng email_dang_nhap hoặc ten_dang_nhap
    findByLoginIdentifier: async (identifier, connection = null) => {
        const sql = `SELECT id_nguoi_dung, email_dang_nhap, ten_dang_nhap, mat_khau_bam, vai_tro, avatar as url_anh_dai_dien, dang_hoat_dong
                     FROM nguoidung
                     WHERE email_dang_nhap = ? OR ten_dang_nhap = ?`;
        try {
            const [rows] = await UserModel._query(sql, [identifier, identifier], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in UserModel.findByLoginIdentifier:", error);
            throw error;
        }
    },

    findById: async (id_nguoi_dung, connection = null) => {
        const sql = `SELECT id_nguoi_dung, email_dang_nhap, ten_dang_nhap, vai_tro, avatar as url_anh_dai_dien,
                            dang_hoat_dong, lan_dang_nhap_cuoi, ngay_tao, ngay_cap_nhat
                     FROM nguoidung
                     WHERE id_nguoi_dung = ?`;
        try {
            const [rows] = await UserModel._query(sql, [id_nguoi_dung], connection);
            return rows[0]; // Không trả về mat_khau_bam
        } catch (error) {
            console.error("Error in UserModel.findById:", error);
            throw error;
        }
    },

    // Tìm user theo ten_dang_nhap (để kiểm tra trùng)
    findByUsername: async (ten_dang_nhap, connection = null) => {
        const sql = "SELECT id_nguoi_dung FROM nguoidung WHERE ten_dang_nhap = ?";
        try {
            const [rows] = await UserModel._query(sql, [ten_dang_nhap], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in UserModel.findByUsername:", error);
            throw error;
        }
    },
    // Tìm user theo email_dang_nhap (để kiểm tra trùng)
    findByEmail: async (email_dang_nhap, connection = null) => {
        const sql = "SELECT id_nguoi_dung FROM nguoidung WHERE email_dang_nhap = ?";
        try {
            const [rows] = await UserModel._query(sql, [email_dang_nhap], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in UserModel.findByEmail:", error);
            throw error;
        }
    },

    ROLES: ['user', 'admin'], // ENUM values

    create: async (userData, connection = null) => {
        const { email_dang_nhap, ten_dang_nhap, mat_khau_bam, vai_tro = UserModel.ROLES[0], avatar = null, dang_hoat_dong = 1 } = userData;
        // Validate vai_tro
        if (!UserModel.ROLES.includes(vai_tro)) {
            throw new Error(`Vai trò không hợp lệ: ${vai_tro}. Các vai trò được chấp nhận: ${UserModel.ROLES.join(', ')}`);
        }
        const sql = `INSERT INTO nguoidung (email_dang_nhap, ten_dang_nhap, mat_khau_bam, vai_tro, avatar, dang_hoat_dong, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await UserModel._query(sql, [email_dang_nhap, ten_dang_nhap, mat_khau_bam, vai_tro, avatar, dang_hoat_dong], connection);
            return { id_nguoi_dung: result.insertId, email_dang_nhap, ten_dang_nhap, vai_tro, avatar, dang_hoat_dong };
        } catch (error) {
            console.error("Error in UserModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset = 0, searchTerm = '', sortBy = 'ngay_tao', order = 'DESC' }, connection = null) => {
        // Đảm bảo limit và offset là số
        const safeLimit = isNaN(parseInt(limit)) ? 10 : parseInt(limit);
        const safeOffset = isNaN(parseInt(offset)) ? 0 : parseInt(offset);

        let baseSql = `FROM nguoidung WHERE 1=1`;
        const params = [];

        if (searchTerm) {
            baseSql += " AND (ten_dang_nhap LIKE ? OR email_dang_nhap LIKE ?)";
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Validate sortBy column to prevent SQL injection
        const allowedSortColumns = ['id_nguoi_dung', 'ten_dang_nhap', 'ngay_tao', 'vai_tro', 'email_dang_nhap'];
        if (!allowedSortColumns.includes(sortBy)) {
            sortBy = 'ngay_tao'; // Default sort
        }
        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(*) as totalItems ${baseSql}`;
        const dataSql = `SELECT id_nguoi_dung, ten_dang_nhap, email_dang_nhap, vai_tro, dang_hoat_dong,
                           avatar as url_anh_dai_dien, lan_dang_nhap_cuoi, ngay_tao, ngay_cap_nhat
                    ${baseSql} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;

        // Thêm các tham số phân trang an toàn
        const dataParams = [...params, safeLimit, safeOffset];

        // Đảm bảo hàm findAll trong model trả về đúng cấu trúc
        try {
            const [countRows] = await UserModel._query(countSql, params, connection);
            const [rows] = await UserModel._query(dataSql, dataParams, connection);
            return {
                users: rows,
                totalItems: countRows[0].totalItems
            };
        } catch (error) {
            console.error("Error in UserModel.findAll:", error);
            throw error;
        }
    },

    update: async (id_nguoi_dung, userData, connection = null) => {
        const fields = [];
        const values = [];
        // Thêm email_dang_nhap vào danh sách các trường được phép cập nhật
        const allowedFields = ['ten_dang_nhap', 'email_dang_nhap', 'mat_khau_bam', 'vai_tro', 'avatar', 'dang_hoat_dong', 'lan_dang_nhap_cuoi'];

        Object.keys(userData).forEach(key => {
            if (allowedFields.includes(key) && userData[key] !== undefined) {
                if (key === 'vai_tro' && !UserModel.ROLES.includes(userData[key])) {
                    // Skip invalid role or throw error
                    console.warn(`Invalid role '${userData[key]}' provided for update. Skipping.`);
                    return;
                }
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        });

        // Phần code còn lại giữ nguyên
        if (userData.mat_khau_bam) { // Nếu có mật khẩu mới (đã hash)
            fields.push(`mat_khau_bam = ?`);
            values.push(userData.mat_khau_bam);
        }

        if (fields.length === 0) {
            return { affectedRows: 0, message: "No valid fields to update." };
        }

        values.push(id_nguoi_dung);
        const sql = `UPDATE nguoidung SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_nguoi_dung = ?`;

        try {
            const [result] = await UserModel._query(sql, values, connection);

            // Thêm dòng này để lấy thông tin người dùng đã cập nhật
            const updatedUser = await UserModel.findById(id_nguoi_dung, connection);

            return {
                affectedRows: result.affectedRows,
                message: "Cập nhật người dùng thành công",
                user: updatedUser  // Trả về dữ liệu người dùng đã cập nhật
            };
        } catch (error) {
            console.error(`Error in UserModel.update for id ${id_nguoi_dung}:`, error);
            throw error;
        }
    },

    // Xóa mềm: cập nhật dang_hoat_dong = 0 (hoặc một giá trị khác như 2 cho "đã xóa")
    softDelete: async (id_nguoi_dung, connection = null) => {
        // Giá trị 2 có thể đại diện cho 'đã xóa', 0 cho 'bị khóa'
        const sql = "UPDATE nguoidung SET dang_hoat_dong = 2, ngay_cap_nhat = NOW() WHERE id_nguoi_dung = ?";
        try {
            const [result] = await UserModel._query(sql, [id_nguoi_dung], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in UserModel.softDelete for id ${id_nguoi_dung}:`, error);
            throw error;
        }
    },
    // Xóa cứng (nếu cần)
    hardDelete: async (id_nguoi_dung, connection = null) => {
        const sql = "DELETE FROM nguoidung WHERE id_nguoi_dung = ?";
        try {
            const [result] = await UserModel._query(sql, [id_nguoi_dung], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in UserModel.hardDelete for id ${id_nguoi_dung}:`, error);
            throw error;
        }
    },

    updateLastLogin: async (id_nguoi_dung, connection = null) => {
        const sql = "UPDATE nguoidung SET lan_dang_nhap_cuoi = NOW() WHERE id_nguoi_dung = ?";
        try {
            await UserModel._query(sql, [id_nguoi_dung], connection);
        } catch (error) {
            console.error(`Error in UserModel.updateLastLogin for id ${id_nguoi_dung}:`, error);
            // Không throw lỗi ở đây để không làm gián đoạn quá trình login
        }
    },

    updateStatus: async (id_nguoi_dung, dang_hoat_dong, connection = null) => {
        const sql = "UPDATE nguoidung SET dang_hoat_dong = ?, ngay_cap_nhat = NOW() WHERE id_nguoi_dung = ?";
        try {
            const [result] = await UserModel._query(sql, [dang_hoat_dong, id_nguoi_dung], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in UserModel.updateStatus for id ${id_nguoi_dung}:`, error);
            throw error;
        }
    },
};
module.exports = UserModel;