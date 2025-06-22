// File: src/controllers/tour_controller.js
const tourService = require('../services/sanphamtour_service');
const { successResponse, errorResponse, paginatedResponse, paginatedResponseObj } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã được dùng ở routes

const tourValidationRules = () => [
    body('ten_tour').notEmpty().withMessage('Tên tour không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên tour không quá 255 ký tự.'),
    body('mo_ta_chi_tiet').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết phải là một chuỗi.'),
    body('thoi_gian_du_kien').optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Thời gian dự kiến không quá 50 ký tự.'),
    // Giữ nguyên validation cho 'partners' như đã cung cấp
    body('ghi_chu').optional({ checkFalsy: true }).isString().withMessage('Ghi chú tour phải là một chuỗi.') // Thêm validation cho ghi_chu của tour
];

const updateTourValidationRules = () => [
    param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.'),
    body('ten_tour').optional().notEmpty().withMessage('Tên tour không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên tour không quá 255 ký tự.'),
    body('mo_ta_chi_tiet').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết phải là một chuỗi.'),
    body('thoi_gian_du_kien').optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Thời gian dự kiến không quá 50 ký tự.'),

    // Giữ nguyên validation cho 'partners' như đã cung cấp, nếu cần cập nhật partners qua route này
    body('partners').optional().custom((value) => {
        let partnersArray = value;
        if (typeof value === 'string') {
            try {
                partnersArray = JSON.parse(value);
            } catch (e) {
                throw new Error('Dữ liệu partners (dạng chuỗi) không phải là JSON hợp lệ.');
            }
        }
        if (partnersArray !== undefined) {
            if (!Array.isArray(partnersArray)) {
                throw new Error('Danh sách đối tác phải là một mảng (hoặc chuỗi JSON của mảng).');
            }
            for (const partner of partnersArray) {
                if (typeof partner !== 'object' || partner === null) {
                    throw new Error('Mỗi đối tác trong danh sách phải là một đối tượng.');
                }
                if (!partner.id_doi_tac || !Number.isInteger(partner.id_doi_tac) || partner.id_doi_tac < 1) {
                    throw new Error('Mỗi đối tác phải có "id_doi_tac" là số nguyên dương.');
                }
                if (partner.loai_hop_tac !== undefined && (typeof partner.loai_hop_tac !== 'string' || partner.loai_hop_tac.length > 100)) {
                    throw new Error('Loại hợp tác (nếu có) phải là chuỗi không quá 100 ký tự.');
                }
                if (partner.ghi_chu !== undefined && partner.ghi_chu !== null && typeof partner.ghi_chu !== 'string') {
                    throw new Error('Ghi chú đối tác (nếu có) phải là một chuỗi.');
                }
            }
        }
        return true;
    }),
    body('ghi_chu').optional({ checkFalsy: true }).isString().withMessage('Ghi chú tour phải là một chuỗi.') // Thêm validation cho ghi_chu của tour
];

const getAllToursQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('searchTerm').optional().isString().trim(),
    query('sortBy').optional().isIn(['id_san_pham_tour', 'ten_tour', 'ngay_tao', 'total_revenue', 'total_bookings', 'schedule_count']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const TourController = {
    createTour: async (req, res, next) => {
        try {
            // Trích xuất các trường từ request body
            const { ten_tour, mo_ta_chi_tiet, thoi_gian_du_kien } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!ten_tour) {
                return res.status(400).json({
                    success: false,
                    message: "Tên tour là bắt buộc"
                });
            }

            // Lấy file ảnh nếu có
            const file = req.file;

            // Tạo đối tượng dữ liệu tour
            const tourData = {
                ten_tour,
                mo_ta_chi_tiet: mo_ta_chi_tiet || null,
                thoi_gian_du_kien: thoi_gian_du_kien || null,
                // Các trường khác từ request body
                ...req.body
            };

            // Gọi service để tạo tour
            const createdTour = await tourService.createTour(tourData, file);

            return res.status(201).json({
                success: true,
                message: "Tạo sản phẩm tour thành công",
                data: createdTour
            });
        } catch (error) {
            console.error("Error in createTour controller:", error);
            return next(error);
        }
    },

    getAllTours: async (req, res, next) => {
        try {
            // Set default values
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const search = req.query.search || '';

            const offset = (page - 1) * limit;

            const options = {
                limit,
                offset,
                searchTerm: search
            };

            // Luôn xử lý trường hợp undefined
            const result = await tourService.getAllTours(options) || {};
            const tours = result.tours || [];
            const totalCount = result.totalCount || 0;

            return paginatedResponseObj({
                res,
                message: 'Lấy danh sách sản phẩm tour thành công.',
                data: tours,
                currentPage: page,
                totalCount,
                limit
            });
        } catch (error) {
            console.error("Error in getAllTours controller:", error);
            return next(error);
        }
    },

    getTourById: async (req, res, next) => {
        try {
            const tour = await tourService.getTourById(req.params.id_san_pham_tour);
            return successResponse(res, 'Lấy thông tin sản phẩm tour thành công.', tour);
        } catch (error) {
            next(error);
        }
    },

    updateTour: async (req, res, next) => {
        try {
            console.log("--- DEBUGGING UPDATE TOUR ---");
            console.log("req.body is:", req.body); // In ra các trường text
            console.log("req.file is:", req.file);   // In ra thông tin file đã upload
            const result = await tourService.updateTour(req.params.id_san_pham_tour, req.body, req.file);
            return successResponse(res, result.message, result.tour);
        } catch (error) {
            next(error);
        }
    },

    deleteTour: async (req, res, next) => {
        try {
            const result = await tourService.deleteTour(req.params.id_san_pham_tour);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    getTourStatistics: async (req, res, next) => {
        try {
            const statistics = await tourService.getTourStatistics();
            return successResponse(res, 'Lấy thống kê tour thành công', statistics);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...TourController,
    tourValidationRules,
    updateTourValidationRules,
    getAllToursQueryValidationRules
};