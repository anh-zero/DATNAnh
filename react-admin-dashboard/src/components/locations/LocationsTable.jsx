import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Map, Plus, ArrowDownUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

import { getAllLocations, deleteLocation, getLocationById, updateLocation, createLocation } from '../../api/services/locationService';
import LocationFormModal from './LocationFormModal';
import LocationDetailsModal from './LocationDetailsModal';
import { formatDate } from '../../utils/formatter';

const ITEMS_PER_PAGE = 10; // Sử dụng 10 mục mỗi trang

const LocationsTable = () => {
    // State variables
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Sorting
    const [sortBy, setSortBy] = useState('ten_dia_diem');
    const [order, setOrder] = useState('ASC');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [viewingLocation, setViewingLocation] = useState(null);

    // Debounce search term to avoid unnecessary API calls
    useEffect(() => {
        const timerId = setTimeout(() => {
            if (debouncedSearchTerm !== searchTerm) {
                setDebouncedSearchTerm(searchTerm);
                setCurrentPage(1); // Reset page only when search term is actually applied
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Fetch locations with parameters
    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearchTerm,
                sortBy,
                order
            };

            const response = await getAllLocations(params);

            if (response) {
                setLocations(response.locations || []);

                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalItems(response.pagination.totalItems || 0);
                    setCurrentPage(response.pagination.currentPage || 1);
                } else {
                    // Fallback if pagination object is not present
                    const totalItems = response.locations?.length || 0;
                    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
                    setTotalPages(totalPages);
                    setTotalItems(totalItems);
                }
            }
        } catch (err) {
            const errorMessage = err.message || (err.response?.data?.message) || "Không thể tải dữ liệu địa điểm.";
            setError(errorMessage);
            console.error("Location loading error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, sortBy, order]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleSearchChange = (e) => {
        // Chỉ cập nhật searchTerm mà không làm mới trang
        setSearchTerm(e.target.value);
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        // Kích hoạt áp dụng ngay lập tức giá trị tìm kiếm hiện tại
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === "ASC" ? "DESC" : "ASC";
        setSortBy(field);
        setOrder(newOrder);
        setCurrentPage(1); // Reset to first page on new sort
    };

    const handleDelete = async (locationId, e) => {
        if (e) e.stopPropagation(); // Prevent opening details modal

        if (window.confirm("Bạn có chắc chắn muốn xóa địa điểm này? Thao tác này không thể hoàn tác và có thể thất bại nếu địa điểm đang được sử dụng trong hệ thống.")) {
            try {
                setIsLoading(true);
                const response = await deleteLocation(locationId);
                alert(response.message || "Địa điểm đã được xóa thành công.");

                // Refresh data: if last item on a page, go to prev page
                if (locations.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchLocations(); // Otherwise, just refetch current page
                }
            } catch (err) {
                const errorMsg = err.message || (err.response?.data?.message) || "Lỗi không xác định khi xóa địa điểm.";
                setError("Lỗi khi xóa địa điểm: " + errorMsg);
                alert("Lỗi khi xóa địa điểm: " + errorMsg);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOpenCreateModal = () => {
        setEditingLocation(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (location, e) => {
        if (e) e.stopPropagation(); // Prevent opening details modal
        setEditingLocation(location);
        setIsFormModalOpen(true);
    };

    const onCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingLocation(null);
    };

    const handleOpenDetailsModal = async (locationId) => {
        setIsLoadingDetails(true);
        try {
            const response = await getLocationById(locationId);
            if (response.success && response.data) {
                setViewingLocation(response.data);
                setIsDetailsModalOpen(true);
            } else {
                throw new Error(response.message || "Không thể tải chi tiết địa điểm.");
            }
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết địa điểm.");
            console.error("Fetch location details error:", err);
            alert(err.message || "Không thể tải chi tiết địa điểm.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const onCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingLocation(null);
    };

    const handleFormSubmit = async (formDataFromModal) => {
        try {
            setIsLoading(true);

            if (editingLocation && editingLocation.id_dia_diem) {
                const response = await updateLocation(editingLocation.id_dia_diem, formDataFromModal);
                alert(response.message || "Địa điểm đã được cập nhật thành công.");
            } else {
                const response = await createLocation(formDataFromModal);
                alert(response.message || "Địa điểm mới đã được tạo thành công.");
            }

            fetchLocations();
            onCloseFormModal();

        } catch (err) {
            console.error("Error saving location:", err);
            const errorMsg = err.message || (err.response?.data?.message) || "Lỗi không xác định khi lưu địa điểm.";
            setError(errorMsg);
            alert("Lỗi khi lưu địa điểm: " + errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return order === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    const getLocationTypeBadge = (type) => {
        switch (type) {
            case 'Điểm tham quan':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Điểm tham quan</span>;
            case 'Thành phố':
                return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Thành phố</span>;
            case 'Khách sạn':
                return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Khách sạn</span>;
            case 'Nhà hàng':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Nhà hàng</span>;
            case 'Sân bay':
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Sân bay</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Khác</span>;
        }
    };

    return (
        <motion.div
            className="bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách Địa điểm</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm địa điểm..."
                            className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="absolute top-2.5 right-3 text-theme-text-secondary"
                        >
                            <Search size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center justify-center gap-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-2 px-4 rounded-lg whitespace-nowrap"
                        disabled={isLoading}
                    >
                        <span className="hidden sm:inline">Thêm địa điểm</span>
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
            ) : locations.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {debouncedSearchTerm ? "Không tìm thấy địa điểm nào phù hợp với tìm kiếm của bạn." : "Chưa có địa điểm nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("id_dia_diem")}
                                >
                                    ID {sortBy === "id_dia_diem" && renderSortIcon("id_dia_diem")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("ten_dia_diem")}
                                >
                                    Tên địa điểm {sortBy === "ten_dia_diem" && renderSortIcon("ten_dia_diem")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("loai_dia_diem")}
                                >
                                    Loại {sortBy === "loai_dia_diem" && renderSortIcon("loai_dia_diem")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("thanh_pho")}
                                >
                                    Thành phố {sortBy === "thanh_pho" && renderSortIcon("thanh_pho")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("quoc_gia")}
                                >
                                    Quốc gia {sortBy === "quoc_gia" && renderSortIcon("quoc_gia")}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {locations.map((location) => (
                                <motion.tr
                                    key={location.id_dia_diem}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    onClick={() => handleOpenDetailsModal(location.id_dia_diem)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{location.id_dia_diem}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{location.ten_dia_diem}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getLocationTypeBadge(location.loai_dia_diem)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{location.thanh_pho || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{location.quoc_gia || 'Việt Nam'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                onClick={(e) => handleOpenEditModal(location, e)}
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => handleDelete(location.id_dia_diem, e)}
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

            {/* Pagination Controls - Changed to show pagination when there are items */}
            {totalItems > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
                    <div className="mb-2 sm:mb-0">
                        Hiển thị {locations.length} trên tổng số {totalItems} địa điểm. (Trang {currentPage}/{totalPages})
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

            {/* Form Modal */}
            {isFormModalOpen && (
                <LocationFormModal
                    location={editingLocation}
                    onClose={onCloseFormModal}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* Details Modal */}
            {isDetailsModalOpen && viewingLocation && (
                <LocationDetailsModal
                    location={viewingLocation}
                    onClose={onCloseDetailsModal}
                    onEdit={() => {
                        onCloseDetailsModal();
                        handleOpenEditModal(viewingLocation);
                    }}
                />
            )}
        </motion.div>
    );
};

export default LocationsTable;