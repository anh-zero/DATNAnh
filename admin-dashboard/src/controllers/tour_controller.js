// File: src/controllers/tour_controller.js
// (Cập nhật tourValidationRules và updateTourValidationRules để thêm validate cho ghi_chu)
const tourService = require('../services/tour_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
// const handleValidationErrors = require('../middlewares/validation_middleware'); // Đã được dùng ở routes

const tourValidationRules = () => [
    body('ten_tour').notEmpty().withMessage('Tên tour không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên tour không quá 255 ký tự.'),
    body('mo_ta_chi_tiet').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết phải là một chuỗi.'),
    body('thoi_gian_du_kien').optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Thời gian dự kiến không quá 50 ký tự.'),

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
                // Thêm validate cho ghi_chu
                if (partner.ghi_chu !== undefined && partner.ghi_chu !== null && typeof partner.ghi_chu !== 'string') {
                    throw new Error('Ghi chú đối tác (nếu có) phải là một chuỗi.');
                }
            }
        }
        return true;
    })
];

const updateTourValidationRules = () => [
    param('id_san_pham_tour').isInt({ min: 1 }).withMessage('ID sản phẩm tour không hợp lệ.'),
    body('ten_tour').optional().notEmpty().withMessage('Tên tour không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên tour không quá 255 ký tự.'),
    body('mo_ta_chi_tiet').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết phải là một chuỗi.'),
    body('thoi_gian_du_kien').optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Thời gian dự kiến không quá 50 ký tự.'),
    body('url_anh_bia').optional({ checkFalsy: true })
        .custom((value) => {
            if (value === null || typeof value === 'string') return true;
            throw new Error('URL ảnh bìa không hợp lệ (phải là chuỗi hoặc null).');
        }),
    body('partners').optional().custom((value) => { // Tương tự như tourValidationRules
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
                // Thêm validate cho ghi_chu
                if (partner.ghi_chu !== undefined && partner.ghi_chu !== null && typeof partner.ghi_chu !== 'string') {
                    throw new Error('Ghi chú đối tác (nếu có) phải là một chuỗi.');
                }
            }
        }
        return true;
    })
];

// ... (các hàm controller khác: createTour, getAllTours, getTourById, updateTour, deleteTour, getTourStatistics, getAllToursQueryValidationRules)
// giữ nguyên như đã cung cấp ở lần cập nhật trước
const createTour = async (req, res, next) => {
    try {
        const newTour = await tourService.createTour(req.body, req.file);
        return successResponse(res, 'Tạo sản phẩm tour thành công.', newTour, 201);
    } catch (error) {
        next(error);
    }
};
const getAllTours = async (req, res, next) => {
    try {
        const { page, limit, searchTerm, sortBy, order } = req.query;
        const filters = { searchTerm, sortBy, order };
        const paginationOptions = { page, limit };
        const result = await tourService.getAllTours(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách sản phẩm tour thành công.', result.tours, result.pagination);
    } catch (error) {
        next(error);
    }
};
const getTourById = async (req, res, next) => {
    try {
        const tour = await tourService.getTourById(req.params.id_san_pham_tour);
        return successResponse(res, 'Lấy thông tin sản phẩm tour thành công.', tour);
    } catch (error) {
        next(error);
    }
};
const updateTour = async (req, res, next) => {
    try {
        const result = await tourService.updateTour(req.params.id_san_pham_tour, req.body, req.file);
        return successResponse(res, result.message, result.tour);
    } catch (error) {
        next(error);
    }
};
const deleteTour = async (req, res, next) => {
    try {
        const result = await tourService.deleteTour(req.params.id_san_pham_tour);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};
const getTourStatistics = async (req, res, next) => {
    try {
        const stats = await tourService.getTourStatistics();
        return successResponse(res, 'Lấy thống kê tour thành công.', stats);
    } catch (error) {
        next(error);
    }
};
const getAllToursQueryValidationRules = () => [ /* ... giữ nguyên ... */
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sortBy').optional().isIn(['ten_tour', 'ngay_tao', 'thoi_gian_du_kien']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

module.exports = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getTourStatistics,
    tourValidationRules,
    updateTourValidationRules,
    getAllToursQueryValidationRules
};