const pool = require('../config/db.config');

const TourPartnerModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    addPartnerToTour: async (id_san_pham_tour, id_doi_tac, loai_hop_tac = null, ghi_chu = null, connection = null) => { // Thêm ghi_chu
        const sql = `INSERT INTO sanphamtour_doitac (id_san_pham_tour, id_doi_tac, loai_hop_tac, ghi_chu)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE loai_hop_tac = VALUES(loai_hop_tac), ghi_chu = VALUES(ghi_chu)`; // Cập nhật cả ghi_chu
        try {
            const [result] = await TourPartnerModel._query(sql, [id_san_pham_tour, id_doi_tac, loai_hop_tac, ghi_chu], connection);
            return result;
        } catch (error) {
            console.error("Error in TourPartnerModel.addPartnerToTour:", error);
            throw error;
        }
    },

    removePartnerFromTour: async (id_san_pham_tour, id_doi_tac, connection = null) => {
        const sql = `DELETE FROM sanphamtour_doitac WHERE id_san_pham_tour = ? AND id_doi_tac = ?`;
        try {
            const [result] = await TourPartnerModel._query(sql, [id_san_pham_tour, id_doi_tac], connection);
            return result;
        } catch (error) {
            console.error("Error in TourPartnerModel.removePartnerFromTour:", error);
            throw error;
        }
    },

    getPartnersByTourId: async (id_san_pham_tour, connection = null) => {
        const sql = `SELECT dt.id_doi_tac, dt.ten_doi_tac, std.loai_hop_tac, std.ghi_chu
                     FROM sanphamtour_doitac std
                     JOIN doitac dt ON std.id_doi_tac = dt.id_doi_tac
                     WHERE std.id_san_pham_tour = ?`; // Thêm ghi_chu vào SELECT
        try {
            const [rows] = await TourPartnerModel._query(sql, [id_san_pham_tour], connection);
            return rows;
        } catch (error) {
            console.error("Error in TourPartnerModel.getPartnersByTourId:", error);
            throw error;
        }
    },

    updateTourPartners: async (id_san_pham_tour, partnersData, connection = null) => {
        // partnersData là một mảng các object: [{ id_doi_tac: 1, loai_hop_tac: 'Khách sạn', ghi_chu: 'ABC'}, ...]
        const deleteSql = "DELETE FROM sanphamtour_doitac WHERE id_san_pham_tour = ?";
        await TourPartnerModel._query(deleteSql, [id_san_pham_tour], connection);

        if (partnersData && partnersData.length > 0) {
            const insertSql = "INSERT INTO sanphamtour_doitac (id_san_pham_tour, id_doi_tac, loai_hop_tac, ghi_chu) VALUES ?"; // Thêm ghi_chu
            const values = partnersData.map(p => [id_san_pham_tour, p.id_doi_tac, p.loai_hop_tac || null, p.ghi_chu || null]); // Thêm ghi_chu
            await TourPartnerModel._query(insertSql, [values], connection);
        }
        return { message: "Cập nhật đối tác cho tour thành công." };
    }
};
module.exports = TourPartnerModel;