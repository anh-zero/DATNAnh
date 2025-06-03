const TourReviewModel = require('../models/tour_review_model');
const pool = require('../config/db.config');

const getAllReviews = async (filters, paginationOptions) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { reviews, totalItems } = await TourReviewModel.findAll({
        limit: parseInt(limit), offset, ...filters
    });
    return {
        reviews,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        }
    };
};

const getReviewById = async (id_danh_gia) => {
    const review = await TourReviewModel.findById(id_danh_gia);
    if (!review) {
        throw { statusCode: 404, message: 'Đánh giá không tồn tại.' };
    }
    return review;
};

const updateReviewByAdmin = async (id_danh_gia, reviewData) => {
    const review = await TourReviewModel.findById(id_danh_gia);
    if (!review) {
        throw { statusCode: 404, message: 'Đánh giá không tồn tại.' };
    }

    // Chỉ cho phép admin cập nhật một số trường nhất định
    const dataToUpdate = {};
    if (reviewData.da_duyet !== undefined) {
        dataToUpdate.da_duyet = reviewData.da_duyet;
    }
    if (reviewData.phan_hoi_quan_tri !== undefined) {
        dataToUpdate.phan_hoi_quan_tri = reviewData.phan_hoi_quan_tri;
    }
    // Nếu cho phép admin sửa cả điểm và bình luận
    if (reviewData.diem_danh_gia !== undefined) {
        dataToUpdate.diem_danh_gia = reviewData.diem_danh_gia;
    }
    if (reviewData.binh_luan !== undefined) {
        dataToUpdate.binh_luan = reviewData.binh_luan;
    }


    if (Object.keys(dataToUpdate).length === 0) {
        return { message: 'Không có thông tin nào được cung cấp để cập nhật.', review };
    }

    const result = await TourReviewModel.update(id_danh_gia, dataToUpdate);
    if (result.affectedRows === 0) {
        // throw { statusCode: 400, message: 'Cập nhật đánh giá không thành công hoặc không có thay đổi.' };
    }
    const updatedReview = await TourReviewModel.findById(id_danh_gia);
    return { message: 'Cập nhật đánh giá thành công.', review: updatedReview };
};

const deleteReview = async (id_danh_gia) => {
    const review = await TourReviewModel.findById(id_danh_gia);
    if (!review) {
        throw { statusCode: 404, message: 'Đánh giá không tồn tại.' };
    }
    const result = await TourReviewModel.delete(id_danh_gia);
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Xóa đánh giá không thành công.' };
    }
    return { message: 'Đánh giá đã được xóa.' };
};

module.exports = {
    getAllReviews,
    getReviewById,
    updateReviewByAdmin,
    deleteReview
};