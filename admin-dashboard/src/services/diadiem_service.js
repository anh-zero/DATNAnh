const LocationModel = require('../models/diadiem_model');
const pool = require('../config/db.config');

const LocationService = {
    createLocation: async (locationData) => {
        try {
            // Validate ENUM for loai_dia_diem
            if (locationData.loai_dia_diem && !LocationModel.TYPES.includes(locationData.loai_dia_diem)) {
                throw { statusCode: 400, message: `Loại địa điểm không hợp lệ: ${locationData.loai_dia_diem}. Các loại được chấp nhận: ${LocationModel.TYPES.join(', ')}` };
            }
            const newLocation = await LocationModel.create(locationData);
            return newLocation;
        } catch (error) {
            console.error("Error in LocationService.createLocation:", error);
            throw error;
        }
    },

    getAllLocations: async (filters, paginationOptions) => {
        try {
            // Đảm bảo các giá trị phân trang luôn là số hợp lệ
            const limit = parseInt(paginationOptions.limit) || 10;
            const page = parseInt(paginationOptions.page) || 1;
            const offset = (page - 1) * limit;
            const searchTerm = filters.searchTerm || '';
            const sortBy = filters.sortBy || 'ngay_tao';
            const order = filters.order || 'DESC';

            const { locations, totalItems } = await LocationModel.findAll({
                limit,
                offset,
                searchTerm,
                sortBy,
                order
            });

            const totalPages = Math.ceil(totalItems / limit);
            return {
                locations,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    limit
                }
            };
        } catch (error) {
            console.error("Error in LocationService.getAllLocations:", error);
            throw error;
        }
    },

    getLocationById: async (id_dia_diem) => {
        try {
            const location = await LocationModel.findById(id_dia_diem);
            if (!location) {
                throw { statusCode: 404, message: "Địa điểm không tồn tại" };
            }
            return location;
        } catch (error) {
            console.error("Error in LocationService.getLocationById:", error);
            throw error;
        }
    },

    updateLocation: async (id_dia_diem, locationData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingLocation = await LocationModel.findById(id_dia_diem, connection);
            if (!existingLocation) {
                throw { statusCode: 404, message: "Địa điểm không tồn tại" };
            }
            // Validate ENUM for loai_dia_diem
            if (locationData.loai_dia_diem && !LocationModel.TYPES.includes(locationData.loai_dia_diem)) {
                throw { statusCode: 400, message: `Loại địa điểm không hợp lệ: ${locationData.loai_dia_diem}. Các loại được chấp nhận: ${LocationModel.TYPES.join(', ')}` };
            }

            const result = await LocationModel.update(id_dia_diem, locationData, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                const updatedLocation = await LocationModel.findById(id_dia_diem);
                return { message: "Cập nhật địa điểm thành công.", location: updatedLocation };
            }
            return { message: "Không có thông tin nào được cập nhật hoặc địa điểm không tồn tại.", location: null };
        } catch (error) {
            await connection.rollback();
            console.error("Error in LocationService.updateLocation:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteLocation: async (id_dia_diem) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingLocation = await LocationModel.findById(id_dia_diem, connection);
            if (!existingLocation) {
                throw { statusCode: 404, message: "Địa điểm không tồn tại" };
            }

            // Check for dependencies before deletion
            const activityCheckSql = "SELECT COUNT(*) as count FROM hoatdongtour WHERE id_dia_diem = ?";
            const [activityRows] = await connection.query(activityCheckSql, [id_dia_diem]);
            if (activityRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa địa điểm này vì đang được sử dụng trong ${activityRows[0].count} hoạt động tour.` };
            }

            const serviceCheckSql = "SELECT COUNT(*) as count FROM dichvutour WHERE id_dia_diem = ?";
            const [serviceRows] = await connection.query(serviceCheckSql, [id_dia_diem]);
            if (serviceRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa địa điểm này vì đang được sử dụng trong ${serviceRows[0].count} dịch vụ tour.` };
            }

            const partnerCheckSql = "SELECT COUNT(*) as count FROM doitac WHERE id_dia_diem = ?";
            const [partnerRows] = await connection.query(partnerCheckSql, [id_dia_diem]);
            if (partnerRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa địa điểm này vì đang được liên kết với ${partnerRows[0].count} đối tác.` };
            }

            const result = await LocationModel.delete(id_dia_diem, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                return { message: "Xóa địa điểm thành công." };
            }
            return { message: "Không tìm thấy địa điểm để xóa hoặc đã được xóa." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in LocationService.deleteLocation:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = LocationService;