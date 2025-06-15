const tourReviewService = require('../services/danhgiatour_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');

const getAllReviewsQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('id_san_pham_tour').optional().isInt({ min: 1 }).toInt(),
    query('id_lich_trinh_tour').optional().isInt({ min: 1 }).toInt(),
    query('id_khach_hang').optional().isInt({ min: 1 }).toInt(),
    query('id_dat_tour').optional().isInt({ min: 1 }).toInt(),
    query('diem_danh_gia').optional().isInt({ min: 1, max: 5 }).toInt(),
    query('da_duyet').optional().isInt({ min: 0, max: 2 }).toInt(), // 0: chờ, 1: duyệt, 2: từ chối
    query('sortBy').optional().isIn(['dg.ngay_danh_gia', 'dg.ngay_tao', 'dg.diem_danh_gia', 'dg.da_duyet', 'spt.ten_tour', 'kh.ho_ten']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const updateReviewValidationRules = () => [
    param('id_danh_gia').isInt({ min: 1 }).withMessage('ID đánh giá không hợp lệ.'),
    body('da_duyet').optional().isInt({ min: 0, max: 2 }).withMessage('Trạng thái duyệt không hợp lệ (0, 1, hoặc 2).'),
    body('phan_hoi_quan_tri').optional({ checkFalsy: true }).isString().withMessage('Phản hồi quản trị phải là chuỗi.'),
    // Nếu cho phép admin sửa điểm và bình luận
    body('diem_danh_gia').optional().isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1 đến 5.'),
    body('binh_luan').optional({ checkFalsy: true }).isString().withMessage('Bình luận phải là chuỗi.')
];

const TourReviewController = {
    getAllReviews: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const queryParams = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                offset: (parseInt(page) - 1) * parseInt(limit) || 0,
                ...filters
            };

            console.log('Query params:', queryParams); // Debug log

            const result = await tourReviewService.getAllReviews(queryParams);

            console.log('Review result:', result); // Debug log

            // Sửa cách return data đúng format
            return paginatedResponse(
                res,
                'Lấy danh sách đánh giá thành công.',
                result.reviews || [], // Dùng reviews thay vì data
                {
                    currentPage: queryParams.page,
                    totalPages: Math.ceil((result.totalItems || 0) / queryParams.limit),
                    totalItems: result.totalItems || 0,
                    limit: queryParams.limit
                }
            );
        } catch (error) {
            next(error);
        }
    },

    getReviewById: async (req, res, next) => {
        try {
            const review = await tourReviewService.getReviewById(req.params.id_danh_gia);
            return successResponse(res, 'Lấy thông tin đánh giá thành công.', review);
        } catch (error) {
            next(error);
        }
    },

    updateReviewByAdmin: async (req, res, next) => {
        try {
            const result = await tourReviewService.updateReviewByAdmin(req.params.id_danh_gia, req.body);
            return successResponse(res, result.message, result.review);
        } catch (error) {
            next(error);
        }
    },

    deleteReview: async (req, res, next) => {
        try {
            const result = await tourReviewService.deleteReview(req.params.id_danh_gia);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    getReviewByBookingId: async (req, res, next) => {
        try {
            const { id_dat_tour } = req.params;

            const review = await tourReviewService.getReviewByBookingId(id_dat_tour);

            return successResponse(
                res,
                `Lấy đánh giá cho đơn đặt tour ID ${id_dat_tour} thành công`,
                review
            );
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...TourReviewController,
    getAllReviewsQueryValidationRules,
    updateReviewValidationRules
};