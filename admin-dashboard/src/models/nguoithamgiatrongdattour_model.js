const pool = require('../config/db.config');

const BookingParticipantModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    create: async (participantData, connection = null) => {
        const {
            id_dat_tour,
            ho_ten,
            ngay_sinh = null,
            ghi_chu = null // Theo EER, bảng này có cột ghi_chu
        } = participantData;

        const formattedNgaySinh = ngay_sinh ? new Date(ngay_sinh).toISOString().slice(0, 10) : null;

        const sql = `INSERT INTO nguoithamgiatrongdattour
                        (id_dat_tour, ho_ten, ngay_sinh, ghi_chu)
                     VALUES (?, ?, ?, ?)`;
        try {
            const [result] = await BookingParticipantModel._query(sql, [
                id_dat_tour, ho_ten, formattedNgaySinh, ghi_chu
            ], connection);
            return { id_nguoi_tham_gia: result.insertId, ...participantData, ngay_sinh: formattedNgaySinh };
        } catch (error) {
            console.error("Error in BookingParticipantModel.create:", error);
            throw error;
        }
    },

    createMultiple: async (id_dat_tour, participants, connection = null) => {
        if (!participants || participants.length === 0) {
            return { affectedRows: 0, insertId: null, count: 0 };
        }
        const sql = `INSERT INTO nguoithamgiatrongdattour
                        (id_dat_tour, ho_ten, ngay_sinh, ghi_chu)
                     VALUES ?`;
        const values = participants.map(p => [
            id_dat_tour,
            p.ho_ten,
            p.ngay_sinh ? new Date(p.ngay_sinh).toISOString().slice(0, 10) : null,
            p.ghi_chu || null
        ]);

        try {
            const [result] = await BookingParticipantModel._query(sql, [values], connection);
            return { affectedRows: result.affectedRows, insertId: result.insertId, count: participants.length };
        } catch (error) {
            console.error("Error in BookingParticipantModel.createMultiple:", error);
            throw error;
        }
    },

    findByBookingId: async (id_dat_tour, connection = null) => {
        const sql = `SELECT id_nguoi_tham_gia, ho_ten, ngay_sinh, ghi_chu
                     FROM nguoithamgiatrongdattour WHERE id_dat_tour = ?`;
        try {
            const [rows] = await BookingParticipantModel._query(sql, [id_dat_tour], connection);
            return rows;
        } catch (error) {
            console.error("Error in BookingParticipantModel.findByBookingId:", error);
            throw error;
        }
    },

    update: async (id_nguoi_tham_gia, participantData, connection = null) => {
        const {
            ho_ten,
            ngay_sinh = null,
            ghi_chu = null
        } = participantData;
        const formattedNgaySinh = ngay_sinh ? new Date(ngay_sinh).toISOString().slice(0, 10) : null;

        const sql = `UPDATE nguoithamgiatrongdattour
                     SET ho_ten = ?, ngay_sinh = ?, ghi_chu = ?
                     WHERE id_nguoi_tham_gia = ?`;
        try {
            const [result] = await BookingParticipantModel._query(sql, [
                ho_ten, formattedNgaySinh, ghi_chu, id_nguoi_tham_gia
            ], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error("Error in BookingParticipantModel.update:", error);
            throw error;
        }
    },

    delete: async (id_nguoi_tham_gia, connection = null) => {
        const sql = `DELETE FROM nguoithamgiatrongdattour WHERE id_nguoi_tham_gia = ?`;
        try {
            const [result] = await BookingParticipantModel._query(sql, [id_nguoi_tham_gia], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error("Error in BookingParticipantModel.delete:", error);
            throw error;
        }
    },

    deleteByBookingId: async (id_dat_tour, connection = null) => {
        const sql = `DELETE FROM nguoithamgiatrongdattour WHERE id_dat_tour = ?`;
        try {
            const [result] = await BookingParticipantModel._query(sql, [id_dat_tour], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error("Error in BookingParticipantModel.deleteByBookingId:", error);
            throw error;
        }
    }
};
module.exports = BookingParticipantModel;