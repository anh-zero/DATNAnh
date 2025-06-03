const partnerService = require('../services/partner_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middlewares/validation_middleware');

const createPartnerValidationRules = () => [
    body('ten_doi_tac').notEmpty().withMessage('Tên đối tác không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên đối tác không quá 255 ký tự.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không quá 100 ký tự.'),
    body('so_dien_thoai').optional({ checkFalsy: true })
        .isLength({ max: 20 }).withMessage('Số điện thoại không quá 20 ký tự.'),
    body('ma_so_thue').optional({ checkFalsy: true })
        .isLength({ max: 45 }).withMessage('Mã số thuế không quá 45 ký tự.')
];

const updatePartnerValidationRules = () => [
    param('id_doi_tac').isInt({ min: 1 }).withMessage('ID đối tác không hợp lệ.'),
    body('ten_doi_tac').optional().notEmpty().withMessage('Tên đối tác không được để trống.')
        .isLength({ max: 255 }).withMessage('Tên đối tác không quá 255 ký tự.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không quá 100 ký tự.'),
    // ... thêm các rules khác
];

const getAllPartnersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(), // Cho phép lấy nhiều hơn cho dropdown
    query('sortBy').optional().isIn(['ten_doi_tac', 'ngay_tao', 'email']),
    query('order').optional().isIn(['ASC', 'DESC'])
];

const createPartner = async (req, res, next) => {
    try {
        const newPartner = await partnerService.createPartner(req.body);
        return successResponse(res, 'Tạo đối tác thành công.', newPartner, 201);
    } catch (error) {
        next(error);
    }
};

const getAllPartners = async (req, res, next) => {
    try {
        const { page, limit, searchTerm, sortBy, order } = req.query;
        const filters = { searchTerm, sortBy, order };
        const paginationOptions = { page, limit };
        const result = await partnerService.getAllPartners(filters, paginationOptions);
        return paginatedResponse(res, 'Lấy danh sách đối tác thành công.', result.partners, result.pagination);
    } catch (error) {
        next(error);
    }
};

const getPartnerById = async (req, res, next) => {
    try {
        const partner = await partnerService.getPartnerById(req.params.id_doi_tac);
        return successResponse(res, 'Lấy thông tin đối tác thành công.', partner);
    } catch (error) {
        next(error);
    }
};

const updatePartner = async (req, res, next) => {
    try {
        const result = await partnerService.updatePartner(req.params.id_doi_tac, req.body);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

const deletePartner = async (req, res, next) => {
    try {
        const result = await partnerService.deletePartner(req.params.id_doi_tac);
        return successResponse(res, result.message);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPartner,
    getAllPartners,
    getPartnerById,
    updatePartner,
    deletePartner,
    createPartnerValidationRules,
    updatePartnerValidationRules,
    getAllPartnersQueryValidationRules
};