import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Eye, ArrowDownUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { getAllCustomers, deleteCustomer, getCustomerById, updateCustomer, createCustomer } from '../../api/services/customerService';
import CustomerFormModal from './CustomerFormModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import { formatDate } from '../../utils/formatter';

const ITEMS_PER_PAGE = 10;

const CustomersTable = () => {
  // State variables
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('kh.ngay_tao');
  const [order, setOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Debounce search term to avoid unnecessary API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (debouncedSearchTerm !== searchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch customers with parameters
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchTerm: debouncedSearchTerm,
        sortBy,
        order
      };

      const response = await getAllCustomers(params);

      setCustomers(response.customers || []);

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.totalItems || 0);
        setCurrentPage(response.pagination.currentPage || 1);
      } else {
        // Fallback if pagination object is not present
        setTotalPages(Math.ceil((response.customers?.length || 0) / ITEMS_PER_PAGE) || 1);
        setTotalItems(response.customers?.length || 0);
      }
    } catch (err) {
      const errorMessage = err.message || (err.response?.data?.message) || "Không thể tải dữ liệu khách hàng.";
      setError(errorMessage);
      console.error("Customer loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, sortBy, order]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (e) => {
    // Chỉ cập nhật searchTerm, không reset trang ngay lập tức để tránh mất focus
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    // Kích hoạt tìm kiếm ngay lập tức
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && order === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setOrder(newOrder);
    setCurrentPage(1); // Reset to first page on new sort
  };

  const handleDelete = async (customerId, e) => {
    if (e) e.stopPropagation(); // Prevent opening details modal
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này? Thao tác này có thể không thành công nếu khách hàng có đơn đặt tour liên quan.")) {
      try {
        setIsLoading(true);
        const response = await deleteCustomer(customerId);
        alert(response.message || "Khách hàng đã được xóa thành công.");

        // Refresh data: if last item on a page, go to prev page
        if (customers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchCustomers(); // Otherwise, just refetch current page
        }
      } catch (err) {
        const errorMsg = err.message || (err.response?.data?.message) || "Lỗi không xác định khi xóa khách hàng.";
        setError("Lỗi khi xóa khách hàng: " + errorMsg);
        alert("Lỗi khi xóa khách hàng: " + errorMsg);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (customer, e) => {
    if (e) e.stopPropagation(); // Prevent opening details modal
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const onCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCustomer(null);
  };

  const handleOpenDetailsModal = async (customerId) => {
    setIsLoadingDetails(true);
    try {
      const response = await getCustomerById(customerId);
      if (response.success && response.data) {
        setViewingCustomer(response.data);
        setIsDetailsModalOpen(true);
      } else {
        throw new Error(response.message || "Không thể tải chi tiết khách hàng.");
      }
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết khách hàng.");
      console.error("Fetch customer details error:", err);
      alert(err.message || "Không thể tải chi tiết khách hàng.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const onCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingCustomer(null);
  };

  const handleFormSubmit = async (formDataFromModal) => {
    try {
      if (editingCustomer && editingCustomer.id_khach_hang) {
        const response = await updateCustomer(editingCustomer.id_khach_hang, formDataFromModal);
        alert(response.message || "Khách hàng đã được cập nhật thành công.");
      } else {
        const response = await createCustomer(formDataFromModal);
        alert(response.message || "Khách hàng đã được tạo thành công.");
      }
      fetchCustomers(); // Refresh the table
      onCloseFormModal(); // Close modal on success
    } catch (err) {
      throw err; // Re-throw to be caught by form modal's submit handler
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy === field) {
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
        <h2 className="text-xl font-semibold text-theme-text-primary">Danh sách Khách hàng</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
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
            className="flex items-center gap-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-2 px-4 rounded-lg whitespace-nowrap justify-center"
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Thêm khách hàng</span>
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
      ) : customers.length === 0 ? (
        <div className="text-center py-10 text-theme-text-secondary">
          {debouncedSearchTerm ? "Không tìm thấy khách hàng nào phù hợp với tìm kiếm của bạn." : "Chưa có khách hàng nào."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-background">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kh.id_khach_hang')}
                >
                  ID {renderSortIcon('kh.id_khach_hang')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kh.ho_ten')}
                >
                  Họ tên {renderSortIcon('kh.ho_ten')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kh.email_lien_he')}
                >
                  Email {renderSortIcon('kh.email_lien_he')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kh.so_dien_thoai')}
                >
                  Số điện thoại {renderSortIcon('kh.so_dien_thoai')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('kh.ngay_tao')}
                >
                  Ngày tạo {renderSortIcon('kh.ngay_tao')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {customers.map((customer) => (
                <motion.tr
                  key={customer.id_khach_hang}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-theme-background/50 cursor-pointer"
                  onClick={() => handleOpenDetailsModal(customer.id_khach_hang)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{customer.id_khach_hang}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.ho_ten}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email_lien_he}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.so_dien_thoai}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(customer.ngay_tao, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(customer, e); }}
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-400 p-1"
                        onClick={(e) => { e.stopPropagation(); handleDelete(customer.id_khach_hang, e); }}
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
            Hiển thị {customers.length} trên tổng số {totalItems} khách hàng. (Trang {currentPage}/{totalPages})
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
        <CustomerFormModal
          customer={editingCustomer}
          onClose={onCloseFormModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          onClose={onCloseDetailsModal}
        />
      )}
    </motion.div>
  );
};

export default CustomersTable;