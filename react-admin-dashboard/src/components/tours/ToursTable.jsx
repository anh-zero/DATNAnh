import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, ImageOff, ArrowDownUp, CalendarCog, PackagePlus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'; // Thêm PackagePlus và các icon phân trang
import { Link } from 'react-router-dom'; // Đảm bảo đã import Link
import { getAllTours, deleteTour, getTourById } from '../../api/services/tourService';
import TourFormModal from './TourFormModal';
import TourDetailsModal from './TourDetailsModal';
import { formatDate } from '../../utils/dateFormatter'; // Create this utility if you don't have one

const ITEMS_PER_PAGE = 10;

const ToursTable = () => {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState(null);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingTour, setViewingTour] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [sortBy, setSortBy] = useState('ngay_tao'); // Default sort
    const [order, setOrder] = useState('DESC');

    const fetchTours = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm: searchTerm,
                sortBy: sortBy,
                order: order,
            };
            const response = await getAllTours(params);
            setTours(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
            setTotalItems(response.pagination?.totalItems || 0);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách tour.');
            console.error("Fetch tours error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, sortBy, order]);

    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === 'ASC' ? 'DESC' : 'ASC';
        setSortBy(field);
        setOrder(newOrder);
        setCurrentPage(1); // Reset to first page on new sort
    };

    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return order === 'ASC' ? '▲' : '▼';
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    const handleOpenCreateModal = () => {
        setEditingTour(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (tour) => {
        setEditingTour(tour);
        setIsFormModalOpen(true);
    };

    const onCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingTour(null);
    };

    const handleFormSubmit = async () => {
        onCloseFormModal();
        await fetchTours(); // Refresh data
        // Optionally, re-fetch stats if a tour is created/updated
    };

    const handleOpenDetailsModal = async (tourId) => {
        setIsLoadingDetails(true);
        setError(null);
        try {
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
    };

    const handleDeleteTour = async (tourId, tourName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tour "${tourName}" (ID: ${tourId}) không? Hành động này không thể hoàn tác.`)) {
            setIsLoading(true); // Or a specific deleting state
            try {
                await deleteTour(tourId);
                alert(`Tour "${tourName}" đã được xóa thành công.`);
                await fetchTours(); // Refresh
            } catch (err) {
                const errorMsg = err.message || 'Lỗi không xác định khi xóa tour.';
                setError("Lỗi khi xóa tour: " + errorMsg);
                alert("Lỗi khi xóa tour: " + errorMsg);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const API_BASE_URL_FOR_IMAGES = import.meta.env.VITE_API_URL || 'http://localhost:3001';


    return (
        <motion.div
            className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
                <h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách Sản phẩm Tour</h2>
                <div className='flex items-center space-x-0 sm:space-x-4 w-full sm:w-auto'>
                    <div className='relative flex-grow sm:flex-grow-0'>
                        <input
                            type='text'
                            placeholder='Tìm kiếm tên tour...'
                            className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary w-full'
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary' size={18} />
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className='flex items-center bg-theme-primary hover:bg-theme-primary-hover text-white px-3 sm:px-4 py-2 rounded-lg transition duration-200 ml-2 sm:ml-0 shrink-0'
                    >
                        <PackagePlus size={18} className='mr-0 sm:mr-2' />
                        <span className="hidden sm:inline">Thêm Tour</span>
                    </button>
                </div>
            </div>

            {isLoading && !tours.length ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto"></div>
                    <p className="mt-4 text-theme-text-secondary">Đang tải dữ liệu tours...</p>
                </div>
            ) : error && !tours.length ? (
                <div className="bg-red-100 dark:bg-red-900 bg-opacity-25 text-red-700 dark:text-red-300 p-4 rounded-md my-4 text-center">
                    <p><strong>Lỗi:</strong> {error}</p>
                    <button onClick={fetchTours} className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Thử lại</button>
                </div>
            ) : null}

            {!isLoading && !error && !tours.length && searchTerm && (
                <div className="text-center py-8 text-theme-text-secondary">
                    Không tìm thấy tour nào khớp với "{searchTerm}".
                </div>
            )}
            {!isLoading && !error && !tours.length && !searchTerm && (
                <div className="text-center py-8 text-theme-text-secondary">
                    Chưa có sản phẩm tour nào.
                </div>
            )}

            {tours.length > 0 && (
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-theme-border'>
                        <thead className="bg-theme-background dark:bg-opacity-50">
                            <tr>
                                <th className='px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('id_san_pham_tour')}>
                                    ID {renderSortIcon('id_san_pham_tour')}
                                </th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>Ảnh</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('ten_tour')}>
                                    Tên Tour {renderSortIcon('ten_tour')}
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                                    Thời gian
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('ngay_tao')}>
                                    Ngày tạo {renderSortIcon('ngay_tao')}
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-theme-border'>
                            {tours.map((tour) => (
                                <motion.tr
                                    key={tour.id_san_pham_tour}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className='hover:bg-theme-background cursor-pointer' // Added cursor-pointer
                                    onClick={() => handleOpenDetailsModal(tour.id_san_pham_tour)} // Added onClick to the row
                                >
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-theme-text-secondary'>{tour.id_san_pham_tour}</td>
                                    <td className='px-4 py-3 whitespace-nowrap'>
                                        {tour.url_anh_bia ? (
                                            <img
                                                src={`${API_BASE_URL_FOR_IMAGES}${tour.url_anh_bia}`}
                                                alt={tour.ten_tour}
                                                className='h-10 w-16 object-cover rounded'
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div
                                            className={`h-10 w-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 ${tour.url_anh_bia ? 'hidden' : ''}`}
                                            style={{ display: tour.url_anh_bia ? 'none' : 'flex' }}
                                        >
                                            <ImageOff size={20} />
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>{tour.ten_tour}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{tour.thoi_gian_du_kien || 'N/A'}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{formatDate(tour.ngay_tao)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary flex items-center space-x-1'>
                                        <Link
                                            to={`/tours/${tour.id_san_pham_tour}/schedules`}
                                            onClick={(e) => {
                                                // Optional: Prevent navigation or show alert if no schedules
                                                // if (!(tour.schedule_count && tour.schedule_count > 0)) {
                                                //     e.preventDefault();
                                                //     alert("Tour này chưa có lịch trình nào.");
                                                // }
                                                e.stopPropagation();
                                            }}
                                            className={`p-1 inline-flex items-center justify-center rounded-md ${ // MODIFIED: Added inline-flex, items-center, justify-center. Removed mr-2
                                                tour.schedule_count && tour.schedule_count > 0
                                                    ? 'text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700'
                                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            title={tour.schedule_count && tour.schedule_count > 0 ? "Quản lý Lịch trình" : "Chưa có lịch trình"}
                                        >
                                            <CalendarCog size={18} />
                                        </Link>
                                        <button
                                            className='text-theme-primary hover:text-theme-primary-hover p-1 inline-flex items-center justify-center rounded-md' // MODIFIED: Added inline-flex, items-center, justify-center. Removed mr-2
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(tour);
                                            }}
                                            title="Sửa Tour"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className='text-red-500 hover:text-red-400 p-1 inline-flex items-center justify-center rounded-md' // MODIFIED: Added inline-flex, items-center, justify-center
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTour(tour.id_san_pham_tour, tour.ten_tour);
                                            }}
                                            title="Xóa Tour"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalItems > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
                    <div className="mb-2 sm:mb-0">
                        Hiển thị {tours.length} trên tổng số {totalItems} tours. (Trang {currentPage}/{totalPages})
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isLoading} className="p-2 rounded hover:bg-theme-background disabled:opacity-50" title="Trang đầu"><ChevronsLeft size={20} /></button>
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || isLoading} className="p-2 rounded hover:bg-theme-background disabled:opacity-50" title="Trang trước"><ChevronLeft size={20} /></button>
                        <span className="px-3 py-1.5 border border-theme-border rounded bg-theme-surface">{currentPage}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || isLoading} className="p-2 rounded hover:bg-theme-background disabled:opacity-50" title="Trang sau"><ChevronRight size={20} /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isLoading} className="p-2 rounded hover:bg-theme-background disabled:opacity-50" title="Trang cuối"><ChevronsRight size={20} /></button>
                    </div>
                </div>
            )}

            {isFormModalOpen && (
                <TourFormModal
                    tour={editingTour}
                    isOpen={isFormModalOpen}
                    onClose={onCloseFormModal}
                    onSubmit={handleFormSubmit}
                />
            )}

            {isDetailsModalOpen && viewingTour && (
                <TourDetailsModal
                    tour={viewingTour}
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    isLoading={isLoadingDetails}
                />
            )}
        </motion.div>
    );
};

export default ToursTable;