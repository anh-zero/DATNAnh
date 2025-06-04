import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDownUp, Eye } from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../../api/services/userService";
import UserFormModal from "./UserFormModal";
import UserDetailsModal from "./UserDetailsModal";

const ITEMS_PER_PAGE = 10;

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // User Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // API interaction state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("ngay_tao");
  const [order, setOrder] = useState("DESC");

  const fetchUsers = useCallback(async () => {
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
      const response = await getAllUsers(params);

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
    setError(null);

    const data = new FormData();
    data.append('ten_dang_nhap', formDataFromModal.ten_dang_nhap);
    data.append('email_dang_nhap', formDataFromModal.email_dang_nhap);
    data.append('vai_tro', formDataFromModal.vai_tro);

    if (formDataFromModal.mat_khau) {
      data.append('mat_khau', formDataFromModal.mat_khau);
      if (formDataFromModal.confirm_mat_khau) {
        data.append('confirm_mat_khau', formDataFromModal.confirm_mat_khau);
      }
    }

    if (formDataFromModal.avatarFile) {
      data.append('url_anh_dai_dien', formDataFromModal.avatarFile);
    }

    if (editingUser && editingUser.id_nguoi_dung && formDataFromModal.dang_hoat_dong !== undefined) {
      data.append('dang_hoat_dong', formDataFromModal.dang_hoat_dong);
    }

    try {
      if (editingUser && editingUser.id_nguoi_dung) {
        await updateUser(editingUser.id_nguoi_dung, data);
        alert("Người dùng đã được cập nhật thành công.");
      } else {
        await createUser(data);
        alert("Người dùng đã được tạo thành công.");
      }
      fetchUsers();
      onCloseFormModal();
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
    return <ArrowDownUp size={14} className="inline ml-1 opacity-50" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatUserStatus = (status) => {
    switch (status) {
      case 1: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green text-white dark:bg-green-800 dark:text-green-100">Hoạt động</span>;
      case 0: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Bị khóa</span>;
      case 2: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Đã xóa</span>;
      default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Không rõ</span>;
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
        <div className='flex items-center space-x-0 sm:space-x-4 w-full sm:w-auto'>
          <div className='relative flex-grow sm:flex-grow-0'>
            <input
              type='text'
              placeholder='Tìm kiếm (tên, email)...'
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
          Không tìm thấy người dùng nào khớp với "{searchTerm}".
        </div>
      )}
      {!isLoading && !error && !users.length && !searchTerm && (
        <div className="text-center py-8 text-theme-text-secondary">
          Chưa có người dùng nào.
        </div>
      )}


      {users.length > 0 && (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-theme-border'>
            <thead>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer' onClick={() => handleSort('id_nguoi_dung')}>
                  ID {renderSortIcon('id_nguoi_dung')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  Ảnh đại diện
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
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
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
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary'>{user.id_nguoi_dung}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {user.url_anh_dai_dien ? (
                      <>
                        <img
                          src={
                            user.url_anh_dai_dien.startsWith('http')
                              ? user.url_anh_dai_dien
                              : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}${user.url_anh_dai_dien.startsWith('/') ? user.url_anh_dai_dien : '/' + user.url_anh_dai_dien}`
                          }
                          alt={user.ten_dang_nhap || 'Avatar'}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = 'inline-flex';
                            }
                          }}
                        />
                        <div
                          className="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-xs"
                          style={{ display: 'none' }}
                        >
                          N/A
                        </div>
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-500 text-xs">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>
                    {user.ten_dang_nhap}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {user.email_dang_nhap}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {user.vai_tro}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {formatDate(user.ngay_tao)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {formatUserStatus(user.dang_hoat_dong)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {/* Remove the Eye icon button or keep it as an alternative */}
                    {/* <button
                      className='text-blue-500 hover:text-blue-400 mr-2 p-1'
                      onClick={(e) => { e.stopPropagation(); handleOpenDetailsModal(user.id_nguoi_dung); }} // Add stopPropagation if keeping
                      title="Xem chi tiết"
                      disabled={isLoadingDetails && viewingUser?.id_nguoi_dung === user.id_nguoi_dung}
                    >
                      <Eye size={18} />
                    </button> */}
                    <button
                      className='text-theme-primary hover:text-theme-primary-hover mr-2 p-1'
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(user); }} // Add stopPropagation
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className='text-red-500 hover:text-red-400 p-1'
                      onClick={(e) => { e.stopPropagation(); handleDelete(user.id_nguoi_dung); }} // Add stopPropagation
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