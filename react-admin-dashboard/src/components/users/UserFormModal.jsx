import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

// Import thêm icon
import { UserCircle, Upload } from 'lucide-react';

const UserFormModal = ({ user, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    email_dang_nhap: '',
    mat_khau: '',
    confirm_mat_khau: '', // Đổi tên từ xac_nhan_mat_khau sang confirm_mat_khau
    vai_tro: 'user', // Default role
    dang_hoat_dong: true,
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(user?.url_anh_dai_dien || null);

  useEffect(() => {
    if (user) {
      setFormData({
        ten_dang_nhap: user.ten_dang_nhap || '',
        email_dang_nhap: user.email_dang_nhap || '',
        mat_khau: '', // Don't populate password field for security
        confirm_mat_khau: '',
        vai_tro: user.vai_tro || 'user',
        dang_hoat_dong: user.dang_hoat_dong !== undefined ? user.dang_hoat_dong : true,
        avatar: null // Avatar is handled separately
      });

      if (user.url_anh_dai_dien) {
        const avatarUrl = getAvatarUrl(user.url_anh_dai_dien);
        setAvatarPreview(avatarUrl);
        setPreviewImage(avatarUrl);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file' && files[0]) {
      setFormData({
        ...formData,
        avatar: files[0]
      });

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.ten_dang_nhap) {
      newErrors.ten_dang_nhap = 'Tên đăng nhập là bắt buộc';
    } else if (formData.ten_dang_nhap.length < 3) {
      newErrors.ten_dang_nhap = 'Tên đăng nhập phải từ 3 ký tự trở lên';
    }

    if (!formData.email_dang_nhap) {
      newErrors.email_dang_nhap = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email_dang_nhap)) {
      newErrors.email_dang_nhap = 'Email không hợp lệ';
    }

    // Yêu cầu mật khẩu khi tạo mới người dùng
    if (!user && !formData.mat_khau) {
      newErrors.mat_khau = 'Mật khẩu là bắt buộc';
    } else if (formData.mat_khau && formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    // Kiểm tra xác nhận mật khẩu nếu có mật khẩu mới
    if (formData.mat_khau) {
      if (!formData.confirm_mat_khau) {
        newErrors.confirm_mat_khau = 'Xác nhận mật khẩu là bắt buộc';
      } else if (formData.confirm_mat_khau !== formData.mat_khau) {
        newErrors.confirm_mat_khau = 'Mật khẩu xác nhận không khớp';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sử dụng FormData để gửi cả dữ liệu và file
    const formDataToSubmit = new FormData();

    // Thêm các trường text vào FormData
    formDataToSubmit.append('ten_dang_nhap', formData.ten_dang_nhap);
    formDataToSubmit.append('email_dang_nhap', formData.email_dang_nhap);
    if (formData.mat_khau) {
      formDataToSubmit.append('mat_khau', formData.mat_khau);
      formDataToSubmit.append('confirm_mat_khau', formData.confirm_mat_khau);
    }
    formDataToSubmit.append('vai_tro', formData.vai_tro);
    formDataToSubmit.append('dang_hoat_dong', formData.dang_hoat_dong);

    // Thêm file avatar nếu có
    if (formData.avatar instanceof File) {
      formDataToSubmit.append('avatar', formData.avatar);
    }

    try {
      await onSubmit(formDataToSubmit);
      onClose();
    } catch (error) {
      setErrors({
        form: error.message || 'Đã có lỗi xảy ra khi lưu thông tin người dùng.'
      });
    }
  };

  // Thêm hàm xử lý preview ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        // Cập nhật giá trị form nếu cần
        setFormData((prev) => ({ ...prev, avatar: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm để lấy URL đầy đủ cho ảnh đại diện (nếu có)
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${url.replace(/\\/g, '/')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-theme-border"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header với nền xám */}
        <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
            {user ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.form && (
            <div className="mb-4 p-2 bg-red-900 bg-opacity-20 border border-red-500 text-red-300 rounded">
              {errors.form}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">
              Ảnh đại diện
            </label>

            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-theme-border mb-3 relative group cursor-pointer"
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                {previewImage ? (
                  <img
                    src={getAvatarUrl(previewImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                    <UserCircle size={60} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}

                {/* Lớp overlay hiện khi hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={32} className="text-white" />
                </div>
              </div>

              <input
                id="avatar-upload"
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                Nhấp vào vòng tròn để chọn ảnh
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="ten_dang_nhap"
              value={formData.ten_dang_nhap}
              onChange={handleChange}
              className="w-full p-2 bg-theme-background border border-theme-border rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            {errors.ten_dang_nhap && (
              <p className="text-red-500 text-sm mt-1">{errors.ten_dang_nhap}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">Email</label>
            <input
              type="email"
              name="email_dang_nhap"
              value={formData.email_dang_nhap}
              onChange={handleChange}
              className="w-full p-2 bg-theme-background border border-theme-border rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            {errors.email_dang_nhap && (
              <p className="text-red-500 text-sm mt-1">{errors.email_dang_nhap}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">
              {user ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu'}
            </label>
            <input
              type="password"
              name="mat_khau"
              value={formData.mat_khau}
              onChange={handleChange}
              className="w-full p-2 bg-theme-background border border-theme-border rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            {errors.mat_khau && (
              <p className="text-red-500 text-sm mt-1">{errors.mat_khau}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirm_mat_khau"
              value={formData.confirm_mat_khau}
              onChange={handleChange}
              className="w-full p-2 bg-theme-background border border-theme-border rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            {errors.confirm_mat_khau && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm_mat_khau}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-1">Vai trò</label>
            <select
              name="vai_tro"
              value={formData.vai_tro}
              onChange={handleChange}
              className="w-full p-2 bg-theme-background border border-theme-border rounded focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dang_hoat_dong"
                name="dang_hoat_dong"
                checked={formData.dang_hoat_dong}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="dang_hoat_dong" className="text-theme-text-secondary">
                Đang hoạt động
              </label>
            </div>
          </div>
        </form>

        {/* Footer với nền xám */}
        <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-theme-background border border-theme-border rounded hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-theme-primary text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
            >
              {user ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserFormModal;
