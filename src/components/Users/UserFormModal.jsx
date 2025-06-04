import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const UserFormModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        password: '', // Always empty for editing
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: '',
        status: '',
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-theme-surface0 rounded-lg p-6 w-full max-w-lg relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isLoading}
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary mb-6">
          {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
            <p><strong>Lỗi:</strong> {error}</p>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                required
                disabled={isLoading}
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                required
                disabled={isLoading}
                placeholder="Nhập địa chỉ email"
              />
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  required
                  disabled={isLoading}
                  placeholder="Nhập mật khẩu"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                required
                disabled={isLoading}
              >
                <option value="">Chọn vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="user">Người dùng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                required
                disabled={isLoading}
              >
                <option value="">Chọn trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-theme-text-secondary bg-gray-100 dark:bg-theme-surface hover:bg-gray-200 dark:hover:bg-theme-background rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-theme-surface0"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
              >
                {isLoading ? (user ? 'Đang cập nhật...' : 'Đang tạo...') : (user ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;