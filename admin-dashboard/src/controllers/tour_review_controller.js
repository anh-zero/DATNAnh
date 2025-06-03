const tourReviewService = require('../services/tour_review_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');

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

const getAllReviews = async (req, res, next) => {
    try {
        const { page, limit, ...filters } = req.query;
        const paginationOptions = { page, limit };
        const result = await tourReviewService.getAllReviews(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách đánh giá thành công.', result.reviews, result.pagination);
    } catch (error) {
        next(error);
    }
};

const getReviewById = async (req, res, next) => {
    try {
        const review = await tourReviewService.getReviewById(req.params.id_danh_gia);
        return successResponse(res, 'Lấy thông tin đánh giá thành công.', review);
    } catch (error) {
        next(error);
    }
};

const updateReviewByAdmin = async (req, res, next) => {
    try {
        const result = await tourReviewService.updateReviewByAdmin(req.params.id_danh_gia, req.body);
        return successResponse(res, result.message, result.review);
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const result = await tourReviewService.deleteReview(req.params.id_danh_gia);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    updateReviewByAdmin,
    deleteReview,
    getAllReviewsQueryValidationRules,
    updateReviewValidationRules
};