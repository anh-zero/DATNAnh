const UserModel = require('../models/nguoidung_model');
const bcrypt = require('bcryptjs');
const pool = require('../config/db.config'); // For transactions if needed in more complex scenarios

const UserService = {
    createUser: async (userData, file) => {
        try {
            const { email_dang_nhap, ten_dang_nhap, mat_khau, vai_tro } = userData;

            // Check for existing user by email or username
            const existingByEmail = await UserModel.findByEmail(email_dang_nhap);
            if (existingByEmail) {
                throw { statusCode: 409, message: "Email đã tồn tại." };
            }
            if (ten_dang_nhap) {
                const existingByUsername = await UserModel.findByUsername(ten_dang_nhap);
                if (existingByUsername) {
                    throw { statusCode: 409, message: "Tên đăng nhập đã tồn tại." };
                }
            }

            // Validate vai_tro
            if (vai_tro && !UserModel.ROLES.includes(vai_tro)) {
                throw { statusCode: 400, message: `Vai trò không hợp lệ: ${vai_tro}. Các vai trò được chấp nhận: ${UserModel.ROLES.join(', ')}` };
            }

            // Xử lý file avatar nếu có
            if (file) {
                userData.avatar = file.path;
            }

            const mat_khau_bam = await bcrypt.hash(mat_khau, 10);
            const newUser = await UserModel.create({ ...userData, mat_khau_bam });

            // Exclude password from returned object
            delete newUser.mat_khau_bam;
            return newUser;
        } catch (error) {
            console.error("Error in UserService.createUser:", error);
            throw error;
        }
    },

    getAllUsers: async (filters, pagination) => {
        try {
            // Đảm bảo giá trị mặc định cho phân trang
            const page = parseInt(pagination.page) || 1;
            const limit = parseInt(pagination.limit) || 10;
            const offset = (page - 1) * limit;

            // Đảm bảo các giá trị hợp lệ
            const searchTerm = filters.searchTerm || '';
            const sortBy = filters.sortBy || 'ngay_tao';
            const order = filters.order || 'DESC';

            // Gọi model với tham số đúng định dạng
            const result = await UserModel.findAll({
                limit,
                offset,
                searchTerm,
                sortBy,
                order
            });
            return {
                data: Array.isArray(result.users) ? result.users.map(user => {
                    if (user) delete user.mat_khau_bam;
                    return user;
                }) : [],
                pagination: {
                    totalItems: result.totalItems || 0
                }
            };
        } catch (error) {
            console.error("Error in UserService.getAllUsers:", error);
            throw error;
        }
    },

    getUserById: async (id_nguoi_dung) => {
        try {
            const user = await UserModel.findById(id_nguoi_dung);
            if (!user) {
                throw { statusCode: 404, message: "Người dùng không tồn tại" };
            }
            delete user.mat_khau_bam; // Ensure password is not sent
            return user;
        } catch (error) {
            console.error("Error in UserService.getUserById:", error);
            throw error;
        }
    },

    updateUser: async (id_nguoi_dung, userData, file) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingUser = await UserModel.findById(id_nguoi_dung, connection);
            if (!existingUser) {
                throw { statusCode: 404, message: "Người dùng không tồn tại" };
            }

            // Kiểm tra và xử lý file ảnh đại diện
            if (file) {
                // File path sẽ là đường dẫn tương đối tới file đã upload
                userData.avatar = file.path;
                // Hoặc nếu cần đường dẫn URL đầy đủ:
                // userData.avatar = `/uploads/avatars/${file.filename}`;
            }

            if (userData.email_dang_nhap && userData.email_dang_nhap !== existingUser.email_dang_nhap) {
                const otherUserWithEmail = await UserModel.findByEmail(userData.email_dang_nhap, connection);
                if (otherUserWithEmail && otherUserWithEmail.id_nguoi_dung !== parseInt(id_nguoi_dung)) {
                    throw { statusCode: 409, message: "Email đã được sử dụng bởi người dùng khác." };
                }
            }
            // Similar check for ten_dang_nhap if it's unique and updatable

            // Validate vai_tro
            if (userData.vai_tro && !UserModel.ROLES.includes(userData.vai_tro)) {
                throw { statusCode: 400, message: `Vai trò không hợp lệ: ${userData.vai_tro}. Các vai trò được chấp nhận: ${UserModel.ROLES.join(', ')}` };
            }

            if (userData.mat_khau) {
                userData.mat_khau_bam = await bcrypt.hash(userData.mat_khau, 10);
                delete userData.mat_khau; // Don't store plain password
            }


            const result = await UserModel.update(id_nguoi_dung, userData, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in UserService.updateUser:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // softDelete or hardDelete based on your UserModel's capability
    deleteUser: async (id_nguoi_dung) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingUser = await UserModel.findById(id_nguoi_dung, connection);
            if (!existingUser) {
                throw { statusCode: 404, message: "Người dùng không tồn tại" };
            }
            // Check if user is linked to customers or other critical data before deleting
            const customerCheckSql = "SELECT COUNT(*) as count FROM khachhang WHERE id_nguoi_dung = ?";
            const [customerRows] = await connection.query(customerCheckSql, [id_nguoi_dung]);
            if (customerRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa người dùng này vì đang liên kết với ${customerRows[0].count} khách hàng. Cập nhật hoặc gỡ bỏ liên kết trước.` };
            }

            // Assuming UserModel has softDelete or hardDelete
            // const result = await UserModel.softDelete(id_nguoi_dung, connection);
            const result = await UserModel.hardDelete(id_nguoi_dung, connection); // Or softDelete
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in UserService.deleteUser:", error);
            throw error;
        } finally {
            connection.release();
        }
    },
    updateUserStatus: async (id_nguoi_dung, dang_hoat_dong) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingUser = await UserModel.findById(id_nguoi_dung, connection);
            if (!existingUser) {
                throw { statusCode: 404, message: "Người dùng không tồn tại" };
            }

            const result = await UserModel.updateStatus(id_nguoi_dung, dang_hoat_dong, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                return { message: "Cập nhật trạng thái người dùng thành công." };
            }
            return { message: "Không có thay đổi nào được thực hiện." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in UserService.updateUserStatus:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = UserService;