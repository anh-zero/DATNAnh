import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';

const UserFormModal = ({ user, isOpen, onClose, onSubmit }) => {
  const initialFormData = {
    ten_dang_nhap: '',
    email_dang_nhap: '',
    mat_khau: '',
    confirm_mat_khau: '',
    vai_tro: 'user',
    dang_hoat_dong: 1, // Default to active for new users, will be overwritten in edit
    avatarFile: null,
    currentAvatarUrl: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (user && user.id_nguoi_dung) { // Editing existing user
        setFormData({
          ten_dang_nhap: user.ten_dang_nhap || '',
          email_dang_nhap: user.email_dang_nhap || '',
          mat_khau: '',
          confirm_mat_khau: '',
          vai_tro: user.vai_tro || 'user',
          dang_hoat_dong: user.dang_hoat_dong !== undefined ? user.dang_hoat_dong : 1, // Set existing status or default to active
          avatarFile: null,
          currentAvatarUrl: user.url_anh_dai_dien
        });
        if (user.url_anh_dai_dien) {
          // Construct full URL for preview if it's a relative path
          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
          const avatarPath = user.url_anh_dai_dien.startsWith('/') ? user.url_anh_dai_dien : `/${user.url_anh_dai_dien}`;
          setPreviewImage(user.url_anh_dai_dien.startsWith('http') ? user.url_anh_dai_dien : `${baseUrl}${avatarPath}`);
        } else {
          setPreviewImage(null);
        }
      } else { // Creating new user
        setFormData({
          ...initialFormData, // Reset to initial including default dang_hoat_dong
          mat_khau: '', // ensure password fields are clear
          confirm_mat_khau: '',
        });
        setPreviewImage(null);
      }
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatarFile: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, revert to current avatar if editing, or null if creating
      setFormData(prev => ({ ...prev, avatarFile: null }));
      if (formData.currentAvatarUrl) {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
        const avatarPath = formData.currentAvatarUrl.startsWith('/') ? formData.currentAvatarUrl : `/${formData.currentAvatarUrl}`;
        setPreviewImage(formData.currentAvatarUrl.startsWith('http') ? formData.currentAvatarUrl : `${baseUrl}${avatarPath}`);
      } else {
        setPreviewImage(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mat_khau !== formData.confirm_mat_khau && (formData.mat_khau || formData.confirm_mat_khau)) {
      // Basic client-side check, server-side is the source of truth
      alert("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
    setIsLoading(true);
    // The onSubmit prop is `handleFormSubmit` from UsersTable.jsx
    // It expects an object with keys: ten_dang_nhap, email_dang_nhap, mat_khau, confirm_mat_khau, vai_tro, avatarFile
    try {
      await onSubmit(formData); // Pass the internal formData state
      // UsersTable's handleFormSubmit will construct FormData for the API call
      // No need to create FormData here as UsersTable already does it.
      // onClose(); // UsersTable will call onClose on success
    } catch (error) {
      // Error is handled in UsersTable, modal remains open
      console.error('Error in modal submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-theme-surface0 rounded-lg p-6 w-full max-w-lg relative border border-theme-border max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-text-secondary hover:text-theme-text-primary"
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">
          {user && user.id_nguoi_dung ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="ten_dang_nhap">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ten_dang_nhap"
              name="ten_dang_nhap"
              className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              value={formData.ten_dang_nhap}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="email_dang_nhap">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email_dang_nhap"
              name="email_dang_nhap"
              className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              value={formData.email_dang_nhap}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="mat_khau">
              Mật khẩu {!(user && user.id_nguoi_dung) && <span className="text-red-500">*</span>}
              {user && user.id_nguoi_dung && <span className="text-xs text-theme-text-tertiary"> (Để trống nếu không thay đổi)</span>}
            </label>
            <input
              type="password"
              id="mat_khau"
              name="mat_khau"
              className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              value={formData.mat_khau}
              onChange={handleChange}
              required={!(user && user.id_nguoi_dung)} // Required for new user
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="confirm_mat_khau">
              Xác nhận Mật khẩu {!(user && user.id_nguoi_dung) && <span className="text-red-500">*</span>}
              {user && user.id_nguoi_dung && formData.mat_khau && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="confirm_mat_khau"
              name="confirm_mat_khau"
              className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              value={formData.confirm_mat_khau}
              onChange={handleChange}
              required={!(user && user.id_nguoi_dung) || (user && user.id_nguoi_dung && !!formData.mat_khau)} // Required for new user or if new password is set
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="vai_tro">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              id="vai_tro"
              name="vai_tro"
              className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              value={formData.vai_tro}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              {/* Add other roles if any */}
            </select>
          </div>

          {user && user.id_nguoi_dung && ( // Only show status field when editing
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1" htmlFor="dang_hoat_dong">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                id="dang_hoat_dong"
                name="dang_hoat_dong"
                className="w-full bg-theme-surface border border-theme-border text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                value={formData.dang_hoat_dong}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Bị khóa</option>
                <option value={2}>Đã xóa</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
              Ảnh đại diện
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-theme-surface">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-theme-text-secondary">
                    <UploadCloud size={32} />
                  </div>
                )}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ml-5 bg-theme-surface border border-theme-border rounded-md py-2 px-3 text-sm font-medium text-theme-text-secondary hover:bg-theme-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary focus:ring-offset-theme-surface0"
                disabled={isLoading}
              >
                {previewImage ? 'Thay đổi ảnh' : 'Chọn ảnh'}
              </button>
              <input
                type="file"
                id="avatarFile"
                name="avatarFile"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData(prev => ({ ...prev, avatarFile: null }));
                    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
                  }}
                  className="text-xs text-red-500 hover:text-red-400"
                  disabled={isLoading}
                >
                  Xóa ảnh
                </button>
              )}
            </div>
            {formData.avatarFile && <p className="text-xs text-theme-text-tertiary mt-1">Đã chọn: {formData.avatarFile.name}</p>}
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-theme-background text-theme-text-secondary rounded-md hover:bg-theme-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary focus:ring-offset-theme-surface0"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary focus:ring-offset-theme-surface0 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : (user && user.id_nguoi_dung ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserFormModal;
