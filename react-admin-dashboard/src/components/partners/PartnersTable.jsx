import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowDownUp, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { getAllPartners, deletePartner, getPartnerById, updatePartner, createPartner } from '../../api/services/partnerService';
import { formatDate } from '../../utils/formatter';
import PartnerFormModal from './PartnerFormModal';
import PartnerDetailsModal from './PartnerDetailsModal';

const ITEMS_PER_PAGE = 10; // Sử dụng 10 mục mỗi trang

const PartnersTable = () => {
    // State variables
    const [partners, setPartners] = useState([]);
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
    const [editingPartner, setEditingPartner] = useState(null);
    const [viewingPartner, setViewingPartner] = useState(null);

    // Thêm useRef cho input tìm kiếm
    const searchInputRef = useRef(null);

    // Fetch partners with parameters
    const fetchPartners = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: searchTerm,
                sortBy,
                order
            };

            const response = await getAllPartners(params);

            // Sửa dòng này - truy cập đúng cấu trúc dữ liệu
            setPartners(response.data?.partners || []);

            if (response.pagination) {
                setTotalPages(response.pagination.totalPages || 1);
                setTotalItems(response.pagination.totalItems || 0);
                setCurrentPage(response.pagination.currentPage || 1);
            } else {
                // Fallback if pagination object is not present
                setTotalPages(Math.ceil((response.data?.partners?.length || 0) / ITEMS_PER_PAGE) || 1);
                setTotalItems(response.data?.partners?.length || 0);
            }
        } catch (err) {
            const errorMessage = err.message || (err.response?.data?.message) || "Không thể tải dữ liệu đối tác.";
            setError(errorMessage);
            console.error("Partners loading error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, sortBy, order]);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    // Tối ưu hàm handleSearchChange
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Đảm bảo không gọi API quá nhiều
        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(() => {
            // Chỉ gọi API và set loading khi cần thiết
            setIsLoading(true);
            setCurrentPage(1);

            const params = {
                page: 1,
                limit: ITEMS_PER_PAGE,
                search: value,
                sortBy,
                order
            };

            getAllPartners(params).then(response => {
                // Cập nhật nhiều state trong một lần để giảm re-render
                setPartners(response.data?.partners || []);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalItems(response.pagination?.totalItems || 0);
                setIsLoading(false);
            }).catch(err => {
                const errorMessage = err.message || "Không thể tải dữ liệu đối tác.";
                setError(errorMessage);
                console.error("Partner loading error:", err);
                setIsLoading(false);
            });
        }, 300); // Đợi 300ms để tránh gọi API quá nhiều

        setTimeoutId(newTimeoutId);
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === "ASC" ? "DESC" : "ASC";
        setSortBy(field);
        setOrder(newOrder);
        setCurrentPage(1); // Reset to first page on new sort
    };

    const handleDelete = async (partnerId, e) => {
        if (e) e.stopPropagation(); // Prevent opening details modal
        if (window.confirm("Bạn có chắc chắn muốn xóa đối tác này? Thao tác này có thể không thành công nếu đối tác đang được sử dụng trong các dịch vụ.")) {
            try {
                setIsLoading(true);
                const response = await deletePartner(partnerId);
                alert(response.message || "Đối tác đã được xóa thành công.");

                // Refresh data: if last item on a page, go to prev page
                if (partners.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchPartners(); // Otherwise, just refetch current page
                }
            } catch (err) {
                const errorMsg = err.message || (err.response?.data?.message) || "Lỗi không xác định khi xóa đối tác.";
                setError("Lỗi khi xóa đối tác: " + errorMsg);
                alert("Lỗi khi xóa đối tác: " + errorMsg);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOpenCreateModal = () => {
        setEditingPartner(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (partner, e) => {
        if (e) e.stopPropagation(); // Prevent opening details modal
        setEditingPartner(partner);
        setIsFormModalOpen(true);
    };

    const onCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingPartner(null);
    };

    const handleOpenDetailsModal = async (partnerId) => {
        setIsLoadingDetails(true);
        try {
            const response = await getPartnerById(partnerId);
            if (response.success && response.data) {
                setViewingPartner(response.data);
                setIsDetailsModalOpen(true);
            } else {
                throw new Error(response.message || "Không thể tải chi tiết đối tác.");
            }
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết đối tác.");
            console.error("Fetch partner details error:", err);
            alert(err.message || "Không thể tải chi tiết đối tác.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const onCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingPartner(null);
    };

    const handleFormSubmit = async (formDataFromModal) => {
        try {
            if (editingPartner && editingPartner.id_doi_tac) {
                const response = await updatePartner(editingPartner.id_doi_tac, formDataFromModal);
                alert(response.message || "Đối tác đã được cập nhật thành công.");
            } else {
                const response = await createPartner(formDataFromModal);
                alert(response.message || "Đối tác đã được tạo thành công.");
            }
            fetchPartners(); // Refresh the table
            onCloseFormModal(); // Close modal on success
        } catch (err) {
            throw err; // Re-throw to be caught by form modal's submit handler
        }
    };

    const renderSortIcon = (field) => {
        const cleanField = field.replace('dt.', '');
        if (sortBy === cleanField) {
            return order === "ASC" ? " ▲" : " ▼";
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    return (
        <motion.div
            className="bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách Đối tác</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm đối tác..."
                            className="bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            disabled={isLoading}
                            key="partner-search"  // Thêm key cố định
                            ref={(input) => input && document.activeElement === document.body && input.focus()}  // Auto focus nếu chưa có focus khác
                        />
                        <Search
                            className="absolute top-2.5 right-3 text-theme-text-secondary"
                            size={18}
                        />
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-2 px-4 rounded-lg whitespace-nowrap justify-center"
                        disabled={isLoading}
                    >
                        <span className="hidden sm:inline">Thêm đối tác</span>
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
            ) : partners.length === 0 ? (
                <div className="text-center py-10 text-theme-text-secondary">
                    {searchTerm ? "Không tìm thấy đối tác nào phù hợp với tìm kiếm của bạn." : "Chưa có đối tác nào."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-background">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('id_doi_tac')}
                                >
                                    ID {renderSortIcon('id_doi_tac')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ten_doi_tac')}
                                >
                                    Tên đối tác {renderSortIcon('ten_doi_tac')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    Email {renderSortIcon('email')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                                    Số điện thoại {/* Đã loại bỏ tính năng sắp xếp */}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('ngay_tao')}
                                >
                                    Ngày tạo {renderSortIcon('ngay_tao')}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {partners.map((partner) => (
                                <motion.tr
                                    key={partner.id_doi_tac}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-theme-background/50 cursor-pointer"
                                    onClick={() => handleOpenDetailsModal(partner.id_doi_tac)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{partner.id_doi_tac}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{partner.ten_doi_tac}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{partner.email || "—"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{partner.so_dien_thoai || "—"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(partner.ngay_tao, {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(partner, e); }}
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400 p-1"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(partner.id_doi_tac, e); }}
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
                        Hiển thị {partners.length} trên tổng số {totalItems} đối tác. (Trang {currentPage}/{totalPages})
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
                <PartnerFormModal
                    partner={editingPartner}
                    onClose={onCloseFormModal}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* Details Modal */}
            {isDetailsModalOpen && viewingPartner && (
                <PartnerDetailsModal
                    partner={viewingPartner}
                    onClose={onCloseDetailsModal}
                    onEdit={(partner) => {
                        onCloseDetailsModal();
                        handleOpenEditModal(partner);
                    }}
                />
            )}
        </motion.div>
    );
};

export default PartnersTable;