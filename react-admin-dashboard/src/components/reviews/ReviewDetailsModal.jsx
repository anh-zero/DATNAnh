import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/formatter';
import { getBookingById } from '../../api/services/bookingService';

const ReviewDetailsModal = ({ review, isOpen, onClose }) => {
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isLoadingBooking, setIsLoadingBooking] = useState(false);
    const [error, setError] = useState(null);

    // Fetch booking details if available
    useEffect(() => {
        if (isOpen && review && review.id_dat_tour) {
            const fetchBookingDetails = async () => {
                setIsLoadingBooking(true);
                setError(null);
                try {
                    const bookingData = await getBookingById(review.id_dat_tour);
                    setBookingDetails(bookingData);
                } catch (err) {
                    console.error("Error fetching booking details:", err);
                    setError("Không thể tải thông tin đặt tour");
                } finally {
                    setIsLoadingBooking(false);
                }
            };

            fetchBookingDetails();
        }
    }, [isOpen, review]);

    // Render stars for rating
    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={20}
                        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    if (!isOpen || !review) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl bg-theme-surface border border-theme-border rounded-lg shadow-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
                        <h2 className="text-lg font-medium text-theme-text-primary">Chi tiết đánh giá</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 hover:bg-theme-background"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        <div className="space-y-6">
                            {/* Rating */}
                            <div>
                                <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Điểm đánh giá</h3>
                                <div className="flex items-center space-x-2">
                                    {renderStars(review.diem_danh_gia)}
                                    <span className="text-lg font-medium text-theme-text-primary">{review.diem_danh_gia}/5</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Nội dung đánh giá</h3>
                                <div className="p-3 bg-theme-background rounded-md text-theme-text-primary">
                                    {review.binh_luan || 'Không có nội dung đánh giá'}
                                </div>
                            </div>

                            {/* Admin response */}
                            {review.phan_hoi_quan_tri && (
                                <div>
                                    <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Phản hồi của công ty</h3>
                                    <div className="p-3 bg-theme-surface1 rounded-md text-theme-text-primary">
                                        {review.phan_hoi_quan_tri}
                                    </div>
                                </div>
                            )}

                            {/* Related booking info */}
                            {isLoadingBooking ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-theme-primary border-t-transparent"></div>
                                </div>
                            ) : error ? (
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                                    {error}
                                </div>
                            ) : bookingDetails ? (
                                <div className="border-t border-theme-border pt-4 mt-4">
                                    <h3 className="text-sm font-medium text-theme-text-secondary mb-3">Thông tin đặt tour</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start space-x-2">
                                            <Tag size={16} className="mt-0.5 text-theme-text-secondary" />
                                            <div>
                                                <div className="text-xs text-theme-text-secondary">Tour</div>
                                                <div className="text-sm text-theme-text-primary">{bookingDetails.ten_tour || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <User size={16} className="mt-0.5 text-theme-text-secondary" />
                                            <div>
                                                <div className="text-xs text-theme-text-secondary">Khách hàng</div>
                                                <div className="text-sm text-theme-text-primary">{bookingDetails.ho_ten || bookingDetails.ten_khach_hang || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <Calendar size={16} className="mt-0.5 text-theme-text-secondary" />
                                            <div>
                                                <div className="text-xs text-theme-text-secondary">Ngày đặt</div>
                                                <div className="text-sm text-theme-text-primary">
                                                    {bookingDetails.ngay_dat ? formatDate(bookingDetails.ngay_dat) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <MessageSquare size={16} className="mt-0.5 text-theme-text-secondary" />
                                            <div>
                                                <div className="text-xs text-theme-text-secondary">Trạng thái đơn</div>
                                                <div className="text-sm text-theme-text-primary">{bookingDetails.trang_thai_dat_tour || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : review.id_dat_tour ? (
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                                    Mã đặt tour: #{review.id_dat_tour}
                                </div>
                            ) : null}

                            {/* Review metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-theme-text-secondary border-t border-theme-border pt-4">
                                <div>
                                    <span className="block">Ngày đánh giá:</span>
                                    <span className="text-theme-text-primary">{formatDate(review.ngay_danh_gia)}</span>
                                </div>
                                <div>
                                    <span className="block">Trạng thái:</span>
                                    <span className={`${review.da_duyet ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {review.da_duyet ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-theme-border flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-theme-background hover:bg-theme-surface1 border border-theme-border rounded-md text-sm font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewDetailsModal;