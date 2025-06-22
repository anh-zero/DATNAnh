import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createBooking, updateBooking } from '../../api/services/bookingService';
import { getAllTourSchedules } from '../../api/services/tourScheduleService';
import { getAllCustomers } from '../../api/services/customerService';
import { formatDate } from '../../utils/formatter';

const BookingFormModal = ({ isOpen, onClose, booking = null }) => {
    const [formData, setFormData] = useState({
        id_khach_hang: '',
        id_lich_trinh_tour: '',
        ho_ten: '',
        email_lien_he: '',
        so_dien_thoai: '',
        so_luong_nguoi: '1',
        tong_tien_du_kien: '',
        tong_tien_thanh_toan: '0',
        trang_thai_dat_tour: 'Mới',
        trang_thai_thanh_toan: 'Chờ thanh toán',
        ghi_chu: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [scheduleOptions, setScheduleOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [selectedScheduleInfo, setSelectedScheduleInfo] = useState(null);

    const isEditing = !!booking;

    // Load danh sách lịch trình tour
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setIsLoadingSchedules(true);
                const response = await getAllTourSchedules({ limit: 100 });
                if (response.data && response.data.schedules) {
                    // Lọc chỉ lấy các lịch trình đang mở bán
                    const availableSchedules = response.data.schedules.filter(
                        schedule => schedule.trang_thai_lich_trinh === 'Đang mở bán' || 
                                    schedule.trang_thai_lich_trinh === 'Sắp mở bán'
                    );
                    setScheduleOptions(availableSchedules);
                }
            } catch (error) {
                console.error("Failed to fetch tour schedules:", error);
                setError("Không thể tải danh sách lịch trình tour. Vui lòng thử lại sau.");
            } finally {
                setIsLoadingSchedules(false);
            }
        };

        fetchSchedules();
    }, []);

    // Load danh sách khách hàng
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoadingCustomers(true);
                const response = await getAllCustomers({ limit: 100 });
                if (response.data && response.data.customers) {
                    setCustomerOptions(response.data.customers);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                setError("Không thể tải danh sách khách hàng. Vui lòng thử lại sau.");
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, []);

    // Populate form data if editing
    useEffect(() => {
        if (booking) {
            setFormData({
                id_khach_hang: booking.id_khach_hang || '',
                id_lich_trinh_tour: booking.id_lich_trinh_tour || '',
                ho_ten: booking.ho_ten || '',
                email_lien_he: booking.email_lien_he || '',
                so_dien_thoai: booking.so_dien_thoai || '',
                so_luong_nguoi: booking.so_luong_nguoi?.toString() || '1',
                tong_tien_du_kien: booking.tong_tien_du_kien?.toString() || '',
                tong_tien_thanh_toan: booking.tong_tien_thanh_toan?.toString() || '0',
                trang_thai_dat_tour: booking.trang_thai_dat_tour || 'Mới',
                trang_thai_thanh_toan: booking.trang_thai_thanh_toan || 'Chờ thanh toán',
                ghi_chu: booking.ghi_chu || ''
            });
        }
    }, [booking]);

    // Cập nhật thông tin lịch trình khi người dùng chọn
    useEffect(() => {
        if (formData.id_lich_trinh_tour) {
            const selectedSchedule = scheduleOptions.find(
                schedule => schedule.id_lich_trinh_tour.toString() === formData.id_lich_trinh_tour.toString()
            );
            setSelectedScheduleInfo(selectedSchedule);
            
            // Cập nhật giá tiền dự kiến dựa trên giá tour và số lượng người
            if (selectedSchedule && formData.so_luong_nguoi) {
                const newTotal = selectedSchedule.gia_tien * parseInt(formData.so_luong_nguoi);
                setFormData(prev => ({
                    ...prev,
                    tong_tien_du_kien: newTotal.toString()
                }));
            }
        }
    }, [formData.id_lich_trinh_tour, formData.so_luong_nguoi, scheduleOptions]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.id_lich_trinh_tour) {
            newErrors.id_lich_trinh_tour = 'Vui lòng chọn lịch trình tour';
        }

        if (!formData.ho_ten) {
            newErrors.ho_ten = 'Họ tên người đặt là bắt buộc';
        }

        if (!formData.email_lien_he) {
            newErrors.email_lien_he = 'Email liên hệ là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email_lien_he)) {
            newErrors.email_lien_he = 'Email không hợp lệ';
        }

        if (!formData.so_dien_thoai) {
            newErrors.so_dien_thoai = 'Số điện thoại là bắt buộc';
        }

        if (!formData.so_luong_nguoi) {
            newErrors.so_luong_nguoi = 'Số lượng người là bắt buộc';
        } else if (isNaN(formData.so_luong_nguoi) || Number(formData.so_luong_nguoi) <= 0) {
            newErrors.so_luong_nguoi = 'Số lượng người phải là số dương';
        }

        if (selectedScheduleInfo && parseInt(formData.so_luong_nguoi) > selectedScheduleInfo.so_luong_cho_toi_da - selectedScheduleInfo.so_luong_cho_da_dat) {
            newErrors.so_luong_nguoi = 'Số lượng người vượt quá số chỗ còn trống';
        }

        if (!formData.tong_tien_du_kien) {
            newErrors.tong_tien_du_kien = 'Tổng tiền dự kiến là bắt buộc';
        } else if (isNaN(formData.tong_tien_du_kien) || Number(formData.tong_tien_du_kien) <= 0) {
            newErrors.tong_tien_du_kien = 'Tổng tiền dự kiến phải là số dương';
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

        // Tự động cập nhật khách hàng khi chọn id_khach_hang
        if (name === 'id_khach_hang' && value) {
            const selectedCustomer = customerOptions.find(customer => customer.id_khach_hang.toString() === value);
            if (selectedCustomer) {
                setFormData(prev => ({
                    ...prev,
                    ho_ten: selectedCustomer.ho_ten || prev.ho_ten,
                    email_lien_he: selectedCustomer.email || prev.email_lien_he,
                    so_dien_thoai: selectedCustomer.so_dien_thoai || prev.so_dien_thoai
                }));
            }
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
                id_khach_hang: formData.id_khach_hang ? parseInt(formData.id_khach_hang) : null,
                id_lich_trinh_tour: parseInt(formData.id_lich_trinh_tour),
                so_luong_nguoi: parseInt(formData.so_luong_nguoi),
                tong_tien_du_kien: parseFloat(formData.tong_tien_du_kien),
                tong_tien_thanh_toan: parseFloat(formData.tong_tien_thanh_toan) || 0
            };

            let response;
            if (isEditing) {
                response = await updateBooking(booking.id_dat_tour, dataToSubmit);
            } else {
                response = await createBooking(dataToSubmit);
            }

            alert(isEditing ? 'Cập nhật đơn đặt tour thành công!' : 'Thêm đơn đặt tour mới thành công!');
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
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-2xl relative border border-theme-border shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Header màu xám */}
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
                        {isEditing ? 'Chỉnh sửa đơn đặt tour' : 'Thêm đơn đặt tour mới'}
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
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                                <p><strong>Lỗi:</strong> {error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="id_lich_trinh_tour"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Lịch trình tour <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="id_lich_trinh_tour"
                                    name="id_lich_trinh_tour"
                                    value={formData.id_lich_trinh_tour}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting || isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                >
                                    <option value="">-- Chọn lịch trình tour --</option>
                                    {isLoadingSchedules ? (
                                        <option disabled>Đang tải...</option>
                                    ) : (
                                        scheduleOptions.map(schedule => (
                                            <option key={schedule.id_lich_trinh_tour} value={schedule.id_lich_trinh_tour}>
                                                {schedule.sanphamtour?.ten_tour || 'Tour không xác định'} ({formatDate(schedule.ngay_khoi_hanh)}) - Giá: {schedule.gia_tien?.toLocaleString('vi-VN')} VNĐ
                                            </option>
                                        ))
                                    )}
                                </select>
                                {errors.id_lich_trinh_tour && <p className="text-red-500 text-xs mt-1">{errors.id_lich_trinh_tour}</p>}
                                
                                {selectedScheduleInfo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Còn trống: {selectedScheduleInfo.so_luong_cho_toi_da - selectedScheduleInfo.so_luong_cho_da_dat} chỗ
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="id_khach_hang"
                                    className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                >
                                    Khách hàng (Tùy chọn)
                                </label>
                                <select
                                    id="id_khach_hang"
                                    name="id_khach_hang"
                                    value={formData.id_khach_hang}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                >
                                    <option value="">-- Chọn khách hàng (nếu có) --</option>
                                    {isLoadingCustomers ? (
                                        <option disabled>Đang tải...</option>
                                    ) : (
                                        customerOptions.map(customer => (
                                            <option key={customer.id_khach_hang} value={customer.id_khach_hang}>
                                                {customer.ho_ten} - {customer.email || customer.so_dien_thoai}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="ho_ten"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Họ tên người đặt <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="ho_ten"
                                        name="ho_ten"
                                        value={formData.ho_ten}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                    {errors.ho_ten && <p className="text-red-500 text-xs mt-1">{errors.ho_ten}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="email_lien_he"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Email liên hệ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email_lien_he"
                                        name="email_lien_he"
                                        value={formData.email_lien_he}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                    {errors.email_lien_he && <p className="text-red-500 text-xs mt-1">{errors.email_lien_he}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="so_dien_thoai"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="so_dien_thoai"
                                        name="so_dien_thoai"
                                        value={formData.so_dien_thoai}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                    {errors.so_dien_thoai && <p className="text-red-500 text-xs mt-1">{errors.so_dien_thoai}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="so_luong_nguoi"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Số lượng người <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="so_luong_nguoi"
                                        name="so_luong_nguoi"
                                        value={formData.so_luong_nguoi}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                    {errors.so_luong_nguoi && <p className="text-red-500 text-xs mt-1">{errors.so_luong_nguoi}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="tong_tien_du_kien"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Tổng tiền dự kiến (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="tong_tien_du_kien"
                                        name="tong_tien_du_kien"
                                        value={formData.tong_tien_du_kien}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                    {errors.tong_tien_du_kien && <p className="text-red-500 text-xs mt-1">{errors.tong_tien_du_kien}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="tong_tien_thanh_toan"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Đã thanh toán (VNĐ)
                                    </label>
                                    <input
                                        type="number"
                                        id="tong_tien_thanh_toan"
                                        name="tong_tien_thanh_toan"
                                        value={formData.tong_tien_thanh_toan}
                                        onChange={handleChange}
                                        min="0"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="trang_thai_dat_tour"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Trạng thái đặt tour
                                    </label>
                                    <select
                                        id="trang_thai_dat_tour"
                                        name="trang_thai_dat_tour"
                                        value={formData.trang_thai_dat_tour}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    >
                                        <option value="Mới">Mới</option>
                                        <option value="Đã xác nhận">Đã xác nhận</option>
                                        <option value="Chờ thanh toán">Chờ thanh toán</option>
                                        <option value="Hoàn thành">Hoàn thành</option>
                                        <option value="Đã hủy">Đã hủy</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="trang_thai_thanh_toan"
                                        className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
                                    >
                                        Trạng thái thanh toán
                                    </label>
                                    <select
                                        id="trang_thai_thanh_toan"
                                        name="trang_thai_thanh_toan"
                                        value={formData.trang_thai_thanh_toan}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                    >
                                        <option value="Chờ thanh toán">Chờ thanh toán</option>
                                        <option value="Thanh toán một phần">Thanh toán một phần</option>
                                        <option value="Đã thanh toán">Đã thanh toán</option>
                                        <option value="Hoàn tiền">Hoàn tiền</option>
                                    </select>
                                </div>
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
                </div>

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

export default BookingFormModal;