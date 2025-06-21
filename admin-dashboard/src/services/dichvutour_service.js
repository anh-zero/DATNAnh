const ServiceTourModel = require('../models/dichvutour_model');
const TourScheduleModel = require('../models/lichtrinhtour_model');
const PartnerModel = require('../models/doitac_model');
const pool = require('../config/db.config');

const TourProvidedServiceService = {
    addServiceToSchedule: async (serviceData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { id_lich_trinh_tour, id_doi_tac } = serviceData;

            // Validate existence of foreign keys
            const schedule = await TourScheduleModel.findById(id_lich_trinh_tour, connection);
            if (!schedule) {
                throw { statusCode: 404, message: `Lịch trình tour với ID ${id_lich_trinh_tour} không tồn tại.` };
            }

            const partner = await PartnerModel.findById(id_doi_tac, connection);
            if (!partner) {
                throw { statusCode: 404, message: `Đối tác với ID ${id_doi_tac} không tồn tại.` };
            }

            // Xóa bỏ phần kiểm tra id_dia_diem vì nó không tồn tại trong bảng dichvutour
            /* 
            if (id_dia_diem) {
                const location = await LocationModel.findById(id_dia_diem, connection);
                if (!location) {
                    throw { statusCode: 404, message: `Địa điểm với ID ${id_dia_diem} không tồn tại.` };
                }
            }
            */

            // Format time values
            const formatTimeValue = (timeValue) => {
                if (!timeValue) return null;

                // Nếu đã là định dạng datetime đầy đủ, giữ nguyên
                if (/^\d{4}-\d{2}-\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
                    return timeValue;
                }

                // Nếu chỉ là ngày, thêm thời gian 00:00:00
                if (/^\d{4}-\d{2}-\d{2}$/.test(timeValue)) {
                    return `${timeValue} 00:00:00`;
                }

                // Nếu chỉ là thời gian, thêm ngày hiện tại
                if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
                    const today = new Date().toISOString().slice(0, 10);
                    return `${today} ${timeValue}`;
                }

                return timeValue;
            };

            // Format time values before saving to database
            if (serviceData.thoi_gian_bat_dau) {
                serviceData.thoi_gian_bat_dau = formatTimeValue(serviceData.thoi_gian_bat_dau);
            }

            if (serviceData.thoi_gian_ket_thuc) {
                serviceData.thoi_gian_ket_thuc = formatTimeValue(serviceData.thoi_gian_ket_thuc);
            }

            // Remove id_dia_diem if it exists in the data
            if (serviceData.id_dia_diem) {
                delete serviceData.id_dia_diem;
            }

            const newService = await ServiceTourModel.create(serviceData, connection);
            await connection.commit();
            return newService;
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourProvidedServiceService.addServiceToSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getServicesByScheduleId: async (id_lich_trinh_tour) => {
        try {
            const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
            if (!schedule) {
                throw { statusCode: 404, message: `Lịch trình tour với ID ${id_lich_trinh_tour} không tồn tại.` };
            }
            return await ServiceTourModel.findByScheduleId(id_lich_trinh_tour);
        } catch (error) {
            console.error("Error in TourProvidedServiceService.getServicesByScheduleId:", error);
            throw error;
        }
    },

    getServiceById: async (id_dich_vu_tour) => {
        try {
            const service = await ServiceTourModel.findById(id_dich_vu_tour);
            if (!service) {
                throw { statusCode: 404, message: "Dịch vụ tour không tồn tại" };
            }
            return service;
        } catch (error) {
            console.error("Error in TourProvidedServiceService.getServiceById:", error);
            throw error;
        }
    },

    updateServiceInSchedule: async (id_dich_vu_tour, serviceData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingService = await ServiceTourModel.findById(id_dich_vu_tour, connection);
            if (!existingService) {
                throw { statusCode: 404, message: "Dịch vụ tour không tồn tại" };
            }

            // Validate foreign keys if they are being updated
            if (serviceData.id_doi_tac) {
                const partner = await PartnerModel.findById(serviceData.id_doi_tac, connection);
                if (!partner) {
                    throw { statusCode: 404, message: `Đối tác với ID ${serviceData.id_doi_tac} không tồn tại.` };
                }
            }

            // Xóa bỏ kiểm tra id_dia_diem vì không tồn tại trong bảng dichvutour
            /*
            if (serviceData.id_dia_diem) {
                const location = await LocationModel.findById(serviceData.id_dia_diem, connection);
                if (!location) {
                    throw { statusCode: 404, message: `Địa điểm với ID ${serviceData.id_dia_diem} không tồn tại.` };
                }
            }
            */

            // Format time values
            const formatTimeValue = (timeValue) => {
                if (!timeValue) return null;

                // Nếu đã là định dạng datetime đầy đủ, giữ nguyên
                if (/^\d{4}-\d{2}-\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
                    return timeValue;
                }

                // Nếu chỉ là ngày, thêm thời gian 00:00:00
                if (/^\d{4}-\d{2}-\d{2}$/.test(timeValue)) {
                    return `${timeValue} 00:00:00`;
                }

                // Nếu chỉ là thời gian, thêm ngày hiện tại
                if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
                    const today = new Date().toISOString().slice(0, 10);
                    return `${today} ${timeValue}`;
                }

                return timeValue;
            };

            // Format time values before saving to database
            if (serviceData.thoi_gian_bat_dau) {
                serviceData.thoi_gian_bat_dau = formatTimeValue(serviceData.thoi_gian_bat_dau);
            }

            if (serviceData.thoi_gian_ket_thuc) {
                serviceData.thoi_gian_ket_thuc = formatTimeValue(serviceData.thoi_gian_ket_thuc);
            }

            // Remove id_dia_diem if it exists in the data
            if (serviceData.id_dia_diem) {
                delete serviceData.id_dia_diem;
            }

            const result = await ServiceTourModel.update(id_dich_vu_tour, serviceData, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                const updatedService = await ServiceTourModel.findById(id_dich_vu_tour);
                return { message: "Cập nhật dịch vụ tour thành công.", service: updatedService };
            }
            return { message: "Không có thông tin nào được cập nhật hoặc dịch vụ tour không tồn tại.", service: null };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourProvidedServiceService.updateServiceInSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    removeServiceFromSchedule: async (id_dich_vu_tour) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingService = await ServiceTourModel.findById(id_dich_vu_tour, connection);
            if (!existingService) {
                throw { statusCode: 404, message: "Dịch vụ tour không tồn tại" };
            }

            // ServiceTourModel.delete already checks for links to hoatdongtour
            const result = await ServiceTourModel.delete(id_dich_vu_tour, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                return { message: "Xóa dịch vụ tour thành công." };
            }
            return { message: "Không tìm thấy dịch vụ tour để xóa hoặc đã được xóa." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourProvidedServiceService.removeServiceFromSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllServices: async (queryParams = {}) => {
        try {
            // Extract query parameters
            const limit = parseInt(queryParams.limit) || 10;
            const offset = parseInt(queryParams.offset) || 0;
            const searchTerm = queryParams.searchTerm || '';

            // Use the model to get data instead of direct SQL
            const result = await ServiceTourModel.findAll({
                limit,
                offset,
                searchTerm
            });

            return {
                services: result.services || [],
                totalCount: result.totalCount || 0
            };
        } catch (error) {
            console.error("Error in TourProvidedServiceService.getAllServices:", error);
            throw error;
        }
    },

    // Thêm method getServicesByPartnerId
    getServicesByPartnerId: async (queryParams) => {
        try {
            const { id_doi_tac, limit, offset, sortBy, order } = queryParams;

            // ===== BƯỚC 1: KIỂM TRA SỰ TỒN TẠI CỦA ĐỐI TÁC =====
            const partner = await PartnerModel.findById(id_doi_tac);
            if (!partner) {
                // Nếu không tìm thấy đối tác,โยน lỗi 404
                throw { statusCode: 404, message: `Đối tác với ID ${id_doi_tac} không tồn tại.` };
            }
            // =======================================================


            // Nếu đối tác tồn tại, tiếp tục thực hiện các bước như cũ
            // Đếm tổng số dòng
            const countSql = `SELECT COUNT(*) as total FROM dichvutour WHERE id_doi_tac = ?`;
            const [countResult] = await pool.query(countSql, [id_doi_tac]);
            const totalItems = countResult[0].total;

            // Xây dựng truy vấn cơ sở
            let sql = `
                SELECT dvt.*, ltt.ngay_khoi_hanh, ltt.ngay_ket_thuc,
                       spt.ten_tour, spt.url_anh_bia
                FROM dichvutour dvt
                JOIN lichtrinhtour ltt ON dvt.id_lich_trinh_tour = ltt.id_lich_trinh_tour
                JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
                WHERE dvt.id_doi_tac = ?
            `;

            // Thêm sắp xếp và phân trang
            sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;

            // Thực hiện truy vấn
            const [services] = await pool.query(sql, [id_doi_tac, limit, offset]);

            return {
                services,
                totalItems
            };
        } catch (error) {
            console.error("Error in TourProvidedServiceService.getServicesByPartnerId:", error);
            //โยน lỗi để controller bắt được
            throw error;
        }
    },

    // Thêm method mới vào TourProvidedServiceService
    getServiceTypeStatistics: async () => {
        try {
            const sql = `
                SELECT 
                    COALESCE(loai_dich_vu, 'Khác') as loai_dich_vu,
                    COUNT(*) as so_luong
                FROM 
                    dichvutour
                GROUP BY 
                    loai_dich_vu
                ORDER BY 
                    so_luong DESC
            `;

            const [results] = await pool.query(sql);
            return results;
        } catch (error) {
            console.error("Error in TourProvidedServiceService.getServiceTypeStatistics:", error);
            throw error;
        }
    }
};

module.exports = TourProvidedServiceService;