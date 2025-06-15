import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { createTourSchedule, updateTourSchedule } from '../../api/services/tourScheduleService';
import { formatDateForInput } from '../../utils/formatter';

const SCHEDULE_STATUSES = ['Sắp mở bán', 'Đang bán', 'Hết chỗ', 'Đã hủy', 'Đang diễn ra', 'Đã kết thúc'];

// Define common input/select styles (hoặc import từ file CSS chung)
const inputStyle = "w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1";

const TourScheduleFormModal = ({ isOpen, onClose, schedule, tourId, onSuccess }) => {
    const initialFormState = {
        ngay_khoi_hanh: '',
        ngay_ket_thuc: '',
        gia_tien: '',
        so_luong_cho_toi_da: '',
        so_luong_cho_da_dat: 0,
        trang_thai_lich_trinh: SCHEDULE_STATUSES[0],
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (schedule) {
                setFormData({
                    ngay_khoi_hanh: formatDateForInput(schedule.ngay_khoi_hanh) || '',
                    ngay_ket_thuc: formatDateForInput(schedule.ngay_ket_thuc) || '',
                    gia_tien: schedule.gia_tien?.toString() || '',
                    so_luong_cho_toi_da: schedule.so_luong_cho_toi_da?.toString() || '',
                    so_luong_cho_da_dat: schedule.so_luong_cho_da_dat || 0,
                    trang_thai_lich_trinh: schedule.trang_thai_lich_trinh || SCHEDULE_STATUSES[0],
                });
            } else {
                setFormData(initialFormState);
            }
            setError(null);
        }
    }, [schedule, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (new Date(formData.ngay_khoi_hanh) >= new Date(formData.ngay_ket_thuc)) {
            setError("Ngày khởi hành phải trước ngày kết thúc.");
            setIsLoading(false);
            return;
        }
        if (parseInt(formData.so_luong_cho_da_dat) > parseInt(formData.so_luong_cho_toi_da)) {
            setError("Số chỗ đã đặt không thể lớn hơn số chỗ tối đa.");
            setIsLoading(false);
            return;
        }
        if (parseInt(formData.so_luong_cho_toi_da) <= 0) {
            setError("Số chỗ tối đa phải lớn hơn 0.");
            setIsLoading(false);
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                gia_tien: parseFloat(formData.gia_tien),
                so_luong_cho_toi_da: parseInt(formData.so_luong_cho_toi_da),
                so_luong_cho_da_dat: parseInt(formData.so_luong_cho_da_dat),
            };

            if (schedule && schedule.id_lich_trinh_tour) {
                await updateTourSchedule(tourId, schedule.id_lich_trinh_tour, dataToSubmit);
            } else {
                await createTourSchedule(tourId, dataToSubmit);
            }
            onSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || (schedule ? 'Lỗi cập nhật lịch trình.' : 'Lỗi tạo mới lịch trình.');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg p-6 w-full max-w-lg relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl flex flex-col"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
                        {schedule ? 'Sửa Lịch trình' : 'Thêm Lịch trình'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                        <p><strong>Lỗi:</strong> {error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                    <div className="flex-grow space-y-4"> {/* Container for form fields to allow footer to stick */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="ngay_khoi_hanh" className={labelStyle}>Ngày đi <span className="text-red-500">*</span></label>
                                <input type="date" name="ngay_khoi_hanh" id="ngay_khoi_hanh" value={formData.ngay_khoi_hanh} onChange={handleChange} required className={inputStyle} disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="ngay_ket_thuc" className={labelStyle}>Ngày về <span className="text-red-500">*</span></label>
                                <input type="date" name="ngay_ket_thuc" id="ngay_ket_thuc" value={formData.ngay_ket_thuc} onChange={handleChange} required className={inputStyle} disabled={isLoading} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="gia_tien" className={labelStyle}>Giá (VNĐ) <span className="text-red-500">*</span></label>
                            <input type="number" name="gia_tien" id="gia_tien" value={formData.gia_tien} onChange={handleChange} required min="0" step="1000" className={inputStyle} disabled={isLoading} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="so_luong_cho_toi_da" className={labelStyle}>Chỗ tối đa <span className="text-red-500">*</span></label>
                                <input type="number" name="so_luong_cho_toi_da" id="so_luong_cho_toi_da" value={formData.so_luong_cho_toi_da} onChange={handleChange} required min="1" className={inputStyle} disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="so_luong_cho_da_dat" className={labelStyle}>Chỗ đã đặt</label>
                                <input type="number" name="so_luong_cho_da_dat" id="so_luong_cho_da_dat" value={formData.so_luong_cho_da_dat} onChange={handleChange} min="0" className={inputStyle} disabled={isLoading} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="trang_thai_lich_trinh" className={labelStyle}>Trạng thái <span className="text-red-500">*</span></label>
                            <select name="trang_thai_lich_trinh" id="trang_thai_lich_trinh" value={formData.trang_thai_lich_trinh} onChange={handleChange} required className={inputStyle} disabled={isLoading}>
                                {SCHEDULE_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 mt-auto flex justify-end space-x-3 border-t border-gray-200 dark:border-theme-border">
                        <button type="button" onClick={onClose} disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-theme-text-secondary bg-gray-100 dark:bg-theme-surface hover:bg-gray-200 dark:hover:bg-theme-background rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-theme-surface0">
                            Hủy
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0 inline-flex items-center">
                            <Save size={18} className="mr-2" />
                            {isLoading ? (schedule ? 'Đang lưu...' : 'Đang tạo...') : (schedule ? 'Lưu thay đổi' : 'Tạo Lịch trình')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TourScheduleFormModal;