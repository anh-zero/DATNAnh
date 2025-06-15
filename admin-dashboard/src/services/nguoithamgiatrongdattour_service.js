const BookingParticipantModel = require('../models/nguoithamgiatrongdattour_model');
const BookingModel = require('../models/dattour_model');
const pool = require('../config/db.config');

const BookingParticipantService = {
    // Lấy danh sách người tham gia theo ID đơn đặt tour
    getParticipantsByBookingId: async (id_dat_tour) => {
        try {
            // Kiểm tra đơn đặt tour tồn tại
            const booking = await BookingModel.findById(id_dat_tour);
            if (!booking) {
                throw { statusCode: 404, message: `Đơn đặt tour với ID ${id_dat_tour} không tồn tại.` };
            }

            return await BookingParticipantModel.findByBookingId(id_dat_tour);
        } catch (error) {
            console.error("Error in BookingParticipantService.getParticipantsByBookingId:", error);
            throw error;
        }
    },

    // Tạo một người tham gia mới
    createParticipant: async (participantData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Kiểm tra đơn đặt tour tồn tại
            const booking = await BookingModel.findById(participantData.id_dat_tour, connection);
            if (!booking) {
                throw { statusCode: 404, message: `Đơn đặt tour với ID ${participantData.id_dat_tour} không tồn tại.` };
            }

            const newParticipant = await BookingParticipantModel.create(participantData, connection);

            await connection.commit();
            return newParticipant;
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingParticipantService.createParticipant:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // Tạo nhiều người tham gia cùng lúc
    createMultipleParticipants: async (id_dat_tour, participants) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Kiểm tra đơn đặt tour tồn tại
            const booking = await BookingModel.findById(id_dat_tour, connection);
            if (!booking) {
                throw { statusCode: 404, message: `Đơn đặt tour với ID ${id_dat_tour} không tồn tại.` };
            }

            const result = await BookingParticipantModel.createMultiple(id_dat_tour, participants, connection);

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingParticipantService.createMultipleParticipants:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // Cập nhật thông tin người tham gia
    updateParticipant: async (id_nguoi_tham_gia, participantData) => {
        try {
            // Không cần transaction vì chỉ cập nhật một bản ghi
            return await BookingParticipantModel.update(id_nguoi_tham_gia, participantData);
        } catch (error) {
            console.error("Error in BookingParticipantService.updateParticipant:", error);
            throw error;
        }
    },

    // Xóa một người tham gia
    deleteParticipant: async (id_nguoi_tham_gia) => {
        try {
            return await BookingParticipantModel.delete(id_nguoi_tham_gia);
        } catch (error) {
            console.error("Error in BookingParticipantService.deleteParticipant:", error);
            throw error;
        }
    },

    // Xóa tất cả người tham gia của một đơn đặt tour
    deleteAllParticipantsByBookingId: async (id_dat_tour) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Kiểm tra đơn đặt tour tồn tại
            const booking = await BookingModel.findById(id_dat_tour, connection);
            if (!booking) {
                throw { statusCode: 404, message: `Đơn đặt tour với ID ${id_dat_tour} không tồn tại.` };
            }

            const result = await BookingParticipantModel.deleteByBookingId(id_dat_tour, connection);

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error("Error in BookingParticipantService.deleteAllParticipantsByBookingId:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = BookingParticipantService;