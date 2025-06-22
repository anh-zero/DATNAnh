import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, ArrowDownUp, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Calendar, Ban, Filter, RefreshCw, Eye, Phone, User, X, DollarSign, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency } from '../../utils/formatter';
import { getAllBookings, getBookingById, cancelBooking, deleteBooking } from '../../api/services/bookingService';
import BookingDetailsModal from './BookingDetailsModal';
import BookingFormModal from './BookingFormModal';
import ConfirmModal from '../common/ConfirmModal';

const ITEMS_PER_PAGE = 10;

const BookingsTable = () => {
    // States
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sortBy, setSortBy] = useState('ngay_tao');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [totalBookings, setTotalBookings] = useState(0);
    const [timeoutId, setTimeoutId] = useState(null);
    const [error, setError] = useState(null);

    // Modal states
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Search input ref
    const searchInputRef = useRef(null);

    // Fetch bookings
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
                trangThaiDatTour: selectedStatus,
                trangThaiThanhToan: selectedPaymentStatus,
                tuNgay: fromDate,
                denNgay: toDate,
                sortBy,
                order: sortOrder
            };

            const response = await getAllBookings(params);

            // Thêm vào hàm fetchBookings trước khi set state bookings
            console.log("API response for bookings:", response);

            if (response && response.success) {
                setBookings(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalBookings(response.totalItems || 0);
            } else {
                console.error("Failed to fetch bookings:", response?.message);
                setError(response?.message || "Không thể tải dữ liệu đơn đặt tour");
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedStatus, selectedPaymentStatus, fromDate, toDate, sortBy, sortOrder]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handle search with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Đảm bảo không gọi API quá nhiều
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
            fetchBookings();
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
        setCurrentPage(1); // Quay lại trang đầu khi sắp xếp
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedPaymentStatus('');
        setFromDate('');
        setToDate('');
        setSortBy('ngay_tao');
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

    // View booking details
    const handleOpenDetailsModal = async (bookingId) => {
        try {
            setIsLoadingDetails(true);
            const bookingDetails = await getBookingById(bookingId);
            setSelectedBooking(bookingDetails);
            setShowDetailsModal(true);
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết đơn đặt tour.");
            console.error("Fetch booking details error:", err);
            alert(err.message || "Không thể tải chi tiết đơn đặt tour.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedBooking(null);
        fetchBookings(); // Refresh data after modal close
    };

    // Edit booking
    const handleOpenEditModal = (booking, e) => {
        e && e.stopPropagation();
        setSelectedBooking(booking);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedBooking(null);
        fetchBookings();
    };

    // Handle delete confirmation
    const handleDelete = (bookingId, e) => {
        e && e.stopPropagation();
        setBookingToDelete(bookingId);
        setConfirmAction('delete');
        setIsConfirmModalOpen(true);
    };

    // Handle cancel confirmation
    const handleCancelConfirm = (bookingId, e) => {
        e && e.stopPropagation();
        setBookingToDelete(bookingId);
        setConfirmAction('cancel');
        setIsConfirmModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!bookingToDelete) return;

        try {
            await deleteBooking(bookingToDelete);
            alert('Xóa đơn đặt tour thành công');

            // Nếu xóa đơn đặt tour cuối cùng trên trang hiện tại, quay lại trang trước
            if (bookings.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchBookings();
            }
        } catch (err) {
            alert(`Lỗi khi xóa đơn đặt tour: ${err.message}`);
        } finally {
            closeConfirmModal();
        }
    };

    // Confirm cancel
    const confirmCancel = async () => {
        if (!bookingToDelete) return;

        try {
            const response = await cancelBooking(bookingToDelete, cancelReason);
            if (response && response.success) {
                alert('Hủy đơn đặt tour thành công');
                fetchBookings();
            } else {
                alert(`Lỗi: ${response?.message || 'Không thể hủy đơn đặt tour'}`);
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert(`Lỗi: ${error.message || 'Không thể hủy đơn đặt tour'}`);
        } finally {
            closeConfirmModal();
        }
    };

    // Close confirm modal
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setBookingToDelete(null);
        setConfirmAction(null);
        setCancelReason('');
    };

    // Helper function to render sort icons
    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return sortOrder === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    // Helper function to get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Mới':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Đã xác nhận':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Chờ thanh toán':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Hoàn thành':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Đã hủy':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    // Helper function to get payment status badge class
    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'Chờ thanh toán':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'Thanh toán một phần':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Đã thanh toán':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Hoàn tiền':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <motion.div
            className="bg-theme-surface border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            {/* Header with Add button */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách đặt tour ({totalBookings})</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            className="absolute top-2.5 right-3 text-theme-text-secondary"
                            onClick={() => fetchBookings()}
                            disabled={loading}
                        >
                            <Search size={18} />
                        </button>
                    </div>
                    <button
                        className="flex items-center gap-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-2 px-4 rounded-lg whitespace-nowrap justify-center"
                        onClick={() => {
                            setSelectedBooking(null);
                            setShowEditModal(true);
                        }}
                        disabled={loading}
                    >
                        <span className="hidden sm:inline">Thêm đơn đặt tour</span>
                        <span className="sm:hidden">+ Mới</span>
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
                                Trạng thái đặt tour
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Mới">Mới</option>
                                <option value="Đã xác nhận">Đã xác nhận</option>
                                <option value="Chờ thanh toán">Chờ thanh toán</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Đã hủy">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                Trạng thái thanh toán
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-theme-border rounded-md bg-theme-background"
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Chờ thanh toán">Chờ thanh toán</option>
                                <option value="Thanh toán một phần">Thanh toán một phần</option>
                                <option value="Đã thanh toán">Đã thanh toán</option>
                                <option value="Hoàn tiền">Hoàn tiền</option>
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

            {/* Bookings table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                    <p className="mt-3 text-theme-text-secondary">Đang tải dữ liệu...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {searchTerm ? "Không tìm thấy đơn đặt tour nào phù hợp với tìm kiếm của bạn." : "Chưa có đơn đặt tour nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('id_dat_tour')}
                                >
                                    ID {renderSortIcon('id_dat_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('ho_ten')}
                                >
                                    Khách hàng {renderSortIcon('ho_ten')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                >
                                    SĐT liên hệ
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('ten_tour')}
                                >
                                    Tour {renderSortIcon('ten_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('ngay_dat')}
                                >
                                    Ngày đặt {renderSortIcon('ngay_dat')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('tong_tien_thanh_toan')}
                                >
                                    Tổng tiền {renderSortIcon('tong_tien_thanh_toan')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('trang_thai_dat_tour')}
                                >
                                    Trạng thái đặt tour {renderSortIcon('trang_thai_dat_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                    onClick={() => handleSort('trang_thai_thanh_toan')}
                                >
                                    Trạng thái TT {renderSortIcon('trang_thai_thanh_toan')}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {bookings.map((booking) => (
                                <motion.tr
                                    key={booking.id_dat_tour}
                                    onClick={() => handleOpenDetailsModal(booking.id_dat_tour)}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{booking.id_dat_tour}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-theme-primary/10 flex items-center justify-center mr-3">
                                                <User size={16} className="text-theme-primary" />
                                            </div>
                                            <div className="font-medium text-theme-text-primary">
                                                {booking.ho_ten || booking.ten_khach_hang || 'Chưa có tên'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-theme-text-secondary">
                                            <Phone size={14} className="mr-2" />
                                            {booking.so_dien_thoai || booking.sdt_khach_hang || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-theme-text-primary">{booking.ten_tour || 'Tour không xác định'}</div>
                                        <div className="text-xs text-theme-text-secondary">
                                            {booking.ngay_khoi_hanh ? formatDate(booking.ngay_khoi_hanh) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {booking.ngay_dat ? formatDate(booking.ngay_dat) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-theme-text-primary">
                                            {(booking.tong_tien_du_kien !== undefined && booking.tong_tien_du_kien !== null)
                                                ? formatCurrency(booking.tong_tien_du_kien)
                                                : 'N/A'}
                                        </div>
                                        {(booking.tong_tien_thanh_toan !== undefined && booking.tong_tien_thanh_toan !== null) && (
                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                Đã TT: {formatCurrency(booking.tong_tien_thanh_toan)}
                                            </div>
                                        )}
                                    </td>
                                    {/* Cột Trạng thái tour */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(booking.trang_thai_dat_tour)}`}>
                                            {booking.trang_thai_dat_tour || 'N/A'}
                                        </span>
                                    </td>
                                    {/* Cột Trạng thái thanh toán */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusBadgeClass(booking.trang_thai_thanh_toan)}`}>
                                            {booking.trang_thai_thanh_toan || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                className="text-teal-500 hover:text-teal-700 p-1"
                                                onClick={(e) => handleOpenEditModal(booking, e)}
                                                title="Sửa"
                                                disabled={booking.trang_thai_dat_tour === 'Đã hủy'}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {booking.trang_thai_dat_tour !== 'Đã hủy' && (
                                                <button
                                                    className="text-yellow-500 hover:text-yellow-700 p-1"
                                                    onClick={(e) => handleCancelConfirm(booking.id_dat_tour, e)}
                                                    title="Hủy đơn"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            )}
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => handleDelete(booking.id_dat_tour, e)}
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
            {totalBookings > 0 && totalPages > 1 && (
                <div className="mt-6 p-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
                    <div className="mb-2 sm:mb-0">
                        Hiển thị {bookings.length} trên tổng số {totalBookings} đơn đặt tour. (Trang {currentPage}/{totalPages})
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
            {showDetailsModal && selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    isOpen={showDetailsModal}
                    onClose={handleCloseDetailsModal}
                    isLoading={isLoadingDetails}
                />
            )}

            {showEditModal && (
                <BookingFormModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    booking={selectedBooking}
                />
            )}

            {/* Confirm Modal for Delete/Cancel */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmAction === 'delete' ? confirmDelete : confirmCancel}
                title={confirmAction === 'delete' ? "Xác nhận xóa" : "Xác nhận hủy đơn đặt tour"}
                message={
                    confirmAction === 'delete'
                        ? "Bạn có chắc chắn muốn xóa đơn đặt tour này? Thao tác này không thể hoàn tác."
                        : "Bạn có chắc chắn muốn hủy đơn đặt tour này? Hành động này sẽ thay đổi trạng thái đơn hàng."
                }
                confirmText={confirmAction === 'delete' ? "Xóa" : "Hủy đơn"}
                confirmButtonClass={confirmAction === 'delete' ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}
            >
                {confirmAction === 'cancel' && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                            Lý do hủy đơn (tùy chọn)
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-theme-primary bg-theme-background"
                            rows="3"
                            placeholder="Nhập lý do hủy đơn đặt tour..."
                        />
                    </div>
                )}
            </ConfirmModal>
        </motion.div>
    );
};

export default BookingsTable;