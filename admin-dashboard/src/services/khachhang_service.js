const CustomerModel = require('../models/khachhang_model');
const UserModel = require('../models/nguoidung_model'); // For validating id_nguoi_dung
const pool = require('../config/db.config');
const { formatDateForDb } = require('../utils/date_utils');

const CustomerService = {
    createCustomer: async (customerData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // Validate id_nguoi_dung if provided
            if (customerData.id_nguoi_dung) {
                const user = await UserModel.findById(customerData.id_nguoi_dung, connection);
                if (!user) {
                    throw { statusCode: 400, message: `Người dùng liên kết với ID ${customerData.id_nguoi_dung} không tồn tại.` };
                }
            }
            // Check for existing customer by email or cccd
            // Logic này vẫn đúng vì nó chỉ kiểm tra sự tồn tại (truthy/falsy)
            if (customerData.email_lien_he) {
                const existingByEmail = await CustomerModel.findByEmail(customerData.email_lien_he, connection);
                if (existingByEmail) {
                    throw { statusCode: 409, message: "Email liên hệ đã được sử dụng." };
                }
            }
            if (customerData.cccd) {
                const existingByCCCD = await CustomerModel.findByCCCD(customerData.cccd, connection);
                if (existingByCCCD) {
                    throw { statusCode: 409, message: "CCCD đã được sử dụng." };
                }
            }

            if (customerData.ngay_sinh) customerData.ngay_sinh = formatDateForDb(customerData.ngay_sinh);

            const newCustomer = await CustomerModel.create(customerData, connection);
            await connection.commit();
            return newCustomer;
        } catch (error) {
            await connection.rollback();
            console.error("Error in CustomerService.createCustomer:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllCustomers: async (queryParams) => {
        try {
            const { customers, totalItems } = await CustomerModel.findAll(queryParams);
            const totalPages = Math.ceil(totalItems / queryParams.limit);
            return {
                data: customers,
                pagination: {
                    currentPage: parseInt(queryParams.page) || 1,
                    totalPages,
                    totalItems,
                    limit: parseInt(queryParams.limit)
                }
            };
        } catch (error) {
            console.error("Error in CustomerService.getAllCustomers:", error);
            throw error;
        }
    },

    getCustomerById: async (id_khach_hang) => {
        try {
            const customer = await CustomerModel.findById(id_khach_hang);
            if (!customer) {
                throw { statusCode: 404, message: "Khách hàng không tồn tại" };
            }
            return customer;
        } catch (error) {
            console.error("Error in CustomerService.getCustomerById:", error);
            throw error;
        }
    },

    // Thêm phương thức này để controller sử dụng cho validation
    findCustomerByEmail: async (email_lien_he) => {
        try {
            const customer = await CustomerModel.findByEmail(email_lien_he);
            // customer sẽ là object khách hàng đầy đủ hoặc undefined
            return customer;
        } catch (error) {
            console.error("Error in CustomerService.findCustomerByEmail:", error);
            // Quyết định cách xử lý lỗi: ném lại hoặc trả về null/undefined
            // Ném lại lỗi thường tốt hơn để controller có thể bắt và xử lý chung
            throw error;
        }
    },

    updateCustomer: async (id_khach_hang, customerData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingCustomer = await CustomerModel.findById(id_khach_hang, connection);
            if (!existingCustomer) {
                throw { statusCode: 404, message: "Khách hàng không tồn tại" };
            }

            // Validate id_nguoi_dung if provided and changed
            if (customerData.id_nguoi_dung && customerData.id_nguoi_dung !== existingCustomer.id_nguoi_dung) {
                const user = await UserModel.findById(customerData.id_nguoi_dung, connection);
                if (!user) {
                    throw { statusCode: 400, message: `Người dùng liên kết với ID ${customerData.id_nguoi_dung} không tồn tại.` };
                }
            }
            // Check for existing customer by email or cccd if they are being changed
            // Logic này vẫn đúng vì nó kiểm tra sự tồn tại và id_khach_hang
            if (customerData.email_lien_he && customerData.email_lien_he !== existingCustomer.email_lien_he) {
                const otherCustomerWithEmail = await CustomerModel.findByEmail(customerData.email_lien_he, connection);
                if (otherCustomerWithEmail && otherCustomerWithEmail.id_khach_hang !== parseInt(id_khach_hang)) {
                    throw { statusCode: 409, message: "Email liên hệ đã được sử dụng bởi khách hàng khác." };
                }
            }
            if (customerData.cccd && customerData.cccd !== existingCustomer.cccd) {
                const otherCustomerWithCCCD = await CustomerModel.findByCCCD(customerData.cccd, connection);
                if (otherCustomerWithCCCD && otherCustomerWithCCCD.id_khach_hang !== parseInt(id_khach_hang)) {
                    throw { statusCode: 409, message: "CCCD đã được sử dụng bởi khách hàng khác." };
                }
            }

            if (customerData.ngay_sinh) customerData.ngay_sinh = formatDateForDb(customerData.ngay_sinh);

            const result = await CustomerModel.update(id_khach_hang, customerData, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in CustomerService.updateCustomer:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteCustomer: async (id_khach_hang) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingCustomer = await CustomerModel.findById(id_khach_hang, connection);
            if (!existingCustomer) {
                throw { statusCode: 404, message: "Khách hàng không tồn tại" };
            }
            // CustomerModel.delete already checks for bookings
            const result = await CustomerModel.delete(id_khach_hang, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in CustomerService.deleteCustomer:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = CustomerService;