import React from 'react';
import { motion } from 'framer-motion';
import { X, CalendarDays, Clock, Tag, Users, DollarSign, Info, CheckCircle, XCircle, AlertCircle, Building, Hash, Edit3 } from 'lucide-react';
import { formatDate, formatDateTime, formatPrice } from '../../utils/formatter';

// DetailItem component (có thể copy từ TourDetailsModal hoặc tạo chung)
const DetailItem = ({ label, value, icon: Icon, fullWidth = false, isHtml = false, valueClassName = '' }) => (
    <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-theme-text-secondary">{label}:</span>
            {isHtml ? (
                <div className={`text-theme-text-primary break-words text-base prose prose-sm dark:prose-invert max-w-none ${valueClassName}`} dangerouslySetInnerHTML={{ __html: value || '<span class="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>' }} />
            ) : (
                <p className={`text-theme-text-primary break-words text-base ${valueClassName}`}>{value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}</p>
            )}
        </div>
    </div>
);


const TourScheduleDetailsModal = ({ schedule, isOpen, onClose, isLoading, onEdit }) => {
    if (!isOpen || (!schedule && !isLoading)) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 w-full max-w-xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto mb-4"></div>
                    <p className="text-theme-text-primary">Đang tải chi tiết lịch trình...</p>
                </div>
            </div>
        );
    }

    if (!schedule) return null;

    const getStatusClass = (status) => {
        switch (status) {
            case 'Đang bán': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
            case 'Sắp mở bán': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
            case 'Hết chỗ': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100';
            case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
            case 'Đang diễn ra': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100';
            case 'Đã kết thúc': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-2xl relative border border-theme-border max-h-[90vh] flex flex-col shadow-xl p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-theme-surface dark:bg-theme-surface0 border-b border-theme-border p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-theme-text-secondary hover:text-theme-primary"
                        aria-label="Đóng modal"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex flex-col items-center pr-8 text-center">
                        <h2 className="text-2xl font-semibold text-theme-text-primary mb-1">
                            Chi tiết Lịch trình Tour
                        </h2>
                        <p className="text-sm text-theme-text-secondary">ID Lịch trình: {schedule.id_lich_trinh_tour}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Thông tin Lịch trình</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <DetailItem label="ID Lịch trình" value={schedule.id_lich_trinh_tour} icon={Hash} />
                            <DetailItem label="ID Tour" value={schedule.id_san_pham_tour} icon={Tag} />
                            <DetailItem label="Ngày khởi hành" value={formatDate(schedule.ngay_khoi_hanh)} icon={CalendarDays} />
                            <DetailItem label="Ngày kết thúc" value={formatDate(schedule.ngay_ket_thuc)} icon={CalendarDays} />
                            <DetailItem label="Giá tiền" value={formatPrice(schedule.gia_tien)} icon={DollarSign} />
                            <DetailItem label="Số chỗ tối đa" value={schedule.so_luong_cho_toi_da} icon={Users} />
                            <DetailItem label="Số chỗ đã đặt" value={schedule.so_luong_cho_da_dat || 0} icon={Users} />
                            <DetailItem 
                                label="Trạng thái" 
                                value={schedule.trang_thai_lich_trinh} 
                                icon={schedule.trang_thai_lich_trinh === 'Đang bán' ? CheckCircle : schedule.trang_thai_lich_trinh === 'Đã hủy' ? XCircle : AlertCircle}
                                valueClassName={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(schedule.trang_thai_lich_trinh)}`}
                            />
                        </div>
                    </div>
                    
                    <div className="border-t border-theme-border pt-4">
                        <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Thông tin Hệ thống</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <DetailItem label="Ngày tạo" value={formatDateTime(schedule.ngay_tao)} icon={CalendarDays} />
                            <DetailItem label="Cập nhật lần cuối" value={formatDateTime(schedule.ngay_cap_nhat)} icon={CalendarDays} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 bg-theme-surface dark:bg-theme-surface0 border-t border-theme-border p-6">
                    <div className="text-right">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary transition-colors duration-150"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourScheduleDetailsModal;