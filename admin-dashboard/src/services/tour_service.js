const pool = require('../config/db.config');
const TourModel = require('../models/tour_model');
const TourScheduleModel = require('../models/tour_schedule_model');
const PartnerModel = require('../models/partner_model');
const TourPartnerModel = require('../models/tour_partner_model');
const fs = require('fs');
const path = require('path');

const createTour = async (tourData, tourImageFile) => {
    const tourToCreate = { ...tourData };
    let partnersData = tourData.partners;

    if (typeof partnersData === 'string') {
        try {
            partnersData = JSON.parse(partnersData);
        } catch (e) {
            if (tourImageFile) { try { fs.unlinkSync(tourImageFile.path); } catch (errUnlink) { console.error("Failed to unlink file on parse error:", errUnlink); } }
            throw { statusCode: 400, message: 'Dữ liệu partners không phải là JSON hợp lệ.' };
        }
    }
    if (partnersData !== undefined && !Array.isArray(partnersData)) {
        if (tourImageFile) { try { fs.unlinkSync(tourImageFile.path); } catch (errUnlink) { console.error("Failed to unlink file on type error:", errUnlink); } }
        throw { statusCode: 400, message: 'Dữ liệu partners phải là một mảng.' };
    }

    delete tourToCreate.partners;

    if (tourImageFile) {
        tourToCreate.url_anh_bia = `/uploads/tours/${tourImageFile.filename}`;
    } else {
        tourToCreate.url_anh_bia = tourData.url_anh_bia === undefined ? null : tourData.url_anh_bia;
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const newTour = await TourModel.create(tourToCreate, connection);

        if (partnersData && Array.isArray(partnersData) && newTour.id_san_pham_tour) {
            for (const partnerLink of partnersData) {
                if (!partnerLink.id_doi_tac) {
                    throw { statusCode: 400, message: 'Mỗi đối tác trong danh sách phải có id_doi_tac.' };
                }
                const partnerExists = await PartnerModel.findById(partnerLink.id_doi_tac, connection);
                if (!partnerExists) {
                    throw { statusCode: 400, message: `Đối tác với ID ${partnerLink.id_doi_tac} không tồn tại.` };
                }
                await TourPartnerModel.addPartnerToTour(
                    newTour.id_san_pham_tour,
                    partnerLink.id_doi_tac,
                    partnerLink.loai_hop_tac || null,
                    partnerLink.ghi_chu || null, // Thêm lại ghi_chu
                    connection
                );
            }
        }
        await connection.commit();
        const createdTourDetails = await getTourById(newTour.id_san_pham_tour);
        return createdTourDetails;

    } catch (error) {
        await connection.rollback();
        if (tourImageFile) {
            try { fs.unlinkSync(tourImageFile.path); } catch (e) { console.error("Error deleting uploaded file on tour creation failure:", e); }
        }
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

const updateTour = async (id_san_pham_tour, tourData, tourImageFile) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const tour = await TourModel.findById(id_san_pham_tour, connection);
        if (!tour) {
            if (tourImageFile) { try { fs.unlinkSync(tourImageFile.path); } catch (e) { console.error("Error deleting uploaded file (tour not found):", e); } }
            throw { statusCode: 404, message: 'Sản phẩm tour không tồn tại.' };
        }

        let partnersData = tourData.partners;
        if (typeof partnersData === 'string') {
            try {
                partnersData = JSON.parse(partnersData);
            } catch (e) {
                if (tourImageFile) { try { fs.unlinkSync(tourImageFile.path); } catch (errUnlink) { console.error("Failed to unlink file on parse error:", errUnlink); } }
                throw { statusCode: 400, message: 'Dữ liệu partners không phải là JSON hợp lệ.' };
            }
        }
        if (partnersData !== undefined && !Array.isArray(partnersData)) {
             if (tourImageFile) { try { fs.unlinkSync(tourImageFile.path); } catch (errUnlink) { console.error("Failed to unlink file on type error:", errUnlink); } }
            throw { statusCode: 400, message: 'Dữ liệu partners phải là một mảng.' };
        }

        const dataToUpdate = { ...tourData };
        delete dataToUpdate.partners;

        const oldImagePath = tour.url_anh_bia;
        if (tourImageFile) {
            dataToUpdate.url_anh_bia = `/uploads/tours/${tourImageFile.filename}`;
        } else if (tourData.url_anh_bia === null || tourData.url_anh_bia === '') {
            dataToUpdate.url_anh_bia = null;
        }

        const result = await TourModel.update(id_san_pham_tour, dataToUpdate, connection);

        if (partnersData !== undefined) {
             await TourPartnerModel.updateTourPartners(id_san_pham_tour, partnersData, connection); // Hàm này trong model cũng đã được cập nhật để bao gồm ghi_chu
        }

        await connection.commit();

        // ... (xử lý xóa ảnh cũ)
        if (tourImageFile && oldImagePath && dataToUpdate.url_anh_bia !== oldImagePath) {
            const fullOldPath = path.join(__dirname, '../../', oldImagePath);
            if (fs.existsSync(fullOldPath)) {
                try { fs.unlinkSync(fullOldPath); } catch (err) { console.error("Error deleting old tour image:", err); }
            }
        } else if (dataToUpdate.url_anh_bia === null && oldImagePath) {
             const fullOldPath = path.join(__dirname, '../../', oldImagePath);
            if (fs.existsSync(fullOldPath)) {
                try { fs.unlinkSync(fullOldPath); } catch (err) { console.error("Error deleting old tour image (set to null):", err); }
            }
        } else if (result.affectedRows === 0 && partnersData === undefined && tourImageFile) {
             try { fs.unlinkSync(tourImageFile.path); } catch (e) { console.error("Error deleting uploaded file (no db changes):", e); }
        }

        const updatedTourDetails = await getTourById(id_san_pham_tour);
        return { message: 'Cập nhật sản phẩm tour thành công.', tour: updatedTourDetails };

    } catch (error) {
        await connection.rollback();
        if (tourImageFile) {
            try { fs.unlinkSync(tourImageFile.path); } catch (e) { console.error("Error deleting uploaded file on tour update failure:", e); }
        }
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// ... các hàm getTourById, getAllTours, deleteTour, getTourStatistics giữ nguyên ...
// getTourById sẽ tự động có ghi_chu nếu model TourPartnerModel trả về
const getTourById = async (id_san_pham_tour) => {
    const tour = await TourModel.findById(id_san_pham_tour);
    if (!tour) {
        throw { statusCode: 404, message: 'Sản phẩm tour không tồn tại.' };
    }
    tour.partners = await TourPartnerModel.getPartnersByTourId(id_san_pham_tour); // Model này đã được cập nhật
    tour.schedules = await TourScheduleModel.findAllBySanPhamTourId(id_san_pham_tour, {});
    return tour;
};

const getAllTours = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { searchTerm, sortBy, order } = filters;

    const { tours, totalItems } = await TourModel.findAll({
        limit: parseInt(limit),
        offset: offset,
        searchTerm,
        sortBy,
        order
    });
    return {
        tours,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const deleteTour = async (id_san_pham_tour) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const tour = await TourModel.findById(id_san_pham_tour, connection);
        if (!tour) {
            throw { statusCode: 404, message: 'Sản phẩm tour không tồn tại.' };
        }
        await TourPartnerModel.updateTourPartners(id_san_pham_tour, [], connection);

        const schedules = await TourScheduleModel.findAllBySanPhamTourId(id_san_pham_tour, {}, connection);
        for (const schedule of schedules) {
             try {
                await TourScheduleModel.delete(schedule.id_lich_trinh_tour, connection);
            } catch (scheduleDeleteError) {
                if (scheduleDeleteError.statusCode === 400) {
                     throw { statusCode: 400, message: `Không thể xóa sản phẩm tour: ${scheduleDeleteError.message} (Lịch trình ID: ${schedule.id_lich_trinh_tour})` };
                }
                throw scheduleDeleteError;
            }
        }
        const result = await TourModel.delete(id_san_pham_tour, connection);
        await connection.commit();

        if (result.affectedRows === 0) {
            throw { statusCode: 400, message: 'Xóa sản phẩm tour không thành công.' };
        }
        if (tour.url_anh_bia) {
            const fullImagePath = path.join(__dirname, '../../', tour.url_anh_bia);
            if (fs.existsSync(fullImagePath)) {
                try { fs.unlinkSync(fullImagePath); } catch (err) { console.error("Error deleting tour image on delete:", err); }
            }
        }
        return { message: 'Sản phẩm tour và các dữ liệu liên quan đã được xóa.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
const getTourStatistics = async () => {
    const stats = await TourModel.getStatistics();
    return {
        total_san_pham_tours: stats.total_san_pham_tours,
    };
};

module.exports = { createTour, getAllTours, getTourById, updateTour, deleteTour, getTourStatistics };