const TourModel = require('../models/sanphamtour_model');
const TourScheduleModel = require('../models/lichtrinhtour_model');
const ServiceTourModel = require('../models/dichvutour_model'); // For services/partners of a schedule
const ActivityTourModel = require('../models/hoatdongtour_model');
const BookingModel = require('../models/dattour_model');
const pool = require('../config/db.config');

const TourService = {
    createTour: async (tourData, file) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Tạo payload cho tour
            let tourPayload = { ...tourData };

            // Thêm URL ảnh bìa nếu có file
            if (file) {
                tourPayload.url_anh_bia = `/uploads/tour_covers/${file.filename}`;
            }

            // Xóa các trường không liên quan đến bảng sanphamtour
            delete tourPayload.partners;

            // Tạo tour mới
            const newTourProduct = await TourModel.create(tourPayload, connection);

            await connection.commit();

            // Lấy thông tin tour đã tạo
            const createdTour = await TourModel.findById(newTourProduct.id_san_pham_tour);
            return createdTour;
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourService.createTour:", error);

            // Tạo thông báo lỗi thân thiện hơn cho client
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                throw { statusCode: 400, message: "Lỗi cấu trúc dữ liệu: Có trường thông tin không tồn tại trong cơ sở dữ liệu" };
            }

            throw error;
        } finally {
            connection.release();
        }
    },

    getAllTours: async (options = {}) => {
        try {
            // Đặt tham số mặc định cho options nếu nó undefined
            const opts = options || {};

            // Lấy danh sách tours từ model
            const tours = await TourModel.findAll(opts);

            // Đếm tổng số bản ghi để tính pagination
            const [countResult] = await TourModel._query("SELECT COUNT(*) as total FROM sanphamtour");
            const totalCount = countResult[0]?.total || 0;

            // Trả về đúng định dạng mà controller mong đợi
            return {
                tours: tours || [],
                totalCount: totalCount
            };
        } catch (error) {
            console.error("Error in TourService.getAllTours:", error);
            throw { statusCode: 500, message: "Lỗi khi lấy danh sách tour" };
        }
    },

    getTourById: async (id_san_pham_tour) => {
        try {
            const tour = await TourModel.findById(id_san_pham_tour);
            if (!tour) {
                throw { statusCode: 404, message: "Sản phẩm tour không tồn tại" };
            }
            // Partners are not directly associated with sanphamtour in this schema.
            // To get partners, you'd need to:
            // 1. Get all lichtrinhtour for this id_san_pham_tour.
            // 2. For each lichtrinhtour, get all associated dichvutour entries (which link to doitac).
            // This is complex and usually handled by a more specific endpoint or by the client making multiple requests.
            // For now, we remove the direct assignment of tour.partners here.
            // tour.partners = []; // Or fetch them if you have a specific aggregation logic
            return tour;
        } catch (error) {
            console.error("Error in TourService.getTourById:", error);
            throw error;
        }
    },

    updateTour: async (id_san_pham_tour, tourData, file) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingTour = await TourModel.findById(id_san_pham_tour, connection);
            if (!existingTour) {
                // ... rollback và throw lỗi 404
            }

            let tourUpdatePayload = { ...tourData };

            if (file) {
                // 1. Nếu có file mới, ưu tiên file mới
                tourUpdatePayload.url_anh_bia = `/uploads/tour_covers/${file.filename}`;
            } else if (tourData.hasOwnProperty('url_anh_bia') && tourData.url_anh_bia === '') {
                // 2. Nếu không có file nhưng nhận được chuỗi rỗng, tức là xóa ảnh
                tourUpdatePayload.url_anh_bia = null;
            } else {
                // 3. Nếu không thuộc 2 trường hợp trên, không đụng đến trường ảnh
                delete tourUpdatePayload.url_anh_bia;
            }

            // ... phần còn lại của hàm
            await TourModel.update(id_san_pham_tour, tourUpdatePayload, connection);

            await connection.commit();
            const updatedTour = await TourModel.findById(id_san_pham_tour);
            return { message: "Cập nhật sản phẩm tour thành công.", tour: updatedTour };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourService.updateTour:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteTour: async (id_san_pham_tour) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const tour = await TourModel.findById(id_san_pham_tour, connection);
            if (!tour) {
                throw { statusCode: 404, message: "Sản phẩm tour không tồn tại." };
            }

            // No direct sanphamtour_doitac table to clear.
            // Deletion of dichvutour entries (which link partners to schedules) will happen
            // when deleting schedules.

            const schedules = await TourScheduleModel.findAllBySanPhamTourId(id_san_pham_tour, {}, connection);
            for (const schedule of schedules) {
                const id_lich_trinh_tour = schedule.id_lich_trinh_tour;
                const bookingCheckSql = "SELECT COUNT(*) as bookingCount FROM dattour WHERE id_lich_trinh_tour = ?";
                const [bookingRows] = await connection.query(bookingCheckSql, [id_lich_trinh_tour]);
                if (bookingRows[0].bookingCount > 0) {
                    throw { statusCode: 400, message: `Không thể xóa tour. Lịch trình ID ${id_lich_trinh_tour} có ${bookingRows[0].bookingCount} đơn đặt. Hãy hủy hoặc hoàn thành các đơn đặt trước.` };
                }
                await ActivityTourModel.deleteByScheduleId(id_lich_trinh_tour, connection);
                // This deletes entries from 'dichvutour' table for the specific schedule
                await ServiceTourModel.deleteServicesByScheduleId(id_lich_trinh_tour, connection);
            }
            await TourScheduleModel.deleteBySanPhamTourId(id_san_pham_tour, connection);
            const result = await TourModel.delete(id_san_pham_tour, connection);

            await connection.commit();
            if (result.affectedRows > 0) {
                return { message: "Xóa sản phẩm tour thành công." };
            }
            return { message: "Không tìm thấy sản phẩm tour để xóa hoặc đã được xóa." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourService.deleteTour:", error);
            throw error;
        } finally {
            connection.release();
        }
    },
    getTourStatistics: async () => {
        try {
            // Truy vấn số lượng tổng tour
            const [totalToursResult] = await pool.query(
                "SELECT COUNT(*) as totalTours FROM sanphamtour"
            );
            const totalTours = totalToursResult[0]?.totalTours || 0;

            // Truy vấn số tour có lịch trình đang mở bán
            const [activeToursResult] = await pool.query(`
                SELECT COUNT(DISTINCT spt.id_san_pham_tour) as activeTours 
                FROM sanphamtour spt
                INNER JOIN lichtrinhtour ltt ON spt.id_san_pham_tour = ltt.id_san_pham_tour
                WHERE ltt.trang_thai_lich_trinh = 'Đang mở bán'
            `);
            const activeTours = activeToursResult[0]?.activeTours || 0;

            // Truy vấn số lịch khởi hành
            const [scheduledToursResult] = await pool.query(`
                SELECT COUNT(*) as scheduledTours FROM lichtrinhtour
            `);
            const scheduledTours = scheduledToursResult[0]?.scheduledTours || 0;

            // Truy vấn số tour sắp khởi hành (khởi hành trong 7 ngày tới)
            const [upcomingToursResult] = await pool.query(`
                SELECT COUNT(DISTINCT spt.id_san_pham_tour) as upcomingTours
                FROM sanphamtour spt
                INNER JOIN lichtrinhtour ltt ON spt.id_san_pham_tour = ltt.id_san_pham_tour
                WHERE ltt.ngay_khoi_hanh BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            `);
            const upcomingTours = upcomingToursResult[0]?.upcomingTours || 0;

            return {
                totalTours,
                activeTours,
                scheduledTours,
                upcomingTours
            };
        } catch (error) {
            console.error("Error in getTourStatistics:", error);
            throw error;
        }
    },
    getAllToursOld: async (options = {}) => {
        try {
            // Lấy danh sách tours
            const tours = await TourModel.findAll(options);

            // Lấy tổng số lượng tours để tính pagination
            const [countResult] = await TourModel._query("SELECT COUNT(*) as total FROM sanphamtour");
            const totalCount = countResult[0]?.total || 0;

            // Trả về đúng định dạng mà controller mong đợi
            return {
                tours,  // Đảm bảo có thuộc tính tours
                totalCount  // Đảm bảo có thuộc tính totalCount
            };
        } catch (error) {
            console.error("Error in tourService.getAllTours:", error);
            throw { statusCode: 500, message: "Lỗi khi lấy danh sách tour" };
        }
    }
};

module.exports = TourService;