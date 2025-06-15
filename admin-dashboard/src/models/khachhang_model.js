const pool = require('../config/db.config');

const CustomerModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (customerData, connection = null) => {
        const {
            id_nguoi_dung = null, // Có thể null
            ho_ten,
            cccd = null,
            ngay_sinh = null,
            so_dien_thoai,
            email_lien_he,
            dia_chi_kh = null
        } = customerData;

        // Chuyển đổi ngày sinh sang định dạng YYYY-MM-DD nếu cần
        const formattedNgaySinh = ngay_sinh ? new Date(ngay_sinh).toISOString().slice(0, 10) : null;

        const sql = `INSERT INTO khachhang
                        (id_nguoi_dung, ho_ten, cccd, ngay_sinh, so_dien_thoai, email_lien_he, dia_chi_kh, ngay_tao, ngay_cap_nhat)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        try {
            const [result] = await CustomerModel._query(sql, [
                id_nguoi_dung, ho_ten, cccd, formattedNgaySinh, so_dien_thoai,
                email_lien_he, dia_chi_kh
            ], connection);
            return { id_khach_hang: result.insertId, ...customerData, ngay_sinh: formattedNgaySinh };
        } catch (error) {
            console.error("Error in CustomerModel.create:", error);
            throw error;
        }
    },

    findAll: async ({ limit = 10, offset, page = 1, searchTerm = '', sortBy = 'kh.ngay_tao', order = 'DESC' }, connection = null) => {
        // Đảm bảo limit và offset là số nguyên hợp lệ
        const safeLimit = parseInt(limit) || 10;
        let safeOffset;

        if (offset !== undefined) {
            safeOffset = parseInt(offset) || 0;
        } else if (page !== undefined) {
            safeOffset = (parseInt(page) - 1) * safeLimit || 0;
        } else {
            safeOffset = 0;
        }

        let baseSql = `FROM khachhang kh LEFT JOIN nguoidung u ON kh.id_nguoi_dung = u.id_nguoi_dung WHERE 1=1`;
        const params = [];

        if (searchTerm) {
            baseSql += ` AND (kh.ho_ten LIKE ? OR kh.email_lien_he LIKE ? OR kh.so_dien_thoai LIKE ? OR kh.cccd LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        const allowedSortColumns = ['kh.ho_ten', 'kh.ngay_tao', 'kh.email_lien_he', 'kh.so_dien_thoai'];
        let validSortBy = 'kh.ngay_tao'; // Default sort
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        } else if (sortBy === 'ho_ten') { // Allow sorting by ho_ten (alias)
            validSortBy = 'kh.ho_ten';
        }


        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(kh.id_khach_hang) as totalItems ${baseSql}`;
        const dataSql = `SELECT kh.id_khach_hang, kh.ho_ten, kh.email_lien_he, kh.so_dien_thoai, kh.cccd,
                                kh.ngay_sinh, kh.dia_chi_kh, kh.ngay_tao, kh.ngay_cap_nhat,
                                u.ten_dang_nhap as ten_nguoi_dung_lien_ket
                         ${baseSql} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, safeLimit, safeOffset]; // Sử dụng giá trị an toàn

        try {
            const [countRows] = await CustomerModel._query(countSql, params, connection);
            const [rows] = await CustomerModel._query(dataSql, dataParams, connection);
            return { customers: rows, totalItems: countRows[0].totalItems };
        } catch (error) {
            console.error("Error in CustomerModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_khach_hang, connection = null) => {
        const sql = `SELECT kh.*, u.ten_dang_nhap as ten_nguoi_dung_lien_ket, u.email_dang_nhap as email_nguoi_dung_lien_ket
                     FROM khachhang kh
                     LEFT JOIN nguoidung u ON kh.id_nguoi_dung = u.id_nguoi_dung
                     WHERE kh.id_khach_hang = ?`;
        try {
            const [rows] = await CustomerModel._query(sql, [id_khach_hang], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in CustomerModel.findById:", error);
            throw error;
        }
    },

    findByEmail: async (email_lien_he, connection = null) => {
        // Thay đổi câu SQL để lấy tất cả các trường của khách hàng
        const sql = `SELECT kh.*, u.ten_dang_nhap as ten_nguoi_dung_lien_ket, u.email_dang_nhap as email_nguoi_dung_lien_ket
                     FROM khachhang kh
                     LEFT JOIN nguoidung u ON kh.id_nguoi_dung = u.id_nguoi_dung
                     WHERE kh.email_lien_he = ?`;
        try {
            const [rows] = await CustomerModel._query(sql, [email_lien_he], connection);
            return rows[0]; // Trả về toàn bộ object khách hàng hoặc undefined nếu không tìm thấy
        } catch (error) {
            console.error("Error in CustomerModel.findByEmail:", error);
            throw error;
        }
    },
    findByCCCD: async (cccd, connection = null) => {
        if (!cccd) return null; // Bỏ qua nếu cccd là null hoặc undefined
        const sql = "SELECT id_khach_hang FROM khachhang WHERE cccd = ?";
        try {
            const [rows] = await CustomerModel._query(sql, [cccd], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in CustomerModel.findByCCCD:", error);
            throw error;
        }
    },


    update: async (id_khach_hang, customerData, connection = null) => {
        const fields = [];
        const values = [];
        const allowedFields = ['id_nguoi_dung', 'ho_ten', 'cccd', 'ngay_sinh', 'so_dien_thoai', 'email_lien_he', 'dia_chi_kh'];

        Object.keys(customerData).forEach(key => {
            if (allowedFields.includes(key) && customerData[key] !== undefined) {
                fields.push(`${key} = ?`);
                if (key === 'ngay_sinh' && customerData[key]) {
                    values.push(new Date(customerData[key]).toISOString().slice(0, 10));
                } else {
                    values.push(customerData[key]);
                }
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_khach_hang);
        const sql = `UPDATE khachhang SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_khach_hang = ?`;

        try {
            const [result] = await CustomerModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in CustomerModel.update for id ${id_khach_hang}:`, error);
            throw error;
        }
    },

    delete: async (id_khach_hang, connection = null) => {
        // Trước khi xóa, cần kiểm tra xem khách hàng có booking nào không.
        // Nếu có, có thể không cho xóa hoặc cần xử lý các booking đó (ví dụ: gán cho một khách hàng mặc định, hoặc xóa cascade nếu logic cho phép)
        // Hiện tại, chỉ thực hiện xóa cứng.
        const checkBookingSql = "SELECT COUNT(*) as bookingCount FROM dattour WHERE id_khach_hang = ?";
        try {
            const [bookingRows] = await CustomerModel._query(checkBookingSql, [id_khach_hang], connection);
            if (bookingRows[0].bookingCount > 0) {
                throw { statusCode: 400, message: `Không thể xóa khách hàng này vì đã có ${bookingRows[0].bookingCount} đơn đặt tour liên quan.` };
            }

            const sql = "DELETE FROM khachhang WHERE id_khach_hang = ?";
            const [result] = await CustomerModel._query(sql, [id_khach_hang], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in CustomerModel.delete for id ${id_khach_hang}:`, error);
            // Ném lại lỗi để service xử lý, bao gồm cả lỗi custom từ việc kiểm tra booking
            if (error.statusCode) throw error;
            throw new Error(`Database error during customer deletion: ${error.message}`);
        }
    },

    // (Các hàm thống kê có thể thêm sau nếu cần)
};
module.exports = CustomerModel;