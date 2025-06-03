const pool = require('../config/db.config');

const TourReviewModel = {
    _query: (sql, params, connection = null) => {
        const executor = connection || pool;
        return executor.query(sql, params);
    },

    // Client sẽ tạo đánh giá, admin chỉ quản lý
    // create: async (reviewData, connection = null) => { ... }

    findAll: async ({ limit, offset, id_san_pham_tour, id_lich_trinh_tour, id_khach_hang, id_dat_tour, diem_danh_gia, da_duyet, sortBy = 'dg.ngay_tao', order = 'DESC' }, connection = null) => {
        let selectClause = `SELECT
                                dg.id_danh_gia, dg.diem_danh_gia, dg.binh_luan,
                                dg.ngay_danh_gia, dg.da_duyet, dg.phan_hoi_quan_tri,
                                dg.ngay_tao, dg.ngay_cap_nhat,
                                kh.ho_ten as ten_khach_hang, kh.email_lien_he as email_khach_hang,
                                dt.id_dat_tour,
                                lt.id_lich_trinh_tour, lt.ngay_khoi_hanh,
                                spt.id_san_pham_tour, spt.ten_tour
                            FROM danhgiatour dg
                            JOIN khachhang kh ON dg.id_khach_hang = kh.id_khach_hang
                            JOIN dattour dt ON dg.id_dat_tour = dt.id_dat_tour
                            JOIN lichtrinhtour lt ON dg.id_lich_trinh_tour = lt.id_lich_trinh_tour
                            JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour`;
        let whereClause = " WHERE 1=1";
        const params = [];

        if (id_san_pham_tour) {
            whereClause += ` AND spt.id_san_pham_tour = ?`;
            params.push(id_san_pham_tour);
        }
        if (id_lich_trinh_tour) {
            whereClause += ` AND dg.id_lich_trinh_tour = ?`;
            params.push(id_lich_trinh_tour);
        }
        if (id_khach_hang) {
            whereClause += ` AND dg.id_khach_hang = ?`;
            params.push(id_khach_hang);
        }
        if (id_dat_tour) {
            whereClause += ` AND dg.id_dat_tour = ?`;
            params.push(id_dat_tour);
        }
        if (diem_danh_gia !== undefined) {
            whereClause += ` AND dg.diem_danh_gia = ?`;
            params.push(diem_danh_gia);
        }
        if (da_duyet !== undefined) {
            whereClause += ` AND dg.da_duyet = ?`;
            params.push(da_duyet);
        }

        const allowedSortColumns = ['dg.ngay_danh_gia', 'dg.ngay_tao', 'dg.diem_danh_gia', 'dg.da_duyet', 'spt.ten_tour', 'kh.ho_ten'];
        let validSortBy = 'dg.ngay_tao';
        if (allowedSortColumns.includes(sortBy)) {
            validSortBy = sortBy;
        }

        const sortOrder = (order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const countSql = `SELECT COUNT(dg.id_danh_gia) as totalItems FROM danhgiatour dg JOIN khachhang kh ON dg.id_khach_hang = kh.id_khach_hang JOIN dattour dt ON dg.id_dat_tour = dt.id_dat_tour JOIN lichtrinhtour lt ON dg.id_lich_trinh_tour = lt.id_lich_trinh_tour JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour ${whereClause}`;
        const dataSql = `${selectClause} ${whereClause} ORDER BY ${validSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        const dataParams = [...params, parseInt(limit), parseInt(offset)];

        try {
            const [countRows] = await TourReviewModel._query(countSql, params, connection);
            const [rows] = await TourReviewModel._query(dataSql, dataParams, connection);
            return { reviews: rows, totalItems: countRows[0].totalItems };
        } catch (error) {
            console.error("Error in TourReviewModel.findAll:", error);
            throw error;
        }
    },

    findById: async (id_danh_gia, connection = null) => {
        const sql = `SELECT
                        dg.*,
                        kh.ho_ten as ten_khach_hang, kh.email_lien_he as email_khach_hang,
                        dt.id_dat_tour,
                        lt.id_lich_trinh_tour, lt.ngay_khoi_hanh,
                        spt.id_san_pham_tour, spt.ten_tour
                     FROM danhgiatour dg
                     JOIN khachhang kh ON dg.id_khach_hang = kh.id_khach_hang
                     JOIN dattour dt ON dg.id_dat_tour = dt.id_dat_tour
                     JOIN lichtrinhtour lt ON dg.id_lich_trinh_tour = lt.id_lich_trinh_tour
                     JOIN sanphamtour spt ON lt.id_san_pham_tour = spt.id_san_pham_tour
                     WHERE dg.id_danh_gia = ?`;
        try {
            const [rows] = await TourReviewModel._query(sql, [id_danh_gia], connection);
            return rows[0];
        } catch (error) {
            console.error("Error in TourReviewModel.findById:", error);
            throw error;
        }
    },

    update: async (id_danh_gia, reviewData, connection = null) => {
        // Admin chủ yếu cập nhật da_duyet và phan_hoi_quan_tri
        const fields = [];
        const values = [];
        const allowedFields = ['da_duyet', 'phan_hoi_quan_tri', 'diem_danh_gia', 'binh_luan']; // Cho phép admin sửa cả điểm và bình luận nếu cần

        Object.keys(reviewData).forEach(key => {
            if (allowedFields.includes(key) && reviewData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(reviewData[key]);
            }
        });

        if (fields.length === 0) {
            return { affectedRows: 0, message: "Không có trường thông tin hợp lệ để cập nhật." };
        }

        values.push(id_danh_gia);
        const sql = `UPDATE danhgiatour SET ${fields.join(', ')}, ngay_cap_nhat = NOW() WHERE id_danh_gia = ?`;

        try {
            const [result] = await TourReviewModel._query(sql, values, connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourReviewModel.update for id ${id_danh_gia}:`, error);
            throw error;
        }
    },

    delete: async (id_danh_gia, connection = null) => {
        const sql = "DELETE FROM danhgiatour WHERE id_danh_gia = ?";
        try {
            const [result] = await TourReviewModel._query(sql, [id_danh_gia], connection);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            console.error(`Error in TourReviewModel.delete for id ${id_danh_gia}:`, error);
            throw error;
        }
    }
};
module.exports = TourReviewModel;
