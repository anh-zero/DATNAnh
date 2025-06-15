const ActivityTourModel = require('../models/hoatdongtour_model');
const TourScheduleModel = require('../models/lichtrinhtour_model');
const LocationModel = require('../models/diadiem_model');
const ServiceTourModel = require('../models/dichvutour_model'); // or dichvutor_model.js
const pool = require('../config/db.config');

const TourActivityService = {
    addActivityToSchedule: async (activityData) => {
        let connection;

        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Kiểm tra lịch trình tour tồn tại
            const checkSchedule = `SELECT id_lich_trinh_tour FROM lichtrinhtour WHERE id_lich_trinh_tour = ?`;
            const [scheduleResult] = await connection.query(checkSchedule, [activityData.id_lich_trinh_tour]);

            if (scheduleResult.length === 0) {
                throw { statusCode: 404, message: "Không tìm thấy lịch trình tour." };
            }

            // Kiểm tra địa điểm tồn tại (nếu cung cấp)
            if (activityData.id_dia_diem) {
                const checkLocation = `SELECT id_dia_diem FROM diadiem WHERE id_dia_diem = ?`;
                const [locationResult] = await connection.query(checkLocation, [activityData.id_dia_diem]);

                if (locationResult.length === 0) {
                    throw { statusCode: 404, message: "Không tìm thấy địa điểm." };
                }
            }

            // Nếu dịch vụ tour được cung cấp, kiểm tra tồn tại
            if (activityData.id_dich_vu_tour) {
                const checkService = `SELECT id_dich_vu_tour FROM dichvutour WHERE id_dich_vu_tour = ?`;
                const [serviceResult] = await connection.query(checkService, [activityData.id_dich_vu_tour]);

                if (serviceResult.length === 0) {
                    throw { statusCode: 404, message: "Không tìm thấy dịch vụ tour." };
                }
            }

            // Thêm hoạt động tour mới
            const activity = await ActivityTourModel.create(activityData, connection);

            await connection.commit();

            return {
                message: "Thêm hoạt động vào lịch trình thành công.",
                activity
            };

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error("Error in TourActivityService.addActivityToSchedule:", error);
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    getActivitiesByScheduleId: async (id_lich_trinh_tour) => {
        try {
            const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
            if (!schedule) {
                throw { statusCode: 404, message: `Lịch trình tour với ID ${id_lich_trinh_tour} không tồn tại.` };
            }
            const activities = await ActivityTourModel.findByScheduleId(id_lich_trinh_tour);
            return activities;
        } catch (error) {
            console.error("Error in TourActivityService.getActivitiesByScheduleId:", error);
            throw error;
        }
    },

    getActivityById: async (id_hoat_dong) => {
        try {
            const activity = await ActivityTourModel.findById(id_hoat_dong);
            if (!activity) {
                throw { statusCode: 404, message: "Hoạt động tour không tồn tại" };
            }
            return activity;
        } catch (error) {
            console.error("Error in TourActivityService.getActivityById:", error);
            throw error;
        }
    },

    updateActivityInSchedule: async (id_hoat_dong, activityData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Kiểm tra hoạt động tồn tại
            const existingActivity = await ActivityTourModel.findById(id_hoat_dong, connection);
            if (!existingActivity) {
                throw { statusCode: 404, message: "Hoạt động tour không tồn tại" };
            }

            // Kiểm tra địa điểm nếu được cập nhật
            if (activityData.id_dia_diem) {
                const checkLocation = `SELECT id_dia_diem FROM diadiem WHERE id_dia_diem = ?`;
                const [locationResult] = await connection.query(checkLocation, [activityData.id_dia_diem]);

                if (locationResult.length === 0) {
                    throw { statusCode: 404, message: "Không tìm thấy địa điểm." };
                }
            }

            // Kiểm tra dịch vụ tour nếu được cập nhật
            if (activityData.id_dich_vu_tour) {
                const checkService = `SELECT id_dich_vu_tour FROM dichvutour WHERE id_dich_vu_tour = ?`;
                const [serviceResult] = await connection.query(checkService, [activityData.id_dich_vu_tour]);

                if (serviceResult.length === 0) {
                    throw { statusCode: 404, message: "Không tìm thấy dịch vụ tour." };
                }
            }

            // Cập nhật
            const updateResult = await ActivityTourModel.update(id_hoat_dong, activityData, connection);

            // Lấy dữ liệu đã cập nhật
            const updatedActivity = await ActivityTourModel.findById(id_hoat_dong, connection);

            await connection.commit();

            return {
                message: "Cập nhật hoạt động tour thành công",
                activity: updatedActivity || {}
            };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourActivityService.updateActivityInSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    removeActivityFromSchedule: async (id_hoat_dong) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingActivity = await ActivityTourModel.findById(id_hoat_dong, connection);
            if (!existingActivity) {
                throw { statusCode: 404, message: "Hoạt động tour không tồn tại" };
            }
            const result = await ActivityTourModel.delete(id_hoat_dong, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourActivityService.removeActivityFromSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllActivities: async (queryParams) => {
        try {
            const result = await ActivityTourModel.findAll(queryParams);
            return {
                activities: result.activities || [],
                totalItems: result.totalItems || 0
            };
        } catch (error) {
            console.error("Error in TourActivityService.getAllActivities:", error);
            throw error;
        }
    },

    // Thêm method getActivitiesByLocationId
    getActivitiesByLocationId: async (queryParams) => {
        try {
            const { id_dia_diem, limit, offset, sortBy, order } = queryParams;

            // ===== BƯỚC 1: KIỂM TRA SỰ TỒN TẠI CỦA ĐỊA ĐIỂM =====
            const location = await LocationModel.findById(id_dia_diem);
            if (!location) {
                // Nếu không tìm thấy địa điểm,โยน lỗi 404
                throw { statusCode: 404, message: `Địa điểm với ID ${id_dia_diem} không tồn tại.` };
            }
            // =======================================================


            // Nếu địa điểm tồn tại, tiếp tục xử lý như cũ
            // Xây dựng truy vấn cơ sở
            let sql = `
                SELECT ht.*, dd.ten_dia_diem, ltt.id_lich_trinh_tour, ltt.ngay_khoi_hanh,
                       spt.id_san_pham_tour, spt.ten_tour
                FROM hoatdongtour ht
                JOIN diadiem dd ON ht.id_dia_diem = dd.id_dia_diem
                JOIN lichtrinhtour ltt ON ht.id_lich_trinh_tour = ltt.id_lich_trinh_tour
                JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
                WHERE ht.id_dia_diem = ?
            `;

            // Đếm tổng số dòng
            const countSql = `SELECT COUNT(*) as total FROM hoatdongtour WHERE id_dia_diem = ?`;
            const [countResult] = await pool.query(countSql, [id_dia_diem]);
            const totalItems = countResult[0].total;

            // Thêm sắp xếp và phân trang
            sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;

            // Thực hiện truy vấn
            const [activities] = await pool.query(sql, [id_dia_diem, limit, offset]);

            return {
                activities,
                totalItems
            };
        } catch (error) {
            console.error("Error in TourActivityService.getActivitiesByLocationId:", error);
            throw error;
        }
    }
};

module.exports = TourActivityService;