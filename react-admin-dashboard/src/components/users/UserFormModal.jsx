import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const UserFormModal = ({ user, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    // role: 'user' // Removed role from initial state
  });
  const [isLoading, setIsLoading] = useState(false);

  // Nếu là chỉnh sửa, điền dữ liệu user vào form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Để trống khi edit
        // role: user.role || 'user' // Removed role from edit state
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        username: '',
        email: '',
        password: '',
        // role: 'user' // Removed role from new state
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Ensure you handle the formData without 'role' in your onSubmit function in UsersTable.jsx
      // If your backend expects a role, you might need to add a default one here or in the backend
      const dataToSubmit = { ...formData };
      if (!user) { // If creating a new user, and backend requires a role
        // dataToSubmit.role = 'user'; // Or whatever default role you want
      }
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Đã có z-index: z-50, thử tăng lên nếu vẫn bị che */}
      {/* Ví dụ: <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"> */}
      <motion.div
        className="bg-theme-surface0 rounded-lg p-6 w-full max-w-md relative border border-theme-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-text-secondary hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              value={formData.username}
              onChange={handleChange}
              // disabled={user !== null} // Xóa hoặc comment dòng này
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6"> {/* Changed mb-4 to mb-6 for consistent spacing after removing role field */}
            <label className="block text-theme-text-secondary mb-2" htmlFor="password">
              Password {user && <span className="text-sm text-theme-text-secondary">(Để trống nếu không thay đổi)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              value={formData.password}
              onChange={handleChange}
              required={!user} // Bắt buộc khi tạo mới, không bắt buộc khi edit
            />
          </div>

          {/* Removed Role Field
          <div className="mb-6">
            <label className="block text-theme-text-secondary mb-2" htmlFor="role">
              Quyền
            </label>
            <select
              id="role"
              name="role"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          */}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-theme-primary text-white rounded hover:bg-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : user ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserFormModal;