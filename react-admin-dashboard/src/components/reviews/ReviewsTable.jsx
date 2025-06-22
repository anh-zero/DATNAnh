import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, ArrowDownUp, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Calendar, Filter, RefreshCw, Eye, Star, MessageSquare, Check, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatter';
import { getAllReviews, updateReview, deleteReview, approveReview } from '../../api/services/reviewService';
import ReviewDetailsModal from './ReviewDetailsModal';
import ReviewResponseModal from './ReviewResponseModal';
import ConfirmModal from '../common/ConfirmModal';

const ITEMS_PER_PAGE = 10;

const ReviewsTable = ({ onDataChange }) => {
    // States
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sortBy, setSortBy] = useState('ngay_danh_gia');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [totalReviews, setTotalReviews] = useState(0);
    const [timeoutId, setTimeoutId] = useState(null);
    const [error, setError] = useState(null);

    // Modal states
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // Search input ref
    const searchInputRef = useRef(null);

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
                trangThai: selectedStatus,
                diemDanhGia: selectedRating,
                tuNgay: fromDate,
                denNgay: toDate,
                sortBy,
                order: sortOrder
            };

            const response = await getAllReviews(params);

            if (response && response.success) {
                setReviews(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalReviews(response.totalItems || 0);
            } else {
                console.error("Failed to fetch reviews:", response?.message);
                setError(response?.message || "Không thể tải dữ liệu đánh giá tour");
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedStatus, selectedRating, fromDate, toDate, sortBy, sortOrder]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Handle search with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(() => {
            setCurrentPage(1);
        }, 300);

        setTimeoutId(newTimeoutId);
    };

    // Handle key press for search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            }

            setCurrentPage(1);
            fetchReviews();
        }
    };

    // Toggle sort order
    const handleSort = (columnName) => {
        if (sortBy === columnName) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(columnName);
            setSortOrder('ASC');
        }
        setCurrentPage(1);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedRating('');
        setFromDate('');
        setToDate('');
        setSortBy('ngay_danh_gia');
        setSortOrder('DESC');
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    // View review details
    const handleOpenDetailsModal = (review) => {
        setSelectedReview(review);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedReview(null);
    };

    // Response to review
    const handleOpenResponseModal = (review, e) => {
        e && e.stopPropagation();
        setSelectedReview(review);
        setShowResponseModal(true);
    };

    const handleCloseResponseModal = (refreshData = false) => {
        setShowResponseModal(false);
        setSelectedReview(null);
        if (refreshData) {
            fetchReviews();
            if (onDataChange) onDataChange();
        }
    };

    // Handle approve/reject
    const handleApprove = async (reviewId, e) => {
        e && e.stopPropagation();
        try {
            await approveReview(reviewId);
            fetchReviews();
            if (onDataChange) onDataChange();
            alert('Đã duyệt đánh giá thành công');
        } catch (error) {
            alert(`Lỗi khi duyệt đánh giá: ${error.message || 'Đã xảy ra lỗi'}`);
        }
    };

    // Handle delete confirmation
    const handleDelete = (reviewId, e) => {
        e && e.stopPropagation();
        setReviewToDelete(reviewId);
        setConfirmAction('delete');
        setIsConfirmModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        try {
            await deleteReview(reviewToDelete);
            alert('Xóa đánh giá thành công');

            if (reviews.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchReviews();
            }

            if (onDataChange) onDataChange();
        } catch (err) {
            alert(`Lỗi khi xóa đánh giá: ${err.message}`);
        } finally {
            closeConfirmModal();
        }
    };

    // Close confirm modal
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setReviewToDelete(null);
        setConfirmAction(null);
    };

    // Helper function to render sort icons
    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return sortOrder === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    // Helper function to render stars
    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                ))}
                <span className="ml-1 text-sm font-medium">{rating}/5</span>
            </div>
        );
    };

    // Helper function to get status badge class
    const getStatusBadgeClass = (approved) => {
        return approved
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    };

    return (
        <motion.div
            className="bg-theme-surface border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            {/* Header with search */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách đánh giá tour ({totalReviews})</h2>
                <div className="relative w-full sm:w-64">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm đánh giá..."
                        className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        className="absolute top-2.5 right-3 text-theme-text-secondary"
                        onClick={() => fetchReviews()}
                        disabled={loading}
                    >
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Filters section */}
            <div className="px-6 py-4 border-t border-b border-theme-border">
                <div className="flex flex-wrap gap-3 items-center">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="flex items-center px-3 py-2 border border-theme-border rounded-md hover:bg-theme-surface1"
                    >
                        <Filter size={18} className="mr-1" />
                        Bộ lọc
                        <ArrowDownUp size={16} className="ml-1" />
                    </button>
                    <button
                        onClick={resetFilters}
                        className="flex items-center px-3 py-2 border border-theme-border rounded-md hover:bg-theme-surface1"
                        title="Đặt lại bộ lọc"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Advanced filters */}
                {showAdvancedFilters && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                Trạng thái
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="1">Đã duyệt</option>
                                <option value="0">Chờ duyệt</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                Điểm đánh giá
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                            >
                                <option value="">Tất cả điểm</option>
                                <option value="5">5 sao</option>
                                <option value="4">4 sao</option>
                                <option value="3">3 sao</option>
                                <option value="2">2 sao</option>
                                <option value="1">1 sao</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                Từ ngày
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                                <Calendar className="absolute right-3 top-2.5 text-theme-text-secondary" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                Đến ngày
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                                <Calendar className="absolute right-3 top-2.5 text-theme-text-secondary" size={18} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="m-6 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                    <p><strong>Lỗi:</strong> {error}</p>
                </div>
            )}

            {/* Reviews table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                    <p className="mt-3 text-theme-text-secondary">Đang tải dữ liệu...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {searchTerm ? "Không tìm thấy đánh giá nào phù hợp với tìm kiếm của bạn." : "Chưa có đánh giá nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('id_danh_gia')}
                                >
                                    ID {renderSortIcon('id_danh_gia')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('id_dat_tour')}
                                >
                                    Mã đặt tour {renderSortIcon('id_dat_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('diem_danh_gia')}
                                >
                                    Đánh giá {renderSortIcon('diem_danh_gia')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap"
                                >
                                    Nội dung đánh giá
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('ngay_danh_gia')}
                                >
                                    Ngày đánh giá {renderSortIcon('ngay_danh_gia')}
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('da_duyet')}
                                >
                                    Trạng thái {renderSortIcon('da_duyet')}
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap"
                                >
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {reviews.map((review) => (
                                <motion.tr
                                    key={review.id_danh_gia}
                                    onClick={() => handleOpenDetailsModal(review)}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{review.id_danh_gia}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{review.id_dat_tour || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStars(review.diem_danh_gia)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="line-clamp-2 text-sm text-theme-text-primary">
                                            {review.binh_luan || 'Không có nội dung'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(review.ngay_danh_gia)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(review.da_duyet)}`}>
                                            {review.da_duyet ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                onClick={(e) => handleOpenDetailsModal(review)}
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="text-teal-500 hover:text-teal-700 p-1"
                                                onClick={(e) => handleOpenResponseModal(review, e)}
                                                title="Phản hồi"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            {!review.da_duyet && (
                                                <button
                                                    className="text-green-500 hover:text-green-700 p-1"
                                                    onClick={(e) => handleApprove(review.id_danh_gia, e)}
                                                    title="Duyệt đánh giá"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => handleDelete(review.id_danh_gia, e)}
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {totalReviews > 0 && totalPages > 1 && (
                <div className="mt-6 p-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
                    <div className="mb-2 sm:mb-0">
                        Hiển thị {reviews.length} trên tổng số {totalReviews} đánh giá. (Trang {currentPage}/{totalPages})
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang đầu"
                            >
                                <ChevronsLeft size={20} />
                            </button>
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang trước"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-3 py-1.5 border border-theme-border rounded">
                                {currentPage}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || loading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang sau"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages || loading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang cuối"
                            >
                                <ChevronsRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showDetailsModal && selectedReview && (
                <ReviewDetailsModal
                    review={selectedReview}
                    isOpen={showDetailsModal}
                    onClose={handleCloseDetailsModal}
                />
            )}

            {showResponseModal && selectedReview && (
                <ReviewResponseModal
                    review={selectedReview}
                    isOpen={showResponseModal}
                    onClose={handleCloseResponseModal}
                />
            )}

            {/* Confirm Modal for Delete */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmAction === 'delete' ? confirmDelete : null}
                title="Xác nhận xóa đánh giá"
                message="Bạn có chắc chắn muốn xóa đánh giá này? Thao tác này không thể hoàn tác."
                confirmText="Xóa"
                confirmButtonClass="bg-red-500 hover:bg-red-600"
            />
        </motion.div>
    );
};

export default ReviewsTable;