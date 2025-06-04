import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDownUp, UserCircle } from "lucide-react";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../../api/services/customerService"; // Updated import
import CustomerFormModal from "./CustomerFormModal";   // Updated import
import CustomerDetailsModal from "./CustomerDetailsModal"; // Updated import

const ITEMS_PER_PAGE = 10;

const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Customer Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // API interaction state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("ngay_tao"); // Default sort
  const [order, setOrder] = useState("DESC");

  const fetchCustomers = useCallback(async () => {
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
      const response = await getAllCustomers(params); // Use customer service

      setCustomers(response.customers || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.totalItems || 0);
        setCurrentPage(response.pagination.currentPage || 1);
      } else {
        // Fallback if pagination object is not present as expected
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
  }, [currentPage, searchTerm, sortBy, order]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && order === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setOrder(newOrder);
    setCurrentPage(1); // Reset to first page on new sort
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này? Thao tác này có thể không thành công nếu khách hàng có đơn đặt tour liên quan.")) {
      try {
        setIsLoading(true); // Indicate loading state for the table/actions
        const response = await deleteCustomer(customerId); // Use customer service
        alert(response.message || "Khách hàng đã được xóa thành công.");
        // Refresh data: if last item on a page, go to prev page
        if (customers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1); // This will trigger fetchCustomers
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

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const onCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCustomer(null);
    // setError(null); // Clear form-specific errors if any, or table errors if shared
  };

  const handleOpenDetailsModal = async (customerId) => {
    setIsLoadingDetails(true);
    setError(null);
    try {
      const response = await getCustomerById(customerId); // Use customer service
      if (response.success && response.data) {
        setViewingCustomer(response.data);
        setIsDetailsModalOpen(true);
      } else {
        throw new Error(response.message || "Không thể tải chi tiết khách hàng.");
      }
    } catch (err) {
      const errorMsg = err.message || (err.response?.data?.message) || "Lỗi khi tải chi tiết khách hàng.";
      setError(errorMsg);
      console.error("Error fetching customer details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const onCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingCustomer(null);
  };

  const handleFormSubmit = async (formDataFromModal) => {
    // setIsLoading(true); // Form modal has its own loading state
    // setError(null);
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
      // Error is handled and displayed within the CustomerFormModal
      // console.error("Lỗi khi lưu khách hàng:", err.response ? err.response.data : err.message);
      // setError(err.response?.data?.message || err.response?.data?.error || 'Lỗi không xác định khi lưu khách hàng.');
      throw err; // Re-throw to be caught by form modal's submit handler
    } finally {
      // setIsLoading(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy === field) {
      return order === "ASC" ? " ▲" : " ▼";
    }
    return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <motion.div
      className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách Khách hàng</h2>
        <div className='flex items-center space-x-0 sm:space-x-4 w-full sm:w-auto'>
          <div className='relative flex-grow sm:flex-grow-0'>
            <input
              type='text'
              placeholder='Tìm kiếm (tên, email, SĐT)...'
              className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary w-full'
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary' size={18} />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className='flex items-center bg-theme-primary hover:bg-theme-primary-hover text-white px-3 sm:px-4 py-2 rounded-lg transition duration-200 ml-2 sm:ml-0'
          >
            <UserPlus size={18} className='mr-0 sm:mr-2' />
            <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>

      {isLoading && !customers.length ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-theme-text-secondary">Đang tải dữ liệu khách hàng...</p>
        </div>
      ) : error && !customers.length ? ( // Show error prominently if no customers are loaded
        <div className="bg-red-100 dark:bg-red-900 bg-opacity-25 text-red-700 dark:text-red-300 p-4 rounded-md my-4 text-center">
          <p><strong>Lỗi:</strong> {error}</p>
          <button onClick={fetchCustomers} className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Thử lại</button>
        </div>
      ) : null}
      
      {/* Display table or no data message */}
      {!isLoading && !error && !customers.length && searchTerm && (
        <div className="text-center py-8 text-theme-text-secondary">
          Không tìm thấy khách hàng nào khớp với "{searchTerm}".
        </div>
      )}
      {!isLoading && !error && !customers.length && !searchTerm && (
        <div className="text-center py-8 text-theme-text-secondary">
          Chưa có khách hàng nào.
        </div>
      )}

      {customers.length > 0 && (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-theme-border'>
            <thead className="bg-theme-background dark:bg-opacity-50">
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('id_khach_hang')}>
                  ID {renderSortIcon('id_khach_hang')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('ho_ten')}>
                  Họ tên {renderSortIcon('ho_ten')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('email_lien_he')}>
                  Email {renderSortIcon('email_lien_he')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  SĐT
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
              {customers.map((customer) => (
                <motion.tr
                  key={customer.id_khach_hang}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className='hover:bg-theme-background cursor-pointer'
                  onClick={() => handleOpenDetailsModal(customer.id_khach_hang)}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary'>{customer.id_khach_hang}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>{customer.ho_ten}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{customer.email_lien_he}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{customer.so_dien_thoai}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{formatDate(customer.ngay_tao)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    <button
                      className='text-theme-primary hover:text-theme-primary-hover mr-2 p-1'
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(customer); }}
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className='text-red-500 hover:text-red-400 p-1'
                      onClick={(e) => { e.stopPropagation(); handleDelete(customer.id_khach_hang); }}
                      title="Xóa"
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

      {/* Pagination Controls */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-theme-text-secondary">
          <div className="mb-2 sm:mb-0">
            Hiển thị {customers.length} trên tổng số {totalItems} khách hàng. (Trang {currentPage}/{totalPages})
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
        <CustomerFormModal
          customer={editingCustomer}
          isOpen={isFormModalOpen}
          onClose={onCloseFormModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {isDetailsModalOpen && viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          isOpen={isDetailsModalOpen}
          onClose={onCloseDetailsModal}
        />
      )}
    </motion.div>
  );
};

export default CustomersTable;