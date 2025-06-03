const PartnerModel = require('../models/partner_model');
const pool = require('../config/db.config'); // Dùng cho transaction nếu cần

const createPartner = async (partnerData) => {
    if (partnerData.email) {
        const existingByEmail = await PartnerModel.findByEmail(partnerData.email);
        if (existingByEmail) {
            throw { statusCode: 409, message: 'Email đối tác đã tồn tại.' };
        }
    }
    if (partnerData.ma_so_thue) {
        const existingByTaxCode = await PartnerModel.findByTaxCode(partnerData.ma_so_thue);
        if (existingByTaxCode) {
            throw { statusCode: 409, message: 'Mã số thuế đối tác đã tồn tại.' };
        }
    }
    return PartnerModel.create(partnerData);
};

const getAllPartners = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions; // Mặc định limit 10 cho danh sách, có thể tăng khi dùng cho dropdown
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { searchTerm, sortBy, order } = filters;

    const { partners, totalItems } = await PartnerModel.findAll({
        limit: parseInt(limit),
        offset: offset,
        searchTerm,
        sortBy,
        order
    });
    return {
        partners,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const getPartnerById = async (id_doi_tac) => {
    const partner = await PartnerModel.findById(id_doi_tac);
    if (!partner) {
        throw { statusCode: 404, message: 'Đối tác không tồn tại.' };
    }
    return partner;
};

const updatePartner = async (id_doi_tac, partnerData) => {
    const partner = await PartnerModel.findById(id_doi_tac);
    if (!partner) {
        throw { statusCode: 404, message: 'Đối tác không tồn tại.' };
    }

    if (partnerData.email && partnerData.email !== partner.email) {
        const existingByEmail = await PartnerModel.findByEmail(partnerData.email);
        if (existingByEmail && existingByEmail.id_doi_tac !== parseInt(id_doi_tac)) {
            throw { statusCode: 409, message: 'Email đối tác đã tồn tại cho đối tác khác.' };
        }
    }
    if (partnerData.ma_so_thue && partnerData.ma_so_thue !== partner.ma_so_thue) {
        const existingByTaxCode = await PartnerModel.findByTaxCode(partnerData.ma_so_thue);
        if (existingByTaxCode && existingByTaxCode.id_doi_tac !== parseInt(id_doi_tac)) {
            throw { statusCode: 409, message: 'Mã số thuế đối tác đã tồn tại cho đối tác khác.' };
        }
    }

    const result = await PartnerModel.update(id_doi_tac, partnerData);
    if (result.affectedRows === 0 && !Object.keys(partnerData).length) {
        return { message: 'Không có thông tin nào được thay đổi.' };
    }
    if (result.affectedRows === 0) {
        // throw { statusCode: 400, message: 'Cập nhật đối tác không thành công hoặc không có thay đổi.' };
    }
    return { message: 'Cập nhật thông tin đối tác thành công.' };
};

const deletePartner = async (id_doi_tac) => {
    const partner = await PartnerModel.findById(id_doi_tac);
    if (!partner) {
        throw { statusCode: 404, message: 'Đối tác không tồn tại.' };
    }
    // Logic kiểm tra liên kết với tour đã được thêm vào model.delete
    const result = await PartnerModel.delete(id_doi_tac);
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Xóa đối tác không thành công.' };
    }
    return { message: 'Đối tác đã được xóa.' };
};

module.exports = {
    createPartner,
    getAllPartners,
    getPartnerById,
    updatePartner,
    deletePartner
};