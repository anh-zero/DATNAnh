import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowDownUp, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Calendar, Ban } from 'lucide-react';
import { getAllTourSchedules, deleteTourSchedule, getTourScheduleById, cancelTourSchedule } from '../../api/services/tourScheduleService';
import { formatDate, formatCurrency } from '../../utils/formatter';
import TourScheduleFormModal from './TourScheduleFormModal';
import TourScheduleDetailsModal from './TourScheduleDetailsModal';
import ConfirmModal from '../common/ConfirmModal';

const ITEMS_PER_PAGE = 10;

const TourSchedulesTable = () => {
    // State variables
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Sorting
    const [sortBy, setSortBy] = useState('ngay_khoi_hanh');
    const [order, setOrder] = useState('DESC');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [viewingSchedule, setViewingSchedule] = useState(null);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // Search input ref
    const searchInputRef = useRef(null);

    // Fetch schedules with parameters
    const fetchSchedules = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);

            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: searchTerm,
                sortBy,
                order
            };

            const response = await getAllTourSchedules(params);

            if (response.data?.schedules) {
                setSchedules(response.data.schedules);

                // Tính toán tổng số trang và tổng số mục
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalItems(response.pagination.totalItems || 0);
                }
            } else {
                setSchedules([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err) {
            const errorMessage = err.message || "Không thể tải dữ liệu lịch trình.";
            setError(errorMessage);
            console.error("Schedule loading error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, sortBy, order]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Cải thiện hàm handleSearchChange tương tự như trong ToursTable
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Đảm bảo không gọi API quá nhiều
        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(() => {
            // Đặt lại trang về 1 khi tìm kiếm
            setCurrentPage(1);
            setIsLoading(true);

            const params = {
                page: 1,
                limit: ITEMS_PER_PAGE,
                search: value,
                sortBy,
                order
            };

            getAllTourSchedules(params).then(response => {
                setSchedules(response.data?.schedules || []);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalItems(response.pagination.totalItems || 0);
                }
                setIsLoading(false);
            }).catch(err => {
                const errorMessage = err.message || "Không thể tải dữ liệu lịch trình.";
                setError(errorMessage);
                console.error("Schedule loading error:", err);
                setIsLoading(false);
            });
        }, 300); // Đợi 300ms để tránh gọi API quá nhiều

        setTimeoutId(newTimeoutId);
    };

    // Thêm hàm xử lý phím Enter để tìm kiếm ngay lập tức
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            }

            setCurrentPage(1);
            fetchSchedules();
        }
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === 'ASC' ? 'DESC' : 'ASC';
        setSortBy(field);
        setOrder(newOrder);
        setCurrentPage(1); // Quay lại trang đầu khi sắp xếp
    };

    const handleDelete = (scheduleId, e) => {
        e && e.stopPropagation();
        setScheduleToDelete(scheduleId);
        setConfirmAction('delete');
        setIsConfirmModalOpen(true);
    };

    const handleCancel = (scheduleId, e) => {
        e && e.stopPropagation();
        setScheduleToDelete(scheduleId);
        setConfirmAction('cancel');
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!scheduleToDelete) return;

        try {
            await deleteTourSchedule(scheduleToDelete);
            alert('Xóa lịch trình thành công');

            // Nếu xóa lịch trình cuối cùng trên trang hiện tại, quay lại trang trước
            if (schedules.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchSchedules();
            }
        } catch (err) {
            alert(`Lỗi khi xóa lịch trình: ${err.message}`);
        } finally {
            closeConfirmModal();
        }
    };

    const confirmCancel = async () => {
        if (!scheduleToDelete) return;

        try {
            await cancelTourSchedule(scheduleToDelete);
            alert('Hủy lịch trình thành công');
            fetchSchedules();
        } catch (err) {
            alert(`Lỗi khi hủy lịch trình: ${err.message}`);
        } finally {
            closeConfirmModal();
        }
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setScheduleToDelete(null);
        setConfirmAction(null);
    };

    const handleOpenCreateModal = () => {
        setEditingSchedule(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (schedule, e) => {
        e.stopPropagation();
        setEditingSchedule(schedule);
        setIsFormModalOpen(true);
    };

    const onCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSchedule(null);
        fetchSchedules();
    };

    const handleOpenDetailsModal = async (scheduleId) => {
        try {
            setIsLoadingDetails(true);
            const scheduleDetails = await getTourScheduleById(scheduleId);
            setViewingSchedule(scheduleDetails);
            setIsDetailsModalOpen(true);
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết lịch trình.");
            console.error("Fetch schedule details error:", err);
            alert(err.message || "Không thể tải chi tiết lịch trình.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const onCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingSchedule(null);
        fetchSchedules(); // Refresh data after modal close
    };

    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return order === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Đang mở bán':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Sắp mở bán':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Hết chỗ':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Đã khởi hành':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Đã kết thúc':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
            case 'Đã hủy':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    return (
        <motion.div className="bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách Lịch khởi hành</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm lịch trình..."
                            className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            key="schedule-search"
                            ref={(input) => input && document.activeElement === document.body && input.focus()}
                        />
                        <button
                            className="absolute top-2.5 right-3 text-theme-text-secondary"
                            onClick={() => fetchSchedules()}
                            disabled={isLoading}
                        >
                            <Search size={18} />
                        </button>
                    </div>
                    <button
                        className="flex items-center gap-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-2 px-4 rounded-lg whitespace-nowrap justify-center"
                        onClick={handleOpenCreateModal}
                        disabled={isLoading}
                    >
                        <span className="hidden sm:inline">Thêm lịch trình</span>
                        <span className="sm:hidden">+ Mới</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                    <p><strong>Lỗi:</strong> {error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                    <p className="mt-3 text-theme-text-secondary">Đang tải dữ liệu...</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {searchTerm ? "Không tìm thấy lịch trình nào phù hợp với tìm kiếm của bạn." : "Chưa có lịch trình nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('id_lich_trinh_tour')}
                                >
                                    ID {renderSortIcon('id_lich_trinh_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ten_tour')}
                                >
                                    Tour {renderSortIcon('ten_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ngay_khoi_hanh')}
                                >
                                    Khởi hành {renderSortIcon('ngay_khoi_hanh')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('gia_tien')}
                                >
                                    Giá tour {renderSortIcon('gia_tien')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('trang_thai_lich_trinh')}
                                >
                                    Trạng thái {renderSortIcon('trang_thai_lich_trinh')}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {schedules.map(schedule => (
                                <motion.tr
                                    key={schedule.id_lich_trinh_tour}
                                    onClick={() => handleOpenDetailsModal(schedule.id_lich_trinh_tour)}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{schedule.id_lich_trinh_tour}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {schedule?.sanphamtour?.url_anh_bia && (
                                                <div className="h-8 w-8 mr-3 flex-shrink-0">
                                                    <img
                                                        src={schedule.sanphamtour.url_anh_bia.startsWith('http')
                                                            ? schedule.sanphamtour.url_anh_bia
                                                            : `${API_BASE_URL}${schedule.sanphamtour.url_anh_bia}`}
                                                        alt={schedule.sanphamtour?.ten_tour}
                                                        className="h-full w-full rounded object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="font-medium text-theme-text-primary">
                                                {schedule.ten_tour ||
                                                    (schedule.sanphamtour?.ten_tour || 'Tour không xác định')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(schedule.ngay_khoi_hanh)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatCurrency(schedule.gia_tien)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(schedule.trang_thai_lich_trinh)}`}>
                                            {schedule.trang_thai_lich_trinh}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                className="text-teal-500 hover:text-teal-700 p-1"
                                                onClick={(e) => handleOpenEditModal(schedule, e)}
                                                title="Sửa"
                                                disabled={schedule.trang_thai_lich_trinh === 'Đã hủy'}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {schedule.trang_thai_lich_trinh !== 'Đã hủy' && (
                                                <button
                                                    className="text-yellow-500 hover:text-yellow-700 p-1"
                                                    onClick={(e) => handleCancel(schedule.id_lich_trinh_tour, e)}
                                                    title="Hủy lịch trình"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            )}
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => handleDelete(schedule.id_lich_trinh_tour, e)}
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
            {totalItems > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
                    <div className="mb-2 sm:mb-0">
                        Hiển thị {schedules.length} trên tổng số {totalItems} lịch trình. (Trang {currentPage}/{totalPages})
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang đầu"
                            >
                                <ChevronsLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang trước"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-3 py-1.5 border border-theme-border rounded">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2 rounded hover:bg-theme-background disabled:opacity-50"
                                title="Trang sau"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages || isLoading}
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
            {isFormModalOpen && (
                <TourScheduleFormModal
                    isOpen={isFormModalOpen}
                    onClose={onCloseFormModal}
                    schedule={editingSchedule}
                />
            )}

            {isDetailsModalOpen && (
                <TourScheduleDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    schedule={viewingSchedule}
                    isLoading={isLoadingDetails}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmAction === 'delete' ? confirmDelete : confirmCancel}
                title={confirmAction === 'delete' ? "Xác nhận xóa" : "Xác nhận hủy lịch trình"}
                message={
                    confirmAction === 'delete'
                        ? "Bạn có chắc chắn muốn xóa lịch trình này? Thao tác này không thể hoàn tác."
                        : "Bạn có chắc chắn muốn hủy lịch trình này? Đơn đặt tour hiện có sẽ bị ảnh hưởng."
                }
                confirmText={confirmAction === 'delete' ? "Xóa" : "Hủy lịch trình"}
                confirmButtonClass={confirmAction === 'delete' ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}
            />
        </motion.div>
    );
};

export default TourSchedulesTable;