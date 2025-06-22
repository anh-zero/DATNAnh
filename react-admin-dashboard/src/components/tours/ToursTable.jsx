import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowDownUp, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { getAllTours, deleteTour, getTourById } from '../../api/services/tourService';
import { formatDate } from '../../utils/formatter';
import TourFormModal from './TourFormModal';
import TourDetailsModal from './TourDetailsModal';

const ITEMS_PER_PAGE = 10; // Sử dụng 10 mục mỗi trang

const ToursTable = () => {
    // State variables
    const [tours, setTours] = useState([]);
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
    const [sortBy, setSortBy] = useState('ngay_tao');
    const [order, setOrder] = useState('DESC');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [viewingTour, setViewingTour] = useState(null);

    // Thêm useRef cho input tìm kiếm
    const searchInputRef = useRef(null);

    // Fetch tours with parameters
    const fetchTours = useCallback(async () => {
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

            const response = await getAllTours(params);

            if (response.data?.tours) {
                setTours(response.data.tours);

                // Tính toán tổng số trang và tổng số mục
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalItems(response.pagination.totalItems || 0);
                }
            } else {
                setTours([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err) {
            const errorMessage = err.message || "Không thể tải dữ liệu tours.";
            setError(errorMessage);
            console.error("Tour loading error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, sortBy, order]);

    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    // Cải thiện hàm handleSearchChange tương tự như trong PartnersTable
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

            getAllTours(params).then(response => {
                // Cập nhật nhiều state trong một lần để giảm re-render
                setTours(response.data?.tours || []);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalItems(response.pagination.totalItems || 0);
                }
                setIsLoading(false);
            }).catch(err => {
                const errorMessage = err.message || "Không thể tải dữ liệu tours.";
                setError(errorMessage);
                console.error("Tour loading error:", err);
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
            fetchTours();
        }
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === 'ASC' ? 'DESC' : 'ASC';
        setSortBy(field);
        setOrder(newOrder);
        setCurrentPage(1); // Quay lại trang đầu khi sắp xếp
    };

    const handleDelete = async (tourId, e) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
            try {
                await deleteTour(tourId);
                alert('Xóa tour thành công');

                // Nếu xóa tour cuối cùng trên trang hiện tại, quay lại trang trước
                if (tours.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchTours();
                }
            } catch (err) {
                alert(`Lỗi khi xóa tour: ${err.message}`);
            }
        }
    };

    const handleOpenCreateModal = () => {
        setEditingTour(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (tour, e) => {
        e.stopPropagation();
        setEditingTour(tour);
        setIsFormModalOpen(true);
    };

    const onCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingTour(null);
        fetchTours(); // Cập nhật dữ liệu sau khi đóng modal
    };

    const handleOpenDetailsModal = async (tourId) => {
        try {
            setIsLoadingDetails(true);
            const tourDetails = await getTourById(tourId);
            setViewingTour(tourDetails);
            setIsDetailsModalOpen(true);
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết tour.");
            console.error("Fetch tour details error:", err);
            alert(err.message || "Không thể tải chi tiết tour.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const onCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingTour(null);
        fetchTours(); // Làm mới dữ liệu sau khi đóng modal
    };

    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return order === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    return (
        <motion.div className="bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách Tour</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm tour..."
                            className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            key="tour-search"
                            ref={(input) => input && document.activeElement === document.body && input.focus()} // Thêm dòng này
                        />
                        <button
                            className="absolute top-2.5 right-3 text-theme-text-secondary"
                            onClick={() => fetchTours()} // Thêm hành động tìm kiếm khi nhấn vào icon
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
                        <span className="hidden sm:inline">Thêm tour</span>
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
            ) : tours.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {searchTerm ? "Không tìm thấy tour nào phù hợp với tìm kiếm của bạn." : "Chưa có tour nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('id_san_pham_tour')}
                                >
                                    ID {renderSortIcon('id_san_pham_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ten_tour')}
                                >
                                    Tên Tour {renderSortIcon('ten_tour')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('thoi_gian_du_kien')}
                                >
                                    Thời gian {renderSortIcon('thoi_gian_du_kien')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ngay_cap_nhat')}
                                >
                                    Cập nhật {renderSortIcon('ngay_cap_nhat')}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {tours.map(tour => (
                                <motion.tr
                                    key={tour.id_san_pham_tour}
                                    onClick={() => handleOpenDetailsModal(tour.id_san_pham_tour)}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{tour.id_san_pham_tour}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {tour.url_anh_bia && (
                                                <div className="h-8 w-8 mr-3 flex-shrink-0">
                                                    <img
                                                        src={tour.url_anh_bia.startsWith('http')
                                                            ? tour.url_anh_bia
                                                            : `${API_BASE_URL}${tour.url_anh_bia}`}
                                                        alt={tour.ten_tour}
                                                        className="h-full w-full rounded object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="font-medium text-theme-text-primary">{tour.ten_tour}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tour.thoi_gian_du_kien || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(tour.ngay_cap_nhat, {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                onClick={(e) => handleOpenEditModal(tour, e)}
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => handleDelete(tour.id_san_pham_tour, e)}
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
                        Hiển thị {tours.length} trên tổng số {totalItems} tour. (Trang {currentPage}/{totalPages})
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
                <TourFormModal
                    isOpen={isFormModalOpen}
                    onClose={onCloseFormModal}
                    tour={editingTour}
                />
            )}

            {isDetailsModalOpen && (
                <TourDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    tour={viewingTour}
                    isLoading={isLoadingDetails}
                />
            )}
        </motion.div>
    );
};

export default ToursTable;