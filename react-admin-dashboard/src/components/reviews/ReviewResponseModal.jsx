import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateReview, approveReview } from '../../api/services/reviewService';

const ReviewResponseModal = ({ review, isOpen, onClose }) => {
    const [response, setResponse] = useState(review?.phan_hoi_quan_tri || '');
    const [approveWithResponse, setApproveWithResponse] = useState(!review?.da_duyet);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Update with response
            await updateReview(review.id_danh_gia, {
                phan_hoi_quan_tri: response
            });

            // If not yet approved and want to approve
            if (!review.da_duyet && approveWithResponse) {
                await approveReview(review.id_danh_gia);
            }

            onClose(true); // Close with refresh
        } catch (err) {
            console.error("Error updating review:", err);
            setError(err.message || "Đã xảy ra lỗi khi cập nhật phản hồi");
        } finally {
            setIsSubmitting(false);
        }
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
                    className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-lg shadow-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
                        <h2 className="text-lg font-medium text-theme-text-primary">Phản hồi đánh giá</h2>
                        <button
                            onClick={() => onClose()}
                            className="rounded-full p-1 hover:bg-theme-background"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4">
                            <div className="space-y-5">
                                {/* Review info */}
                                <div className="p-4 bg-theme-background rounded-md">
                                    <div className="flex items-center space-x-2 mb-2">
                                        {renderStars(review.diem_danh_gia)}
                                        <span className="font-medium text-theme-text-primary">{review.diem_danh_gia}/5</span>
                                    </div>
                                    <p className="text-theme-text-primary text-sm">
                                        {review.binh_luan || 'Không có nội dung đánh giá'}
                                    </p>
                                </div>

                                {/* Response field */}
                                <div>
                                    <label htmlFor="response" className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Phản hồi của công ty
                                    </label>
                                    <textarea
                                        id="response"
                                        className="w-full px-4 py-2 border border-theme-border rounded-md bg-theme-background focus:outline-none focus:ring-2 focus:ring-theme-primary resize-y"
                                        rows="5"
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Nhập phản hồi của bạn ở đây..."
                                        required
                                    ></textarea>
                                </div>

                                {/* Approval checkbox */}
                                {!review.da_duyet && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="approveWithResponse"
                                            className="rounded border-theme-border text-theme-primary focus:ring-theme-primary"
                                            checked={approveWithResponse}
                                            onChange={(e) => setApproveWithResponse(e.target.checked)}
                                        />
                                        <label
                                            htmlFor="approveWithResponse"
                                            className="ml-2 block text-sm text-theme-text-secondary"
                                        >
                                            Duyệt đánh giá khi gửi phản hồi
                                        </label>
                                    </div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-theme-border flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => onClose()}
                                className="px-4 py-2 bg-theme-background hover:bg-theme-surface1 border border-theme-border rounded-md text-sm font-medium"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-md text-sm font-medium flex items-center gap-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>Gửi phản hồi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewResponseModal;