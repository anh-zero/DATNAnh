const UserModel = require('../models/nguoidung_model');
const { comparePassword } = require('../utils/password_utils');
const { generateToken } = require('../utils/jwt_utils');

const login = async (loginIdentifier, password) => { // loginIdentifier có thể là email hoặc ten_dang_nhap
    const user = await UserModel.findByLoginIdentifier(loginIdentifier);

    if (!user) {
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }

    // Kiểm tra trạng thái hoạt động (1 = active)
    // 0 = bị khóa, 2 = đã xóa (theo logic softDelete mới)
    if (user.dang_hoat_dong !== 1) {
        throw { statusCode: 403, message: 'Tài khoản này đã bị khóa hoặc không hoạt động.' };
    }

    const isMatch = await comparePassword(password, user.mat_khau_bam);
    if (!isMatch) {
        throw { statusCode: 401, message: 'Thông tin đăng nhập không chính xác.' };
    }

    // Cập nhật thời gian đăng nhập cuối
    await UserModel.updateLastLogin(user.id_nguoi_dung);

    const payload = {
        id_nguoi_dung: user.id_nguoi_dung,
        ten_dang_nhap: user.ten_dang_nhap, // Thêm ten_dang_nhap vào payload
        email_dang_nhap: user.email_dang_nhap, // Đổi tên cho nhất quán
        vai_tro: user.vai_tro
    };
    const token = generateToken(payload);

    // Không trả về mật khẩu
    const { mat_khau_bam, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

module.exports = {
    login
};