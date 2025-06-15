import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, UserPlus, ArrowDownUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, getUserById } from '../../api/services/userService';
import UserFormModal from './UserFormModal';
import UserDetailsModal from './UserDetailsModal';
import axios from 'axios';

const ITEMS_PER_PAGE = 10;

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ngay_tao');
  const [order, setOrder] = useState('DESC');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        sortBy: sortBy,
        order: order
      });

      setUsers(response.users || []);

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.totalItems || 0);
        setCurrentPage(response.pagination.currentPage || 1);
      } else {
        setTotalPages(Math.ceil((response.users?.length || 0) / ITEMS_PER_PAGE) || 1);
        setTotalItems(response.users?.length || 0);
      }
    } catch (err) {
      const errorMessage = err.message || (err.response?.data?.message) || "Không thể tải dữ liệu người dùng.";
      setError(errorMessage);
      console.error("User loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, order]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && order === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setOrder(newOrder);
    setCurrentPage(1);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        setIsLoading(true);
        const response = await deleteUser(userId);
        if (response.success) {
          alert(response.message || "Người dùng đã được xóa thành công.");
          if (users.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchUsers();
          }
        } else {
          throw new Error(response.message || "Không thể xóa người dùng.");
        }
      } catch (err) {
        setError("Lỗi khi xóa người dùng: " + (err.message || "Lỗi không xác định"));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const onCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const handleOpenDetailsModal = async (userId) => {
    setIsLoadingDetails(true);
    setError(null);
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setViewingUser(response.data);
        setIsDetailsModalOpen(true);
      } else {
        throw new Error(response.message || "Không thể tải chi tiết người dùng.");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.message || "Lỗi khi tải chi tiết người dùng.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const onCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingUser(null);
  };

  const handleFormSubmit = async (formDataFromModal) => {
    setIsLoading(true);
    try {
      // Xử lý formData đúng cách
      let response;
      const userId = formDataFromModal.get('id_nguoi_dung'); // Nếu có

      if (editingUser) {
        // Update user
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/nguoidung/${editingUser.id_nguoi_dung}`,
          formDataFromModal,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              // KHÔNG set 'Content-Type': 'application/json' vì đây là FormData
            }
          }
        );
      } else {
        // Create user
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/nguoidung`,
          formDataFromModal,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              // KHÔNG set 'Content-Type': 'application/json' vì đây là FormData
            }
          }
        );
      }

      if (response.data.success) {
        alert(response.data.message || "Người dùng đã được lưu thành công.");
        fetchUsers();
        onCloseFormModal();
      } else {
        throw new Error(response.data.message || "Lỗi không xác định khi lưu người dùng.");
      }
    } catch (err) {
      console.error("Lỗi khi lưu user:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || err.response?.data?.error || 'Lỗi không xác định khi lưu người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy === field) {
      return order === "ASC" ? " ▲" : " ▼";
    }
    return "";
  };

  const getStatusBadge = (status) => {
    // Chuyển đổi status sang dạng số để so sánh chính xác
    const statusNum = parseInt(status);

    if (statusNum === 1) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
    } else if (statusNum === 0) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ngưng hoạt động</span>;
    } else if (statusNum === 2) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Đã xóa</span>;
    } else {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Không rõ ({status})</span>;
    }
  };


  return (
    <motion.div
      className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative z-20'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách Người dùng</h2>

        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <div className='relative w-full sm:w-64'>
            <input
              type='text'
              placeholder='Tìm kiếm...'
              className='bg-theme-background border border-theme-border px-4 py-2 pr-10 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary'
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className='absolute top-2.5 right-3 text-theme-text-secondary' size={18} />
          </div>

          <button
            className='bg-theme-primary text-white px-4 py-2 rounded-md flex items-center justify-center'
            onClick={handleOpenCreateModal}
          >
            <UserPlus size={18} className='mr-0 sm:mr-2' />
            <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>

      {isLoading && !users.length ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-theme-text-secondary">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-25 text-red-300 p-4 rounded-md my-4">
          {error}
          <button onClick={fetchUsers} className="ml-4 px-2 py-1 bg-red-700 text-white rounded">Thử lại</button>
        </div>
      ) : null}

      {!isLoading && !error && !users.length && searchTerm && (
        <div className="text-center py-8 text-theme-text-secondary">
          Không tìm thấy người dùng nào phù hợp với từ khóa "{searchTerm}"
        </div>
      )}

      {!isLoading && !error && !users.length && !searchTerm && (
        <div className="text-center py-8 text-theme-text-secondary">
          Chưa có người dùng nào. Tạo mới ngay!
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className='overflow-auto rounded-lg border border-theme-border'>
          <table className='min-w-full bg-theme-surface divide-y divide-theme-border'>
            <thead className='bg-theme-background'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('id_nguoi_dung')}>
                  ID {renderSortIcon('id_nguoi_dung')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('ten_dang_nhap')}>
                  Tên đăng nhập {renderSortIcon('ten_dang_nhap')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('email_dang_nhap')}>
                  Email {renderSortIcon('email_dang_nhap')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('vai_tro')}>
                  Vai trò {renderSortIcon('vai_tro')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('ngay_tao')}>
                  Ngày tạo {renderSortIcon('ngay_tao')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  Trạng thái
                </th>
                {/* Header của cột Hành động */}
                <th className='px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider whitespace-nowrap w-28'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-theme-border'>
              {users.map((user) => (
                <motion.tr
                  key={user.id_nguoi_dung}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className='hover:bg-theme-background cursor-pointer' // Add cursor-pointer
                  onClick={() => handleOpenDetailsModal(user.id_nguoi_dung)} // Add onClick handler here
                >
                  <td className='px-6 py-4 whitespace-nowrap'>{user.id_nguoi_dung}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-8 w-8'>
                        {user.url_anh_dai_dien ? (
                          <img
                            className='h-8 w-8 rounded-full object-cover'
                            src={user.url_anh_dai_dien.startsWith('http')
                              ? user.url_anh_dai_dien
                              : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${user.url_anh_dai_dien.replace(/\\/g, '/')}`}
                            alt=''
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className='h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300'>
                            {user.ten_dang_nhap?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-theme-text-primary'>{user.ten_dang_nhap}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{user.email_dang_nhap}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm capitalize'>{user.vai_tro}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {new Date(user.ngay_tao).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getStatusBadge(user.dang_hoat_dong)}
                  </td>
                  {/* Nội dung cột Hành động */}
                  <td className='px-6 py-4 whitespace-nowrap text-center w-28'>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        className='text-blue-500 hover:text-blue-700 p-1'
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(user); }}
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className='text-red-500 hover:text-red-400 p-1'
                        onClick={(e) => { e.stopPropagation(); handleDelete(user.id_nguoi_dung); }}
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
            Hiển thị {users.length} trên tổng số {totalItems} người dùng. (Trang {currentPage}/{totalPages})
          </div>
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
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <UserFormModal
          user={editingUser}
          isOpen={isFormModalOpen}
          onClose={onCloseFormModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          isOpen={isDetailsModalOpen}
          onClose={onCloseDetailsModal}
        />
      )}
    </motion.div>
  );
};

export default UsersTable;