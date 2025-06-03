const CustomerModel = require('../models/customer_model');
const UserModel = require('../models/user_model'); // Để kiểm tra id_nguoi_dung nếu có
const pool = require('../config/db.config'); // Dùng cho transaction nếu cần

const createCustomer = async (customerData) => {
    // Kiểm tra email_lien_he đã tồn tại chưa
    const existingByEmail = await CustomerModel.findByEmail(customerData.email_lien_he);
    if (existingByEmail) {
        throw { statusCode: 409, message: 'Email liên hệ đã tồn tại cho khách hàng khác.' };
    }
    // Kiểm tra cccd đã tồn tại chưa (nếu cccd được cung cấp)
    if (customerData.cccd) {
        const existingByCCCD = await CustomerModel.findByCCCD(customerData.cccd);
        if (existingByCCCD) {
            throw { statusCode: 409, message: 'Số CCCD đã tồn tại cho khách hàng khác.' };
        }
    }


    // Kiểm tra id_nguoi_dung (nếu có)
    if (customerData.id_nguoi_dung) {
        const user = await UserModel.findById(customerData.id_nguoi_dung);
        if (!user) {
            throw { statusCode: 400, message: `Người dùng hệ thống với ID ${customerData.id_nguoi_dung} không tồn tại.` };
        }
        // Có thể thêm kiểm tra xem id_nguoi_dung này đã được gán cho khách hàng nào khác chưa
    }

    return CustomerModel.create(customerData);
};

const getAllCustomers = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { searchTerm, sortBy, order } = filters;

    const { customers, totalItems } = await CustomerModel.findAll({
        limit: parseInt(limit),
        offset: offset,
        searchTerm,
        sortBy,
        order
    });
    return {
        customers,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const getCustomerById = async (id_khach_hang) => {
    const customer = await CustomerModel.findById(id_khach_hang);
    if (!customer) {
        throw { statusCode: 404, message: 'Khách hàng không tồn tại.' };
    }
    // Lấy thêm lịch sử đặt tour, đánh giá ở đây nếu cần
    // customer.bookings = await BookingModel.findByCustomerId(id_khach_hang);
    // customer.reviews = await ReviewModel.findByCustomerId(id_khach_hang);
    return customer;
};

const updateCustomer = async (id_khach_hang, customerData) => {
    const customer = await CustomerModel.findById(id_khach_hang);
    if (!customer) {
        throw { statusCode: 404, message: 'Khách hàng không tồn tại.' };
    }

    // Kiểm tra email_lien_he nếu thay đổi
    if (customerData.email_lien_he && customerData.email_lien_he !== customer.email_lien_he) {
        const existingByEmail = await CustomerModel.findByEmail(customerData.email_lien_he);
        if (existingByEmail && existingByEmail.id_khach_hang !== parseInt(id_khach_hang)) {
            throw { statusCode: 409, message: 'Email liên hệ đã tồn tại cho khách hàng khác.' };
        }
    }
    // Kiểm tra cccd nếu thay đổi và được cung cấp
    if (customerData.cccd && customerData.cccd !== customer.cccd) {
        const existingByCCCD = await CustomerModel.findByCCCD(customerData.cccd);
        if (existingByCCCD && existingByCCCD.id_khach_hang !== parseInt(id_khach_hang)) {
            throw { statusCode: 409, message: 'Số CCCD đã tồn tại cho khách hàng khác.' };
        }
    }


    // Kiểm tra id_nguoi_dung nếu có thay đổi
    if (customerData.id_nguoi_dung && customerData.id_nguoi_dung !== customer.id_nguoi_dung) {
        const user = await UserModel.findById(customerData.id_nguoi_dung);
        if (!user) {
            throw { statusCode: 400, message: `Người dùng hệ thống với ID ${customerData.id_nguoi_dung} không tồn tại.` };
        }
    } else if (customerData.id_nguoi_dung === '') { // Nếu admin muốn xóa liên kết user
        customerData.id_nguoi_dung = null;
    }


    const result = await CustomerModel.update(id_khach_hang, customerData);
    if (result.affectedRows === 0 && !Object.keys(customerData).length) {
        return { message: 'Không có thông tin nào được thay đổi.' };
    }
    if (result.affectedRows === 0) {
        // Có thể do ID không tìm thấy (đã check) hoặc dữ liệu giống hệt
        // throw { statusCode: 400, message: 'Cập nhật khách hàng không thành công hoặc không có thay đổi.' };
    }
    return { message: 'Cập nhật thông tin khách hàng thành công.' };
};

const deleteCustomer = async (id_khach_hang) => {
    const customer = await CustomerModel.findById(id_khach_hang);
    if (!customer) {
        throw { statusCode: 404, message: 'Khách hàng không tồn tại.' };
    }
    // Logic kiểm tra booking đã được thêm vào model.delete
    const result = await CustomerModel.delete(id_khach_hang);
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Xóa khách hàng không thành công.' };
    }
    return { message: 'Khách hàng đã được xóa.' };
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};