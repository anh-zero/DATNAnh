const TourScheduleModel = require('../models/tour_schedule_model');
const TourModel = require('../models/tour_model'); // Để kiểm tra id_san_pham_tour
const pool = require('../config/db.config');

const createTourSchedule = async (id_san_pham_tour, scheduleData) => {
    const tourProduct = await TourModel.findById(id_san_pham_tour);
    if (!tourProduct) {
        throw { statusCode: 404, message: `Sản phẩm tour với ID ${id_san_pham_tour} không tồn tại.` };
    }

    // Validate ngày khởi hành phải trước ngày kết thúc
    if (new Date(scheduleData.ngay_khoi_hanh) >= new Date(scheduleData.ngay_ket_thuc)) {
        throw { statusCode: 400, message: 'Ngày khởi hành phải trước ngày kết thúc.' };
    }
    // Validate số lượng chỗ
    if (parseInt(scheduleData.so_luong_cho_toi_da) <= 0) {
        throw { statusCode: 400, message: 'Số lượng chỗ tối đa phải lớn hơn 0.' };
    }
    if (scheduleData.so_luong_cho_da_dat && parseInt(scheduleData.so_luong_cho_da_dat) < 0) {
        throw { statusCode: 400, message: 'Số lượng chỗ đã đặt không thể âm.' };
    }
    if (scheduleData.so_luong_cho_da_dat && parseInt(scheduleData.so_luong_cho_da_dat) > parseInt(scheduleData.so_luong_cho_toi_da)) {
        throw { statusCode: 400, message: 'Số lượng chỗ đã đặt không thể lớn hơn số lượng chỗ tối đa.' };
    }


    const dataToCreate = { ...scheduleData, id_san_pham_tour };
    return TourScheduleModel.create(dataToCreate);
};

const getAllSchedulesForTour = async (id_san_pham_tour, queryParams) => {
    const tourProduct = await TourModel.findById(id_san_pham_tour);
    if (!tourProduct) {
        throw { statusCode: 404, message: `Sản phẩm tour với ID ${id_san_pham_tour} không tồn tại.` };
    }
    const { sortBy, order } = queryParams;
    return TourScheduleModel.findAllBySanPhamTourId(id_san_pham_tour, { sortBy, order });
};

const getTourScheduleById = async (id_lich_trinh_tour) => {
    const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    if (!schedule) {
        throw { statusCode: 404, message: 'Lịch khởi hành không tồn tại.' };
    }
    return schedule;
};

const updateTourSchedule = async (id_lich_trinh_tour, scheduleData) => {
    const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    if (!schedule) {
        throw { statusCode: 404, message: 'Lịch khởi hành không tồn tại.' };
    }

    // Validate ngày nếu có
    const newNgayKhoiHanh = scheduleData.ngay_khoi_hanh ? new Date(scheduleData.ngay_khoi_hanh) : new Date(schedule.ngay_khoi_hanh);
    const newNgayKetThuc = scheduleData.ngay_ket_thuc ? new Date(scheduleData.ngay_ket_thuc) : new Date(schedule.ngay_ket_thuc);
    if (newNgayKhoiHanh >= newNgayKetThuc) {
        throw { statusCode: 400, message: 'Ngày khởi hành phải trước ngày kết thúc.' };
    }
    // Validate số lượng chỗ
    const newSoLuongChoToiDa = scheduleData.so_luong_cho_toi_da !== undefined ? parseInt(scheduleData.so_luong_cho_toi_da) : schedule.so_luong_cho_toi_da;
    const newSoLuongChoDaDat = scheduleData.so_luong_cho_da_dat !== undefined ? parseInt(scheduleData.so_luong_cho_da_dat) : schedule.so_luong_cho_da_dat;

    if (newSoLuongChoToiDa <= 0) {
        throw { statusCode: 400, message: 'Số lượng chỗ tối đa phải lớn hơn 0.' };
    }
    if (newSoLuongChoDaDat < 0) {
        throw { statusCode: 400, message: 'Số lượng chỗ đã đặt không thể âm.' };
    }
    if (newSoLuongChoDaDat > newSoLuongChoToiDa) {
        throw { statusCode: 400, message: 'Số lượng chỗ đã đặt không thể lớn hơn số lượng chỗ tối đa.' };
    }


    const result = await TourScheduleModel.update(id_lich_trinh_tour, scheduleData);
    if (result.affectedRows === 0) {
        // Có thể không có thay đổi hoặc ID không đúng (đã check)
        // return { message: 'Không có thông tin nào được thay đổi.' };
    }
    const updatedSchedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    return { message: 'Cập nhật lịch khởi hành thành công.', schedule: updatedSchedule };
};

const deleteTourSchedule = async (id_lich_trinh_tour) => {
    const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    if (!schedule) {
        throw { statusCode: 404, message: 'Lịch khởi hành không tồn tại.' };
    }
    // Model.delete đã có logic kiểm tra booking
    const result = await TourScheduleModel.delete(id_lich_trinh_tour);
    if (result.affectedRows === 0) {
        // Có thể do đã bị xóa hoặc lỗi khác (đã được xử lý trong model)
    }
    return { message: 'Lịch khởi hành đã được xóa (hoặc hủy nếu có booking).' };
};

const cancelTourSchedule = async (id_lich_trinh_tour) => {
    const schedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    if (!schedule) {
        throw { statusCode: 404, message: 'Lịch khởi hành không tồn tại.' };
    }
    if (schedule.trang_thai_lich_trinh === 'Đã hủy') {
        return { message: 'Lịch khởi hành này đã được hủy trước đó.', schedule };
    }
    // Kiểm tra xem có booking nào đang active không, nếu có thì có thể không cho hủy hoặc cần xử lý booking
    const result = await TourScheduleModel.update(id_lich_trinh_tour, { trang_thai_lich_trinh: 'Đã hủy' });
    if (result.affectedRows === 0) {
        throw { statusCode: 400, message: 'Hủy lịch khởi hành không thành công.' };
    }
    const updatedSchedule = await TourScheduleModel.findById(id_lich_trinh_tour);
    return { message: 'Lịch khởi hành đã được hủy.', schedule: updatedSchedule };
};


module.exports = {
    createTourSchedule,
    getAllSchedulesForTour,
    getTourScheduleById,
    updateTourSchedule,
    deleteTourSchedule,
    cancelTourSchedule
};