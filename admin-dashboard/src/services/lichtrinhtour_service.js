const TourScheduleModel = require('../models/lichtrinhtour_model');
const TourModel = require('../models/sanphamtour_model');
const db = require('../config/db.config');
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
        const connection = await db.getConnection();
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
        const connection = await db.getConnection();
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
        const connection = await db.getConnection();
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
    },

    getTourScheduleStatistics: async () => {
        try {
            // Lấy tổng số lịch trình
            const [totalSchedulesResult] = await db.query(
                "SELECT COUNT(*) as totalSchedules FROM lichtrinhtour"
            );
            const totalSchedules = totalSchedulesResult[0]?.totalSchedules || 0;

            // Lấy số lịch trình đang mở bán
            const [activeSchedulesResult] = await db.query(
                "SELECT COUNT(*) as activeSchedules FROM lichtrinhtour WHERE trang_thai_lich_trinh = 'Đang mở bán'"
            );
            const activeSchedules = activeSchedulesResult[0]?.activeSchedules || 0;

            // Lấy số lịch trình đã hoàn thành
            const [completedSchedulesResult] = await db.query(
                "SELECT COUNT(*) as completedSchedules FROM lichtrinhtour WHERE trang_thai_lich_trinh = 'Đã kết thúc'"
            );
            const completedSchedules = completedSchedulesResult[0]?.completedSchedules || 0;

            // Lấy số lịch trình sắp khởi hành (đang mở bán và ngày khởi hành trong vòng 7 ngày tới)
            const [upcomingSchedulesResult] = await db.query(
                `SELECT COUNT(*) as upcomingSchedules FROM lichtrinhtour 
                 WHERE trang_thai_lich_trinh = 'Đang mở bán' 
                 AND ngay_khoi_hanh BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
            );
            const upcomingSchedules = upcomingSchedulesResult[0]?.upcomingSchedules || 0;

            // Lấy số lịch trình đã hủy
            const [canceledSchedulesResult] = await db.query(
                "SELECT COUNT(*) as canceledSchedules FROM lichtrinhtour WHERE trang_thai_lich_trinh = 'Đã hủy'"
            );
            const canceledSchedules = canceledSchedulesResult[0]?.canceledSchedules || 0;

            // Thống kê theo trạng thái
            const [statusStatsResult] = await db.query(
                `SELECT trang_thai_lich_trinh, COUNT(*) as count 
                 FROM lichtrinhtour 
                 GROUP BY trang_thai_lich_trinh`
            );

            // Tính tổng doanh thu theo lịch trình đã hoàn thành
            const [revenueResult] = await db.query(
                `SELECT SUM(dt.tong_tien_thanh_toan) as totalRevenue
                 FROM dattour dt
                 JOIN lichtrinhtour l ON dt.id_lich_trinh_tour = l.id_lich_trinh_tour
                 WHERE dt.trang_thai_dat_tour IN ('Đã xác nhận', 'Hoàn thành')`
            );
            const totalRevenue = revenueResult[0]?.totalRevenue || 0;

            return {
                totalSchedules,
                activeSchedules,
                completedSchedules,
                upcomingSchedules,
                canceledSchedules,
                totalRevenue,
                statusStats: statusStatsResult || [],
                // Thêm các thống kê khác nếu cần
            };
        } catch (error) {
            console.error("Error in tourScheduleService.getTourScheduleStatistics:", error);
            throw error;
        }
    },

    updateScheduleStatus: async (id_lich_trinh_tour, newStatus) => {
        try {
            // Kiểm tra trạng thái hợp lệ
            const validStatuses = ['Sắp mở bán', 'Đang mở bán', 'Hết chỗ', 'Đã khởi hành', 'Đã kết thúc', 'Đã hủy'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
            }

            // Cập nhật trạng thái trong database
            const [result] = await db.execute(
                'UPDATE lichtrinhtour SET trang_thai_lich_trinh = ? WHERE id_lich_trinh_tour = ?',
                [newStatus, id_lich_trinh_tour]
            );

            if (result.affectedRows === 0) {
                throw new Error(`Không tìm thấy lịch trình có ID: ${id_lich_trinh_tour}`);
            }

            return {
                message: `Cập nhật trạng thái lịch trình thành ${newStatus} thành công`,
                id_lich_trinh_tour,
                trang_thai_lich_trinh: newStatus
            };
        } catch (error) {
            console.error(`Error updating schedule status for ID ${id_lich_trinh_tour}:`, error);
            throw error;
        }
    }
};

module.exports = tourScheduleService;