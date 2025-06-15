import React from 'react';
import { motion } from 'framer-motion';
import { X, CalendarDays, Clock, Tag, Users, DollarSign, Info, ImageOff, CheckCircle, XCircle, AlertCircle, Building } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateFormatter'; // Ensure you have these

const DetailItem = ({ label, value, icon: Icon, fullWidth = false, isHtml = false }) => (
    <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-theme-text-secondary">{label}:</span>
            {isHtml ? (
                <div className="text-theme-text-primary break-words text-base prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: value || '<span class="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>' }} />
            ) : (
                <p className="text-theme-text-primary break-words text-base">{value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}</p>
            )}
        </div>
    </div>
);

const TourDetailsModal = ({ tour, isOpen, onClose, isLoading }) => {
    const API_BASE_URL_FOR_IMAGES = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    if (!isOpen || (!tour && !isLoading)) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 w-full max-w-xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto mb-4"></div>
                    <p className="text-theme-text-primary">Đang tải chi tiết tour...</p>
                </div>
            </div>
        );
    }

    if (!tour) return null; // Should be handled by isLoading, but as a fallback

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-3xl relative border border-theme-border max-h-[90vh] flex flex-col shadow-xl p-6" // Added p-6 here
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
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
                            {tour.ten_tour}
                        </h2>
                        <p className="text-sm text-theme-text-secondary">ID Tour: {tour.id_san_pham_tour}</p>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-6"> {/* This part will scroll, its p-6 is now relative to the parent's p-6 */}
                    {tour.url_anh_bia && (
                        <div className="mb-4 rounded-md overflow-hidden border border-theme-border">
                            <img src={`${API_BASE_URL_FOR_IMAGES}${tour.url_anh_bia}`} alt={tour.ten_tour} className="w-full h-auto max-h-80 object-contain" />
                        </div>
                    )}
                    {!tour.url_anh_bia && (
                        <div className="mb-4 p-4 rounded-md border border-theme-border bg-gray-50 dark:bg-theme-surface flex items-center justify-center text-gray-400 dark:text-gray-500 h-40">
                            <ImageOff size={32} className="mr-2" /> Không có ảnh bìa
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Thông tin chung</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <DetailItem label="Tên Tour" value={tour.ten_tour} icon={Tag} fullWidth={true} />
                            <DetailItem label="Thời gian dự kiến" value={tour.thoi_gian_du_kien} icon={Clock} />
                            <DetailItem label="Ngày tạo" value={formatDateTime(tour.ngay_tao)} icon={CalendarDays} />
                            <DetailItem label="Cập nhật lần cuối" value={formatDateTime(tour.ngay_cap_nhat)} icon={CalendarDays} />
                        </div>
                    </div>

                    {tour.mo_ta_chi_tiet && (
                        <div className="border-t border-theme-border pt-4">
                            <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Mô tả chi tiết</h3>
                            {/* Removed DetailItem, directly render the description */}
                            <div
                                className="text-theme-text-primary break-words text-base prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: tour.mo_ta_chi_tiet }}
                            />
                        </div>
                    )}

                    {/* Associated Partners */}
                    {tour.partners && tour.partners.length > 0 && (
                        <div className="border-t border-theme-border pt-4">
                            <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Đối tác liên kết ({tour.partners.length})</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {tour.partners.map(p => (
                                    <div key={p.id_doi_tac} className="p-3 bg-gray-50 dark:bg-theme-surface rounded-md border border-theme-border">
                                        <p className="font-medium text-theme-text-primary">{p.ten_doi_tac} <span className="text-xs text-theme-text-secondary">(ID: {p.id_doi_tac})</span></p>
                                        {p.loai_hop_tac && <p className="text-sm text-theme-text-secondary">Loại hợp tác: {p.loai_hop_tac}</p>}
                                        {p.ghi_chu && <p className="text-sm text-theme-text-secondary mt-1"><em>Ghi chú: {p.ghi_chu}</em></p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {(!tour.partners || tour.partners.length === 0) && (
                        <div className="border-t border-theme-border pt-4">
                            <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Đối tác liên kết</h3>
                            <p className="italic text-gray-400 dark:text-gray-500">Chưa có đối tác nào liên kết với tour này.</p>
                        </div>
                    )}


                    {/* Associated Schedules */}
                    {tour.schedules && tour.schedules.length > 0 && (
                        <div className="border-t border-theme-border pt-4">
                            <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Lịch trình khởi hành ({tour.schedules.length})</h3>
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                {tour.schedules.map(s => (
                                    <div key={s.id_lich_trinh_tour} className="p-3 bg-gray-50 dark:bg-theme-surface rounded-md border border-theme-border">
                                        <p className="font-medium text-theme-text-primary">ID Lịch trình: {s.id_lich_trinh_tour}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-sm">
                                            <p>Ngày đi: <span className="font-semibold">{formatDate(s.ngay_khoi_hanh)}</span></p>
                                            <p>Ngày về: <span className="font-semibold">{formatDate(s.ngay_ket_thuc)}</span></p>
                                            <p>Giá: <span className="font-semibold">{s.gia_tien?.toLocaleString('vi-VN')} VNĐ</span></p>
                                            <p>Trạng thái: <span className="font-semibold">{s.trang_thai_lich_trinh}</span></p>
                                            <p>Chỗ tối đa: {s.so_luong_cho_toi_da}</p>
                                            <p>Chỗ đã đặt: {s.so_luong_cho_da_dat}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {(!tour.schedules || tour.schedules.length === 0) && (
                        <div className="border-t border-theme-border pt-4">
                            <h3 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Lịch trình khởi hành</h3>
                            <p className="italic text-gray-400 dark:text-gray-500">Chưa có lịch trình nào cho tour này.</p>
                        </div>
                    )}
                </div>

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

export default TourDetailsModal;