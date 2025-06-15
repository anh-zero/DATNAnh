const TourScheduleModel = require('../models/lichtrinhtour_model');
const TourModel = require('../models/sanphamtour_model');
const pool = require('../config/db.config');
const tourScheduleService = {
    createTourSchedule: async (scheduleData) => {
        try {
            // Kiểm tra sản phẩm tour tồn tại
            const tourExists = await TourModel.findById(scheduleData.id_san_pham_tour);
            if (!tourExists) {
                throw { statusCode: 404, message: 'Sản phẩm tour không tồn tại' };
            }

            // Kiểm tra các ngày hợp lệ
            const currentDate = new Date();
            const ngayKhoiHanh = new Date(scheduleData.ngay_khoi_hanh);
            const ngayKetThuc = new Date(scheduleData.ngay_ket_thuc);

            if (ngayKhoiHanh < currentDate && !scheduleData.admin_override) {
                throw { statusCode: 400, message: 'Ngày khởi hành không thể ở quá khứ' };
            }

            if (ngayKetThuc <= ngayKhoiHanh) {
                throw { statusCode: 400, message: 'Ngày kết thúc phải sau ngày khởi hành' };
            }

            // Tạo lịch trình tour
            const newSchedule = await TourScheduleModel.create(scheduleData);

            return newSchedule;
        } catch (error) {
            console.error("Error in tourScheduleService.createTourSchedule:", error);
            throw error;
        }
    },

    getSchedulesByTourId: async (id_san_pham_tour, options = {}) => {
        try {
            const tour = await TourModel.findById(id_san_pham_tour);
            if (!tour) {
                throw { statusCode: 404, message: `Sản phẩm tour với ID ${id_san_pham_tour} không tồn tại.` };
            }

            // Sửa dòng này: từ findByTourId thành findAllBySanPhamTourId
            return await TourScheduleModel.findAllBySanPhamTourId(id_san_pham_tour, options);
        } catch (error) {
            console.error("Error in TourScheduleService.getSchedulesByTourId:", error);
            throw error;
        }
    },

    getScheduleDetailsById: async (id_lich_trinh_tour) => {
        try {
            const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
            if (!schedule) {
                throw { statusCode: 404, message: "Lịch trình tour không tồn tại" };
            }
            return schedule;
        } catch (error) {
            console.error("Error in TourScheduleService.getScheduleDetailsById:", error);
            throw error;
        }
    },

    updateSchedule: async (id_lich_trinh_tour, scheduleData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingSchedule = await TourScheduleModel.findById(id_lich_trinh_tour, connection);
            if (!existingSchedule) {
                throw { statusCode: 404, message: "Lịch trình tour không tồn tại" };
            }

            const result = await TourScheduleModel.update(id_lich_trinh_tour, scheduleData, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                const updatedSchedule = await TourScheduleModel.findById(id_lich_trinh_tour);
                return { message: "Cập nhật lịch trình thành công.", schedule: updatedSchedule };
            }
            return { message: "Không có thông tin nào được cập nhật.", schedule: null };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourScheduleService.updateSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteSchedule: async (id_lich_trinh_tour) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingSchedule = await TourScheduleModel.findById(id_lich_trinh_tour, connection);
            if (!existingSchedule) {
                throw { statusCode: 404, message: "Lịch trình tour không tồn tại" };
            }

            // Check for existing bookings
            const bookingCheckSql = "SELECT COUNT(*) as count FROM dattour WHERE id_lich_trinh_tour = ?";
            const [bookingRows] = await connection.query(bookingCheckSql, [id_lich_trinh_tour]);
            if (bookingRows[0].count > 0) {
                throw { statusCode: 400, message: `Không thể xóa lịch trình này vì đã có ${bookingRows[0].count} đơn đặt tour.` };
            }

            const result = await TourScheduleModel.delete(id_lich_trinh_tour, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                return { message: "Xóa lịch trình thành công." };
            }
            return { message: "Không tìm thấy lịch trình để xóa." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourScheduleService.deleteSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    cancelSchedule: async (id_lich_trinh_tour, reason) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingSchedule = await TourScheduleModel.findById(id_lich_trinh_tour, connection);
            if (!existingSchedule) {
                throw { statusCode: 404, message: "Lịch trình tour không tồn tại" };
            }

            const updateData = {
                trang_thai_lich_trinh: 'Đã hủy', // Đã đúng, giữ nguyên
                ghi_chu: reason ? `Đã hủy: ${reason}` : 'Đã hủy bởi admin'
            };

            await TourScheduleModel.update(id_lich_trinh_tour, updateData, connection);

            // Update related bookings to cancelled status
            const updateBookingSql = "UPDATE dattour SET trang_thai_dat_tour = 'Đã hủy bởi admin' WHERE id_lich_trinh_tour = ?";
            await connection.query(updateBookingSql, [id_lich_trinh_tour]);

            await connection.commit();

            const updatedSchedule = await TourScheduleModel.findById(id_lich_trinh_tour);
            return { message: "Hủy lịch trình thành công.", schedule: updatedSchedule };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourScheduleService.cancelSchedule:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllSchedules: async (queryParams) => {
        try {
            const {
                limit = 10,
                offset = 0,
                searchTerm = '',
                sortBy = 'ngay_khoi_hanh',
                order = 'ASC'
            } = queryParams || {};

            // Truyền trực tiếp các tham số đã destructure thay vì truyền các object phức tạp
            const result = await TourScheduleModel.findAll({
                limit,
                offset,
                searchTerm,
                sortBy,
                order
            });

            return {
                schedules: result.schedules || [],
                totalItems: result.totalItems || 0
            };
        } catch (error) {
            console.error("Error in TourScheduleService.getAllSchedules:", error);
            throw error;
        }
    }
};

module.exports = tourScheduleService;