const partnerService = require('../services/doitac_service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/api_response');
const { body, param, query } = require('express-validator');

const createPartnerValidationRules = () => [
    body('ten_doi_tac').notEmpty().withMessage('Tên đối tác không được để trống.')
        .isString().withMessage('Tên đối tác phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên đối tác phải từ 2 đến 255 ký tự.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không quá 100 ký tự.')
        .custom(async (email) => {
            if (email) {
                const existingPartner = await partnerService.findPartnerByEmail(email);
                if (existingPartner) {
                    return Promise.reject('Email này đã được sử dụng bởi một đối tác khác.');
                }
            }
        }),
    body('so_dien_thoai').optional({ checkFalsy: true })
        .isString().withMessage('Số điện thoại phải là chuỗi.')
        .isLength({ max: 20 }).withMessage('Số điện thoại không quá 20 ký tự.'),
    body('dia_chi_doi_tac').optional({ checkFalsy: true })
        .isString().withMessage('Địa chỉ đối tác phải là chuỗi.')
        .isLength({ max: 500 }).withMessage('Địa chỉ đối tác không quá 500 ký tự.'),
    body('ma_so_thue').optional({ checkFalsy: true })
        .isString().withMessage('Mã số thuế phải là chuỗi.')
        .isLength({ max: 45 }).withMessage('Mã số thuế không quá 45 ký tự.')
        .custom(async (ma_so_thue) => {
            if (ma_so_thue) {
                const existingPartner = await partnerService.findPartnerByMST(ma_so_thue);
                if (existingPartner) {
                    return Promise.reject('Mã số thuế này đã được sử dụng bởi một đối tác khác.');
                }
            }
        }),
    body('id_dia_diem').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ.'),
    body('mo_ta_chi_tiet_doi_tac').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết đối tác phải là chuỗi.')
];

const updatePartnerValidationRules = () => [
    param('id_doi_tac').isInt({ min: 1 }).withMessage('ID đối tác không hợp lệ.'),
    body('ten_doi_tac').optional().notEmpty().withMessage('Tên đối tác không được để trống.')
        .isString().withMessage('Tên đối tác phải là chuỗi.')
        .isLength({ min: 2, max: 255 }).withMessage('Tên đối tác phải từ 2 đến 255 ký tự.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.')
        .isLength({ max: 100 }).withMessage('Email không quá 100 ký tự.')
        .custom(async (email, { req }) => {
            if (email) {
                const partnerId = req.params.id_doi_tac;
                const existingPartner = await partnerService.findPartnerByEmail(email);
                if (existingPartner && existingPartner.id_doi_tac !== parseInt(partnerId)) {
                    return Promise.reject('Email này đã được sử dụng bởi một đối tác khác.');
                }
            }
        }),
    body('so_dien_thoai').optional({ checkFalsy: true })
        .isString().withMessage('Số điện thoại phải là chuỗi.')
        .isLength({ max: 20 }).withMessage('Số điện thoại không quá 20 ký tự.'),
    body('dia_chi_doi_tac').optional({ checkFalsy: true })
        .isString().withMessage('Địa chỉ đối tác phải là chuỗi.')
        .isLength({ max: 500 }).withMessage('Địa chỉ đối tác không quá 500 ký tự.'),
    body('ma_so_thue').optional({ checkFalsy: true })
        .isString().withMessage('Mã số thuế phải là chuỗi.')
        .isLength({ max: 45 }).withMessage('Mã số thuế không quá 45 ký tự.')
        .custom(async (ma_so_thue, { req }) => {
            if (ma_so_thue) {
                const partnerId = req.params.id_doi_tac;
                const existingPartner = await partnerService.findPartnerByMST(ma_so_thue);
                if (existingPartner && existingPartner.id_doi_tac !== parseInt(partnerId)) {
                    return Promise.reject('Mã số thuế này đã được sử dụng bởi một đối tác khác.');
                }
            }
        }),
    body('id_dia_diem').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('ID địa điểm không hợp lệ.'),
    body('mo_ta_chi_tiet_doi_tac').optional({ checkFalsy: true }).isString().withMessage('Mô tả chi tiết đối tác phải là chuỗi.')
];

const getAllPartnersQueryValidationRules = () => [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('searchTerm').optional().isString().trim(),
    query('sortBy').optional().isIn(['id_doi_tac', 'ten_doi_tac', 'email', 'ngay_tao', 'ma_so_thue']),
    query('order').optional().isIn(['ASC', 'DESC'])
];


const DoiTacController = {
    createPartner: async (req, res, next) => {
        try {
            // Map client side field names to database fields if needed
            const partnerData = {
                ...req.body,
                // Rename dia_chi to correct database field if client sends different field
                dia_chi: req.body.dia_chi || req.body.dia_chi_doi_tac
            };

            // Remove any fields that don't exist in database
            delete partnerData.dia_chi_doi_tac;

            const newPartner = await partnerService.createPartner(partnerData);

            return res.status(201).json({
                success: true,
                message: 'Đối tác đã được tạo thành công',
                data: newPartner
            });
        } catch (error) {
            console.error("Error in createPartner controller:", error);
            next(error);
        }
    },

    getAllPartners: async (req, res, next) => {
        try {
            // Set default values và đảm bảo là số
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search || '';

            const offset = (page - 1) * limit;

            const options = {
                limit: limit,
                offset: offset,
                searchTerm: search
            };

            console.log("Options passed to service:", options); // Debug log

            const result = await partnerService.getAllDoiTac(options) || {};
            const partners = result.partners || [];
            const totalCount = result.totalCount || 0;

            return paginatedResponse({
                res,
                message: 'Lấy danh sách đối tác thành công.',
                data: partners,
                currentPage: page,
                totalCount,
                limit
            });
        } catch (error) {
            console.error("Error in getAllDoiTac controller:", error);
            return next(error);
        }
    },

    getPartnerById: async (req, res, next) => {
        try {
            const partner = await partnerService.getPartnerById(req.params.id_doi_tac);
            return successResponse(res, 'Lấy thông tin đối tác thành công.', partner);
        } catch (error) {
            next(error);
        }
    },

    updatePartner: async (req, res, next) => {
        try {
            const result = await partnerService.updatePartner(req.params.id_doi_tac, req.body);
            return successResponse(res, result.message, result.partner);
        } catch (error) {
            next(error);
        }
    },

    deletePartner: async (req, res, next) => {
        try {
            const result = await partnerService.deletePartner(req.params.id_doi_tac);
            return successResponse(res, result.message);
        } catch (error) {
            next(error);
        }
    },

    getPartnersByLocationId: async (req, res, next) => {
        try {
            const { id_dia_diem } = req.params;
            const { page = 1, limit = 10, sortBy, order } = req.query;

            const queryParams = {
                id_dia_diem: parseInt(id_dia_diem),
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                sortBy: sortBy || 'ten_doi_tac',
                order: order || 'ASC'
            };

            const result = await partnerService.getPartnersByLocationId(queryParams);

return paginatedResponse({
            res: res,
            message: `Lấy danh sách đối tác tại địa điểm ID ${id_dia_diem} thành công`,
            data: result.partners,
            currentPage: parseInt(page),
            totalCount: result.totalItems,
            limit: parseInt(limit)
        });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    ...DoiTacController,
    createPartnerValidationRules,
    updatePartnerValidationRules,
    getAllPartnersQueryValidationRules
};