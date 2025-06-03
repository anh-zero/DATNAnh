const UserModel = require('../models/user_model');
const pool = require('../config/db.config');
const { hashPassword } = require('../utils/password_utils');
const fs = require('fs');
const path = require('path');

const createUser = async (userData, avatarFile) => {
    // Kiểm tra ten_dang_nhap và email_dang_nhap đã tồn tại chưa
    const existingByUsername = await UserModel.findByUsername(userData.ten_dang_nhap);
    if (existingByUsername) {
        if (avatarFile) fs.unlinkSync(avatarFile.path);
        throw { statusCode: 409, message: 'Tên đăng nhập đã tồn tại.' };
    }
    const existingByEmail = await UserModel.findByEmail(userData.email_dang_nhap);
    if (existingByEmail) {
        if (avatarFile) fs.unlinkSync(avatarFile.path);
        throw { statusCode: 409, message: 'Email đăng nhập đã tồn tại.' };
    }

    const mat_khau_bam = await hashPassword(userData.mat_khau);
    const userToCreate = {
        ten_dang_nhap: userData.ten_dang_nhap,
        email_dang_nhap: userData.email_dang_nhap,
        mat_khau_bam: mat_khau_bam,
        vai_tro: userData.vai_tro || 'user',
        dang_hoat_dong: userData.dang_hoat_dong === 0 ? 0 : 1, // Chuyển đổi sang 0 hoặc 1
    };

    if (avatarFile) {
        userToCreate.url_anh_dai_dien = `/uploads/avatars/${avatarFile.filename}`; // Sẽ map vào cột 'avartar' trong model
    }

    return UserModel.create(userToCreate);
};

const getAllUsers = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { searchTerm, sortBy, order } = filters;

    const { users, totalItems } = await UserModel.findAll({
        limit: parseInt(limit),
        offset: offset,
        searchTerm,
        sortBy,
        order
    });
    return {
        users,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const getUserById = async (id_nguoi_dung) => {
    const user = await UserModel.findById(id_nguoi_dung);
    if (!user) {
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }
    // Không cần bỏ mat_khau_bam vì findById đã không lấy
    return user;
};

const updateUser = async (id_nguoi_dung, userData, avatarFile) => {
    const user = await UserModel.findById(id_nguoi_dung);
    if (!user) {
        if (avatarFile) fs.unlinkSync(avatarFile.path);
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }

    // Kiểm tra trùng email_dang_nhap nếu có thay đổi
    if (userData.email_dang_nhap && userData.email_dang_nhap !== user.email_dang_nhap) {
         const existingByEmail = await UserModel.findByEmail(userData.email_dang_nhap);
         if (existingByEmail && existingByEmail.id_nguoi_dung !== parseInt(id_nguoi_dung)) {
            if (avatarFile) fs.unlinkSync(avatarFile.path);
            throw { statusCode: 409, message: 'Email đăng nhập đã tồn tại cho người dùng khác.' };
         }
    }
    // Kiểm tra trùng ten_dang_nhap nếu có thay đổi (id_nguoi_dung của EER là INT nên ten_dang_nhap có thể đổi)
    if (userData.ten_dang_nhap && userData.ten_dang_nhap !== user.ten_dang_nhap) {
        const existingByUsername = await UserModel.findByUsername(userData.ten_dang_nhap);
        if (existingByUsername && existingByUsername.id_nguoi_dung !== parseInt(id_nguoi_dung)) {
           if (avatarFile) fs.unlinkSync(avatarFile.path);
           throw { statusCode: 409, message: 'Tên đăng nhập đã tồn tại cho người dùng khác.' };
        }
   }


    const dataToUpdate = { ...userData };
    if (userData.mat_khau) { // Nếu admin cập nhật mật khẩu
        dataToUpdate.mat_khau_bam = await hashPassword(userData.mat_khau);
        delete dataToUpdate.mat_khau; // Xóa mật khẩu gốc
    }

    const oldAvatarPath = user.url_anh_dai_dien; // Lấy từ findById (đã map từ 'avartar')
    if (avatarFile) {
        dataToUpdate.url_anh_dai_dien = `/uploads/avatars/${avatarFile.filename}`; // Sẽ map vào cột 'avartar' trong model
    }
    // Đảm bảo dang_hoat_dong là 0 hoặc 1 nếu được cung cấp
    if (dataToUpdate.dang_hoat_dong !== undefined) {
        dataToUpdate.dang_hoat_dong = dataToUpdate.dang_hoat_dong ? 1 : 0;
    }


    const result = await UserModel.update(id_nguoi_dung, dataToUpdate);

    if (result.affectedRows > 0 && avatarFile && oldAvatarPath && oldAvatarPath !== dataToUpdate.url_anh_dai_dien) {
        const fullOldPath = path.join(__dirname, '../../', oldAvatarPath);
        if (fs.existsSync(fullOldPath)) {
            try { fs.unlinkSync(fullOldPath); } catch (err) { console.error("Error deleting old avatar:", err); }
        }
    } else if (result.affectedRows === 0 && avatarFile) {
        fs.unlinkSync(avatarFile.path);
    }

    if (result.affectedRows === 0 && !Object.keys(userData).length && !avatarFile) {
        // Không có gì để cập nhật
        return { message: 'Không có thông tin nào được thay đổi.' };
    }
    if (result.affectedRows === 0) {
        // Có thể do ID không tìm thấy (đã check ở trên) hoặc dữ liệu giống hệt
        // throw { statusCode: 400, message: 'Cập nhật người dùng không thành công hoặc không có thay đổi.' };
    }
    return { message: 'Cập nhật người dùng thành công.' };
};

// Xóa mềm người dùng
const softDeleteUser = async (id_nguoi_dung) => {
    const user = await UserModel.findById(id_nguoi_dung);
    if (!user) {
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }
    // Không cho xóa mềm admin cuối cùng hoặc admin đang đăng nhập (tùy logic)
    const result = await UserModel.softDelete(id_nguoi_dung);
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Xóa người dùng không thành công.' };
    }
    return { message: 'Người dùng đã được xóa (mềm).' };
};

const changeUserStatus = async (id_nguoi_dung, dang_hoat_dong) => {
    const user = await UserModel.findById(id_nguoi_dung);
    if (!user) {
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }
    const newStatus = dang_hoat_dong ? 1 : 0;
    const result = await UserModel.updateStatus(id_nguoi_dung, newStatus);
     if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Thay đổi trạng thái người dùng không thành công.' };
    }
    return { message: `Trạng thái người dùng đã được cập nhật thành ${newStatus === 1 ? "'đang hoạt động'" : "'bị khóa'"} .` };
};

const resetPassword = async (id_nguoi_dung, newPassword) => {
    const user = await UserModel.findById(id_nguoi_dung);
    if (!user) {
        throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }
    const mat_khau_bam = await hashPassword(newPassword);
    const result = await UserModel.update(id_nguoi_dung, { mat_khau_bam });
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Đặt lại mật khẩu không thành công.' };
    }
    return { message: 'Mật khẩu đã được đặt lại thành công.' };
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser, // Sử dụng soft delete
    changeUserStatus,
    resetPassword
};