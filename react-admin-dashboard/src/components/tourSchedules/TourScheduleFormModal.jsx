import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createTourSchedule, updateTourSchedule } from '../../api/services/tourScheduleService';
import { getAllTours } from '../../api/services/tourService';
import { formatDate } from '../../utils/formatter';

const TourScheduleFormModal = ({ isOpen, onClose, schedule = null }) => {
    const [formData, setFormData] = useState({
        id_san_pham_tour: '',
        ngay_khoi_hanh: '',
        ngay_ket_thuc: '',
        gia_tien: '',
        so_luong_cho_toi_da: '',
        so_luong_cho_da_dat: '0',
        trang_thai_lich_trinh: 'Sắp mở bán',
        ghi_chu: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [tourOptions, setTourOptions] = useState([]);
    const [isLoadingTours, setIsLoadingTours] = useState(false);

    const isEditing = !!schedule;

    // Load danh sách tour để người dùng chọn
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setIsLoadingTours(true);
                const response = await getAllTours({ limit: 100 });
                if (response.data && response.data.tours) {
                    setTourOptions(response.data.tours);
                }
            } catch (error) {
                console.error("Failed to fetch tours:", error);
                setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
            } finally {
                setIsLoadingTours(false);
            }
        };

        fetchTours();
    }, []);

    // Populate form data if editing
    useEffect(() => {
        if (schedule) {
            const formattedStartDate = schedule.ngay_khoi_hanh ? new Date(schedule.ngay_khoi_hanh).toISOString().split('T')[0] : '';
            const formattedEndDate = schedule.ngay_ket_thuc ? new Date(schedule.ngay_ket_thuc).toISOString().split('T')[0] : '';

            setFormData({
                id_san_pham_tour: schedule.id_san_pham_tour || '',
                ngay_khoi_hanh: formattedStartDate,
                ngay_ket_thuc: formattedEndDate,
                gia_tien: schedule.gia_tien?.toString() || '',
                so_luong_cho_toi_da: schedule.so_luong_cho_toi_da?.toString() || '',
                so_luong_cho_da_dat: schedule.so_luong_cho_da_dat?.toString() || '0',
                trang_thai_lich_trinh: schedule.trang_thai_lich_trinh || 'Sắp mở bán',
                ghi_chu: schedule.ghi_chu || ''
            });
        }
    }, [schedule]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.id_san_pham_tour) {
            newErrors.id_san_pham_tour = 'Vui lòng chọn tour';
        }

        if (!formData.ngay_khoi_hanh) {
            newErrors.ngay_khoi_hanh = 'Ngày khởi hành là bắt buộc';
        }

        if (!formData.ngay_ket_thuc) {
            newErrors.ngay_ket_thuc = 'Ngày kết thúc là bắt buộc';
        } else if (formData.ngay_ket_thuc < formData.ngay_khoi_hanh) {
            newErrors.ngay_ket_thuc = 'Ngày kết thúc phải sau ngày khởi hành';
        }

        if (!formData.gia_tien) {
            newErrors.gia_tien = 'Giá tiền là bắt buộc';
        } else if (isNaN(formData.gia_tien) || Number(formData.gia_tien) <= 0) {
            newErrors.gia_tien = 'Giá tiền phải là số dương';
        }

        if (!formData.so_luong_cho_toi_da) {
            newErrors.so_luong_cho_toi_da = 'Số lượng chỗ tối đa là bắt buộc';
        } else if (isNaN(formData.so_luong_cho_toi_da) || Number(formData.so_luong_cho_toi_da) <= 0) {
            newErrors.so_luong_cho_toi_da = 'Số lượng chỗ tối đa phải là số dương';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const dataToSubmit = {
                ...formData,
                id_san_pham_tour: parseInt(formData.id_san_pham_tour),
                gia_tien: parseFloat(formData.gia_tien),
                so_luong_cho_toi_da: parseInt(formData.so_luong_cho_toi_da),
                so_luong_cho_da_dat: parseInt(formData.so_luong_cho_da_dat) || 0
            };

            let response;
            if (isEditing) {
                response = await updateTourSchedule(schedule.id_lich_trinh_tour, dataToSubmit);
            } else {
                response = await createTourSchedule(dataToSubmit);
            }

            alert(isEditing ? 'Cập nhật lịch trình thành công!' : 'Thêm lịch trình mới thành công!');
            onClose();
        } catch (err) {
            console.error('Error submitting form:', err);
            const errorMessage = err.errors?.[0]?.msg || err.message || 'Có lỗi xảy ra khi lưu dữ liệu';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-lg relative border border-theme-border shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Header màu xám */}
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
                        {isEditing ? 'Chỉnh sửa lịch trình' : 'Thêm lịch trình mới'}
                    </h2>
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                            <p><strong>Lỗi:</strong> {error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="id_san_pham_tour"
                                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                            >
                                Tour <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="id_san_pham_tour"
                                name="id_san_pham_tour"
                                value={formData.id_san_pham_tour}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting || isEditing}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            >
                                <option value="">-- Chọn tour --</option>
                                {isLoadingTours ? (
                                    <option disabled>Đang tải...</option>
                                ) : (
                                    tourOptions.map(tour => (
                                        <option key={tour.id_san_pham_tour} value={tour.id_san_pham_tour}>
                                            {tour.ten_tour}
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.id_san_pham_tour && <p className="text-red-500 text-xs mt-1">{errors.id_san_pham_tour}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="ngay_khoi_hanh"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Ngày khởi hành <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="ngay_khoi_hanh"
                                    name="ngay_khoi_hanh"
                                    value={formData.ngay_khoi_hanh}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                                {errors.ngay_khoi_hanh && <p className="text-red-500 text-xs mt-1">{errors.ngay_khoi_hanh}</p>}
                            </div>

                            <div>
                                <label
                                    htmlFor="ngay_ket_thuc"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="ngay_ket_thuc"
                                    name="ngay_ket_thuc"
                                    value={formData.ngay_ket_thuc}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                                {errors.ngay_ket_thuc && <p className="text-red-500 text-xs mt-1">{errors.ngay_ket_thuc}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="gia_tien"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Giá tiền (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="gia_tien"
                                    name="gia_tien"
                                    value={formData.gia_tien}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    step="1000"
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    placeholder="VD: 5000000"
                                />
                                {errors.gia_tien && <p className="text-red-500 text-xs mt-1">{errors.gia_tien}</p>}
                            </div>

                            <div>
                                <label
                                    htmlFor="so_luong_cho_toi_da"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Số chỗ tối đa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="so_luong_cho_toi_da"
                                    name="so_luong_cho_toi_da"
                                    value={formData.so_luong_cho_toi_da}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    disabled={isSubmitting || isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    placeholder="VD: 20"
                                />
                                {errors.so_luong_cho_toi_da && <p className="text-red-500 text-xs mt-1">{errors.so_luong_cho_toi_da}</p>}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="trang_thai_lich_trinh"
                                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                            >
                                Trạng thái
                            </label>
                            <select
                                id="trang_thai_lich_trinh"
                                name="trang_thai_lich_trinh"
                                value={formData.trang_thai_lich_trinh}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            >
                                <option value="Sắp mở bán">Sắp mở bán</option>
                                <option value="Đang mở bán">Đang mở bán</option>
                                <option value="Hết chỗ">Hết chỗ</option>
                                <option value="Đã khởi hành">Đã khởi hành</option>
                                <option value="Đã kết thúc">Đã kết thúc</option>
                                <option value="Đã hủy">Đã hủy</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="ghi_chu"
                                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                            >
                                Ghi chú
                            </label>
                            <textarea
                                id="ghi_chu"
                                name="ghi_chu"
                                value={formData.ghi_chu}
                                onChange={handleChange}
                                rows={4}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                placeholder="Nhập ghi chú (nếu có)"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer màu xám */}
                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm bg-white dark:bg-theme-surface text-theme-text-primary hover:bg-gray-50 dark:hover:bg-theme-surface0 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-theme-primary text-white hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>{isEditing ? 'Cập nhật' : 'Thêm mới'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourScheduleFormModal;