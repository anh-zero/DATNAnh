const TourReviewModel = require('../models/danhgiatour_model');
const BookingModel = require('../models/dattour_model'); // To validate id_dat_tour
const CustomerModel = require('../models/khachhang_model'); // To validate id_khach_hang
const TourScheduleModel = require('../models/lichtrinhtour_model'); // To validate id_lich_trinh_tour
const pool = require('../config/db.config');

const TourReviewService = {
    // Admin typically doesn't create reviews, but might manage them.
    // createReview: async (reviewData) => { ... }

    getAllReviews: async (queryParams) => {
        try {
            const { reviews, totalItems } = await TourReviewModel.findAll(queryParams);

            // Log dữ liệu từ model để debug
            console.log('Model result:', { reviews, totalItems });

            // Trả về đúng format mà controller mong đợi
            return {
                reviews: reviews || [], // đổi data thành reviews để khớp với controller
                totalItems: totalItems || 0
            };
        } catch (error) {
            console.error("Error in TourReviewService.getAllReviews:", error);
            throw error;
        }
    },

    getReviewById: async (id_danh_gia) => {
        try {
            const review = await TourReviewModel.findById(id_danh_gia);
            if (!review) {
                throw { statusCode: 404, message: "Đánh giá không tồn tại" };
            }
            return review;
        } catch (error) {
            console.error("Error in TourReviewService.getReviewById:", error);
            throw error;
        }
    },

    // Thêm method getReviewByBookingId
    getReviewByBookingId: async (id_dat_tour) => {
        try {
            const sql = `
                SELECT dg.*, 
                       kh.ho_ten, kh.email_lien_he,
                       dt.id_lich_trinh_tour,
                       spt.id_san_pham_tour, spt.ten_tour
                FROM danhgiatour dg
                JOIN dattour dt ON dg.id_dat_tour = dt.id_dat_tour
                JOIN khachhang kh ON dt.id_khach_hang = kh.id_khach_hang
                JOIN lichtrinhtour ltt ON dt.id_lich_trinh_tour = ltt.id_lich_trinh_tour
                JOIN sanphamtour spt ON ltt.id_san_pham_tour = spt.id_san_pham_tour
                WHERE dg.id_dat_tour = ?
            `;

            const [reviews] = await pool.query(sql, [id_dat_tour]);

            // Nếu không tìm thấy review, trả về null
            return reviews.length > 0 ? reviews[0] : null;
        } catch (error) {
            console.error("Error in TourReviewService.getReviewByBookingId:", error);
            throw error;
        }
    },

    updateReviewByAdmin: async (id_danh_gia, reviewData) => {
        // Admin can update 'da_duyet', 'phan_hoi_quan_tri', and potentially 'diem_danh_gia', 'binh_luan'
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingReview = await TourReviewModel.findById(id_danh_gia, connection);
            if (!existingReview) {
                throw { statusCode: 404, message: "Đánh giá không tồn tại" };
            }

            // Validate da_duyet if provided (e.g., must be 0 or 1)
            if (reviewData.da_duyet !== undefined && ![0, 1, true, false].includes(reviewData.da_duyet)) {
                throw { statusCode: 400, message: "Giá trị 'da_duyet' không hợp lệ. Chỉ chấp nhận 0 hoặc 1." };
            }
            if (typeof reviewData.da_duyet === 'boolean') {
                reviewData.da_duyet = reviewData.da_duyet ? 1 : 0;
            }


            // Validate diem_danh_gia if provided (e.g., 1-5)
            if (reviewData.diem_danh_gia !== undefined && (reviewData.diem_danh_gia < 1 || reviewData.diem_danh_gia > 5)) {
                throw { statusCode: 400, message: "Điểm đánh giá phải từ 1 đến 5." };
            }


            const result = await TourReviewModel.update(id_danh_gia, reviewData, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourReviewService.updateReviewByAdmin:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteReview: async (id_danh_gia) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingReview = await TourReviewModel.findById(id_danh_gia, connection);
            if (!existingReview) {
                throw { statusCode: 404, message: "Đánh giá không tồn tại" };
            }
            const result = await TourReviewModel.delete(id_danh_gia, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in TourReviewService.deleteReview:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = TourReviewService;