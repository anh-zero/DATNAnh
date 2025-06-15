const PartnerModel = require('../models/doitac_model');
const DiaDiemModel = require('../models/diadiem_model');
const pool = require('../config/db.config');

const PartnerService = {
    createPartner: async (partnerData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (partnerData.id_dia_diem) {
                const location = await DiaDiemModel.findById(partnerData.id_dia_diem, connection);
                if (!location) {
                    throw { statusCode: 400, message: `Địa điểm liên kết với ID ${partnerData.id_dia_diem} không tồn tại.` };
                }
            }

            if (partnerData.email) {
                const existingByEmail = await PartnerModel.findByEmail(partnerData.email, connection);
                if (existingByEmail) {
                    throw { statusCode: 409, message: "Email đã được sử dụng bởi một đối tác khác." };
                }
            }
            if (partnerData.ma_so_thue) {
                const existingByMST = await PartnerModel.findByMST(partnerData.ma_so_thue, connection);
                if (existingByMST) {
                    throw { statusCode: 409, message: "Mã số thuế đã được sử dụng bởi một đối tác khác." };
                }
            }

            const newPartner = await PartnerModel.create(partnerData, connection);
            await connection.commit();
            return newPartner;
        } catch (error) {
            await connection.rollback();
            console.error("Error in PartnerService.createPartner:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllPartners: async (filters, paginationOptions) => {
        try {
            const { limit = 10, page = 1, sortBy = 'ngay_tao', order = 'DESC' } = paginationOptions;
            const { searchTerm = '' /*, status = 'any' // REMOVED */ } = filters;
            const offset = (page - 1) * limit;

            const { partners, totalItems } = await PartnerModel.findAll({
                limit,
                offset,
                searchTerm,
                sortBy,
                order
            });

            const totalPages = Math.ceil(totalItems / limit);
            return {
                partners,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    limit: parseInt(limit)
                }
            };
        } catch (error) {
            console.error("Error in PartnerService.getAllPartners:", error);
            throw error;
        }
    },

    getPartnerById: async (id_doi_tac) => {
        try {
            const partner = await PartnerModel.findById(id_doi_tac);
            if (!partner) {
                throw { statusCode: 404, message: "Đối tác không tồn tại" };
            }
            return partner;
        } catch (error) {
            console.error("Error in PartnerService.getPartnerById:", error);
            throw error;
        }
    },

    findPartnerByEmail: async (email) => {
        try {
            return await PartnerModel.findByEmail(email);
        } catch (error) {
            console.error("Error in PartnerService.findPartnerByEmail:", error);
            throw error;
        }
    },

    findPartnerByMST: async (ma_so_thue) => {
        try {
            return await PartnerModel.findByMST(ma_so_thue);
        } catch (error) {
            console.error("Error in PartnerService.findPartnerByMST:", error);
            throw error;
        }
    },

    updatePartner: async (id_doi_tac, partnerData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const existingPartner = await PartnerModel.findById(id_doi_tac, connection);
            if (!existingPartner) {
                throw { statusCode: 404, message: "Đối tác không tồn tại" };
            }

            if (partnerData.id_dia_diem && partnerData.id_dia_diem !== existingPartner.id_dia_diem) {
                const location = await DiaDiemModel.findById(partnerData.id_dia_diem, connection);
                if (!location) {
                    throw { statusCode: 400, message: `Địa điểm liên kết với ID ${partnerData.id_dia_diem} không tồn tại.` };
                }
            }

            if (partnerData.email && partnerData.email !== existingPartner.email) {
                const otherPartnerWithEmail = await PartnerModel.findByEmail(partnerData.email, connection);
                if (otherPartnerWithEmail && otherPartnerWithEmail.id_doi_tac !== parseInt(id_doi_tac)) {
                    throw { statusCode: 409, message: "Email đã được sử dụng bởi một đối tác khác." };
                }
            }
            if (partnerData.ma_so_thue && partnerData.ma_so_thue !== existingPartner.ma_so_thue) {
                const otherPartnerWithMST = await PartnerModel.findByMST(partnerData.ma_so_thue, connection);
                if (otherPartnerWithMST && otherPartnerWithMST.id_doi_tac !== parseInt(id_doi_tac)) {
                    throw { statusCode: 409, message: "Mã số thuế đã được sử dụng bởi một đối tác khác." };
                }
            }

            const result = await PartnerModel.update(id_doi_tac, partnerData, connection);
            await connection.commit();

            if (result.affectedRows > 0) {
                const updatedPartner = await PartnerModel.findById(id_doi_tac, connection); // Fetch updated data
                return { message: "Cập nhật đối tác thành công.", partner: updatedPartner };
            }
            return { message: "Không có thông tin nào được cập nhật hoặc đối tác không tồn tại.", partner: null };

        } catch (error) {
            await connection.rollback();
            console.error("Error in PartnerService.updatePartner:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    deletePartner: async (id_doi_tac) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await PartnerModel.delete(id_doi_tac, connection);
            await connection.commit();
            if (result.affectedRows === 0) { // This case should ideally be caught by model if partner not found
                throw { statusCode: 404, message: "Không tìm thấy đối tác để xóa hoặc đã được xóa." };
            }
            return { message: "Xóa đối tác thành công." };
        } catch (error) {
            await connection.rollback();
            console.error("Error in PartnerService.deletePartner:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllDoiTac: async (options = {}) => {
        try {
            console.log("Received options in service:", options); // Debug log

            // Đảm bảo options có giá trị mặc định
            const opts = {
                limit: Number(options.limit) || 10,
                offset: Number(options.offset) || 0,
                searchTerm: options.searchTerm || ''
            };

            // Lấy danh sách đối tác
            const partners = await PartnerModel.findAll(opts);

            // Đếm tổng số đối tác
            const [countResult] = await PartnerModel._query("SELECT COUNT(*) as total FROM doitac");
            const totalCount = countResult[0]?.total || 0;

            // Trả về đúng định dạng mà controller mong đợi
            return {
                partners: partners || [],
                totalCount: totalCount
            };
        } catch (error) {
            console.error("Error in PartnerService.getAllDoiTac:", error);
            throw { statusCode: 500, message: "Lỗi khi lấy danh sách đối tác" };
        }
    },

    // Thêm method getPartnersByLocationId
getPartnersByLocationId: async (queryParams) => {
    try {
        const { id_dia_diem, limit, offset, sortBy, order } = queryParams;

        // ===== BƯỚC 1: KIỂM TRA SỰ TỒN TẠI CỦA ĐỊA ĐIỂM =====
        const location = await DiaDiemModel.findById(id_dia_diem);
        if (!location) {
            // Nếu không tìm thấy địa điểm,โยน lỗi 404
            throw { statusCode: 404, message: `Địa điểm với ID ${id_dia_diem} không tồn tại.` };
        }
        // =======================================================

        // Nếu địa điểm tồn tại, tiếp tục xử lý như cũ
        // Xây dựng truy vấn cơ sở
        let sql = `
            SELECT dt.*
            FROM doitac dt
            WHERE dt.id_dia_diem = ?
        `;

        // Đếm tổng số dòng
        const countSql = `SELECT COUNT(*) as total FROM doitac WHERE id_dia_diem = ?`;
        const [countResult] = await pool.query(countSql, [id_dia_diem]);
        const totalItems = countResult[0].total;

        // Thêm sắp xếp và phân trang
        sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;

        // Thực hiện truy vấn
        const [partners] = await pool.query(sql, [id_dia_diem, limit, offset]);

        return {
            partners,
            totalItems
        };
    } catch (error) {
        console.error("Error in PartnerService.getPartnersByLocationId:", error);
        throw error;
    }
}
};

module.exports = PartnerService;