import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CustomerFormModal = ({ customer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    email_lien_he: '',
    so_dien_thoai: '',
    dia_chi: '',
    ngay_sinh: '',
    gioi_tinh: '',
    ghi_chu: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        ho_ten: customer.ho_ten || '',
        email_lien_he: customer.email_lien_he || '',
        so_dien_thoai: customer.so_dien_thoai || '',
        dia_chi: customer.dia_chi || '',
        ngay_sinh: customer.ngay_sinh ? customer.ngay_sinh.substring(0, 10) : '',
        gioi_tinh: customer.gioi_tinh || '',
        ghi_chu: customer.ghi_chu || '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ho_ten.trim()) {
      newErrors.ho_ten = 'Họ tên không được để trống';
    }

    if (!formData.email_lien_he.trim()) {
      newErrors.email_lien_he = 'Email không được để trống';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email_lien_he)) {
      newErrors.email_lien_he = 'Email không hợp lệ';
    }

    if (!formData.so_dien_thoai.trim()) {
      newErrors.so_dien_thoai = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/i.test(formData.so_dien_thoai.replace(/\s/g, ''))) {
      newErrors.so_dien_thoai = 'Số điện thoại phải có 10 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formDataToSubmit = new FormData();

      // Add all form fields
      formDataToSubmit.append('ho_ten', formData.ho_ten);
      formDataToSubmit.append('email_lien_he', formData.email_lien_he);
      formDataToSubmit.append('so_dien_thoai', formData.so_dien_thoai);

      if (formData.dia_chi) formDataToSubmit.append('dia_chi', formData.dia_chi);
      if (formData.ngay_sinh) formDataToSubmit.append('ngay_sinh', formData.ngay_sinh);
      if (formData.gioi_tinh) formDataToSubmit.append('gioi_tinh', formData.gioi_tinh);
      if (formData.ghi_chu) formDataToSubmit.append('ghi_chu', formData.ghi_chu);

      await onSubmit(formDataToSubmit);
    } catch (error) {
      setError(error.message || 'Đã có lỗi xảy ra khi lưu thông tin khách hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-lg relative border border-theme-border shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-text-secondary hover:text-theme-text-primary"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-theme-text-primary mb-6">
            {customer && customer.id_khach_hang ? 'Chỉnh sửa Khách hàng' : 'Thêm Khách hàng mới'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
              <p><strong>Lỗi:</strong> {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ho_ten">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ho_ten"
                id="ho_ten"
                value={formData.ho_ten}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
              {errors.ho_ten && <p className="text-red-500 text-xs mt-1">{errors.ho_ten}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="email_lien_he">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email_lien_he"
                id="email_lien_he"
                value={formData.email_lien_he}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
              {errors.email_lien_he && <p className="text-red-500 text-xs mt-1">{errors.email_lien_he}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="so_dien_thoai">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="so_dien_thoai"
                id="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
              {errors.so_dien_thoai && <p className="text-red-500 text-xs mt-1">{errors.so_dien_thoai}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="dia_chi">
                Địa chỉ
              </label>
              <input
                type="text"
                name="dia_chi"
                id="dia_chi"
                value={formData.dia_chi}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ngay_sinh">
                Ngày sinh
              </label>
              <input
                type="date"
                name="ngay_sinh"
                id="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="gioi_tinh">
                Giới tính
              </label>
              <select
                name="gioi_tinh"
                id="gioi_tinh"
                value={formData.gioi_tinh}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ghi_chu">
                Ghi chú
              </label>
              <textarea
                name="ghi_chu"
                id="ghi_chu"
                value={formData.ghi_chu || ''}
                onChange={handleChange}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm bg-white dark:bg-theme-surface text-theme-text-primary hover:bg-gray-50 dark:hover:bg-theme-surface0 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-theme-primary text-white hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0 flex items-center"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Lưu thông tin</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerFormModal;