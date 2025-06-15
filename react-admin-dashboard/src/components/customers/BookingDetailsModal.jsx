import React from 'react';
import { X, Calendar, Users, CreditCard, Info, MapPin, CalendarDays, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatter';
import { motion } from 'framer-motion';

// Component hiển thị từng mục thông tin giống như trong UserDetailsModal
const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
    <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-gray-600 dark:text-theme-text-secondary">{label}:</span>
            <p className="text-gray-800 dark:text-theme-text-primary break-words text-base">
                {value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}
            </p>
        </div>
    </div>
);

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Function to get status badge with styling
    const getStatusBadge = (status, type = 'booking') => {
        let statusClasses = '';

        if (type === 'payment') {
            switch (status) {
                case 'Đã thanh toán':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 font-medium">{status}</span>;
                case 'Chờ thanh toán':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 font-medium">{status}</span>;
                case 'Đã hủy':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 font-medium">{status}</span>;
                default:
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 font-medium">{status}</span>;
            }
        } else {
            switch (status) {
                case 'Hoàn thành':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 font-medium">{status}</span>;
                case 'Đã xác nhận':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400 font-medium">{status}</span>;
                case 'Đã hủy':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 font-medium">{status}</span>;
                case 'Mới':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400 font-medium">{status}</span>;
                case 'Chờ thanh toán':
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400 font-medium">{status}</span>;
                default:
                    return <span className="px-2.5 py-1.5 text-sm rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 font-medium">{status}</span>;
            }
        }
    };

    // Calculate days between dates
    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const tripLength = calculateDays(booking.ngay_khoi_hanh, booking.ngay_ket_thuc);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-3xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                {/* Sticky header */}
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center mb-6">
                        {/* Tour image and title */}
                        <div className="w-32 h-32 mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-theme-border shadow-lg">
                            {booking.url_anh_bia ? (
                                <img
                                    src={booking.url_anh_bia}
                                    alt={booking.ten_tour}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                                    <MapPin size={64} className="text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1 text-center">
                            {booking.ten_tour || 'N/A'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-theme-text-tertiary mb-3">
                            Mã đặt tour: #{booking.id_dat_tour}
                        </p>
                        <div>{getStatusBadge(booking.trang_thai_dat_tour)}</div>
                    </div>
                </div>

                {/* Tour information */}
                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin tour</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                        <DetailItem
                            label="Ngày khởi hành"
                            value={formatDate(booking.ngay_khoi_hanh)}
                            icon={Calendar}
                        />
                        <DetailItem
                            label="Ngày kết thúc"
                            value={formatDate(booking.ngay_ket_thuc)}
                            icon={Calendar}
                        />
                        <DetailItem
                            label="Số lượng khách"
                            value={booking.so_luong_khach + " khách"}
                            icon={Users}
                        />
                        <DetailItem
                            label="Thời gian"
                            value={tripLength + " ngày"}
                            icon={Clock}
                        />
                    </div>
                </div>

                {/* Payment information */}
                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin thanh toán</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                        <DetailItem
                            label="Tổng tiền dự kiến"
                            value={formatCurrency(booking.tong_tien_du_kien)}
                            icon={CreditCard}
                        />
                        <DetailItem
                            label="Đã thanh toán"
                            value={formatCurrency(booking.tong_tien_thanh_toan)}
                            icon={CreditCard}
                        />
                        <DetailItem
                            label="Còn lại"
                            value={formatCurrency(Number(booking.tong_tien_du_kien) - Number(booking.tong_tien_thanh_toan))}
                            icon={CreditCard}
                        />
                        <DetailItem
                            label="Trạng thái thanh toán"
                            value={getStatusBadge(booking.trang_thai_thanh_toan, 'payment')}
                            icon={Info}
                        />
                    </div>
                </div>

                {/* Notes section */}
                {booking.ghi_chu_dat_tour && (
                    <div className="px-6 pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Ghi chú</h3>
                        <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary text-sm">
                            {booking.ghi_chu_dat_tour}
                        </div>
                    </div>
                )}

                {/* System information */}
                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin hệ thống</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                        <DetailItem
                            label="Ngày đặt"
                            value={formatDate(booking.ngay_dat, true)}
                            icon={CalendarDays}
                        />
                        <DetailItem
                            label="Ngày tạo"
                            value={formatDate(booking.ngay_tao, true)}
                            icon={CalendarDays}
                        />
                        <DetailItem
                            label="Cập nhật lần cuối"
                            value={formatDate(booking.ngay_cap_nhat, true)}
                            icon={CalendarDays}
                        />
                        <DetailItem
                            label="ID lịch trình tour"
                            value={booking.id_lich_trinh_tour}
                            icon={Info}
                        />
                    </div>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6 mt-6">
                    <div className="text-right">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingDetailsModal;