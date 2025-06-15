const BookingParticipantService = require('../services/nguoithamgiatrongdattour_service');
const { successResponse, errorResponse } = require('../utils/api_response');
const { body, param } = require('express-validator');

// Validation rules
const participantValidationRules = () => [
    body('id_dat_tour')
        .if((value, { req }) => !req.params.id_dat_tour)
        .isInt({ min: 1 }).withMessage('ID đơn đặt tour phải là số nguyên dương'),
    body('ho_ten')
        .notEmpty().withMessage('Tên người tham gia không được để trống')
        .isString().withMessage('Tên người tham gia phải là chuỗi')
        .isLength({ min: 2, max: 100 }).withMessage('Tên người tham gia phải từ 2 đến 100 ký tự'),
    body('ngay_sinh')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().toDate().withMessage('Ngày sinh không hợp lệ'),
    body('ghi_chu')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Ghi chú phải là chuỗi')
];

const BookingParticipantController = {
    // Phương thức test cơ bản
    getAll: async (req, res, next) => {
        try {
            return successResponse(res, 'API endpoint hoạt động bình thường', []);
        } catch (error) {
            next(error);
        }
    },

    // Lấy tất cả người tham gia theo ID đơn đặt tour
    getParticipantsByBookingId: async (req, res, next) => {
        try {
            const { id_dat_tour } = req.params;
            const participants = await BookingParticipantService.getParticipantsByBookingId(id_dat_tour);
            return successResponse(res, 'Lấy danh sách người tham gia thành công', participants);
        } catch (error) {
            next(error);
        }
    },

    // Thêm một người tham gia
    createParticipant: async (req, res, next) => {
        try {
            const newParticipant = await BookingParticipantService.createParticipant(req.body);
            return successResponse(res, 'Thêm người tham gia thành công', newParticipant, 201);
        } catch (error) {
            next(error);
        }
    },

    // Thêm nhiều người tham gia cùng lúc
    createMultipleParticipants: async (req, res, next) => {
        try {
            const { id_dat_tour } = req.params;
            const { participants } = req.body;

            if (!Array.isArray(participants) || participants.length === 0) {
                return errorResponse(res, 'Danh sách người tham gia không hợp lệ', 400);
            }

            const result = await BookingParticipantService.createMultipleParticipants(id_dat_tour, participants);
            return successResponse(res, `Đã thêm ${result.count} người tham gia thành công`, result, 201);
        } catch (error) {
            next(error);
        }
    },

    // Cập nhật thông tin người tham gia
    updateParticipant: async (req, res, next) => {
        try {
            const { id_nguoi_tham_gia } = req.params;
            const result = await BookingParticipantService.updateParticipant(id_nguoi_tham_gia, req.body);

            if (result.affectedRows > 0) {
                return successResponse(res, 'Cập nhật thông tin người tham gia thành công', result);
            }
            return errorResponse(res, 'Không tìm thấy người tham gia hoặc không có thay đổi', 404);
        } catch (error) {
            next(error);
        }
    },

    // Xóa một người tham gia
    deleteParticipant: async (req, res, next) => {
        try {
            const { id_nguoi_tham_gia } = req.params;
            const result = await BookingParticipantService.deleteParticipant(id_nguoi_tham_gia);

            if (result.affectedRows > 0) {
                return successResponse(res, 'Xóa người tham gia thành công');
            }
            return errorResponse(res, 'Không tìm thấy người tham gia', 404);
        } catch (error) {
            next(error);
        }
    },

    // Xóa tất cả người tham gia của một đơn đặt tour
    deleteAllParticipantsByBookingId: async (req, res, next) => {
        try {
            const { id_dat_tour } = req.params;
            const result = await BookingParticipantService.deleteAllParticipantsByBookingId(id_dat_tour);
            return successResponse(res, `Đã xóa ${result.affectedRows} người tham gia`);
        } catch (error) {
            next(error);
        }
    },

    // Thêm người tham gia cho một đơn đặt tour
    createParticipantForBooking: async (req, res, next) => {
        try {
            const { id_dat_tour } = req.params;

            // Kết hợp ID đặt tour từ URL với dữ liệu người tham gia
            const participantData = {
                ...req.body,
                id_dat_tour: parseInt(id_dat_tour)
            };

            const newParticipant = await BookingParticipantService.createParticipant(participantData);
            return successResponse(res, 'Thêm người tham gia thành công', newParticipant, 201);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    BookingParticipantController,
    participantValidationRules
};