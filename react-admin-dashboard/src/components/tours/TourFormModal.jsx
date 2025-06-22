import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createTour, updateTour } from '../../api/services/tourService';
import { motion } from 'framer-motion';

const TourFormModal = ({ isOpen, onClose, tour = null }) => {
  const [formData, setFormData] = useState({
    ten_tour: '',
    mo_ta_chi_tiet: '',
    thoi_gian_du_kien: '',
    url_anh_bia: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = !!tour;

  useEffect(() => {
    if (tour) {
      setFormData({
        ten_tour: tour.ten_tour || '',
        mo_ta_chi_tiet: tour.mo_ta_chi_tiet || '',
        thoi_gian_du_kien: tour.thoi_gian_du_kien || '',
        url_anh_bia: tour.url_anh_bia || ''
      });

      if (tour.url_anh_bia) {
        // Kiểm tra nếu URL hình ảnh là đường dẫn đầy đủ hoặc đường dẫn tương đối
        if (tour.url_anh_bia.startsWith('http')) {
          setImagePreview(tour.url_anh_bia);
        } else {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          setImagePreview(`${API_BASE_URL}${tour.url_anh_bia}`);
        }
      }
    }
  }, [tour]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ten_tour || formData.ten_tour.trim().length < 2) {
      newErrors.ten_tour = 'Tên tour phải có ít nhất 2 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Xóa lỗi cho trường này khi người dùng thay đổi
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Kích thước hình ảnh không được vượt quá 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, url_anh_bia: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    const submitData = new FormData();

    // 1. Thêm trực tiếp các trường text
    submitData.append('ten_tour', formData.ten_tour);
    submitData.append('mo_ta_chi_tiet', formData.mo_ta_chi_tiet || '');
    submitData.append('thoi_gian_du_kien', formData.thoi_gian_du_kien || '');

    // 2. Xử lý logic cho ảnh
    if (imageFile) {
      // TRƯỜNG HỢP A: Người dùng đã chọn một file ảnh mới
      submitData.append('url_anh_bia', imageFile);
    } else if (isEditing && formData.url_anh_bia === null) {
      // TRƯỜNG HỢP B: Người dùng đang sửa và đã nhấn nút "Xóa ảnh"
      // Gửi một chuỗi rỗng làm tín hiệu cho backend
      submitData.append('url_anh_bia', '');
    }
    // TRƯỜNG HỢP C (ngầm định): Người dùng không đụng đến ảnh.
    // Trong trường hợp này, chúng ta không thêm trường `url_anh_bia` vào FormData.

    try {
      let response;
      if (isEditing) {
        response = await updateTour(tour.id_san_pham_tour, submitData);
      } else {
        response = await createTour(submitData);
      }

      alert(isEditing ? 'Cập nhật tour thành công!' : 'Thêm tour mới thành công!');
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = err.errors?.[0]?.msg || err.message || 'Có lỗi xảy ra khi lưu dữ liệu';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-lg relative border border-theme-border shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header màu xám */}
        <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
            {isEditing ? 'Chỉnh sửa Tour' : 'Thêm Tour mới'}
          </h2>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
              <p><strong>Lỗi:</strong> {error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="ten_tour"
                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
              >
                Tên tour <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ten_tour"
                name="ten_tour"
                value={formData.ten_tour}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                placeholder="Nhập tên tour"
              />
              {errors.ten_tour && <p className="text-red-500 text-xs mt-1">{errors.ten_tour}</p>}
            </div>

            <div>
              <label
                htmlFor="thoi_gian_du_kien"
                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
              >
                Thời gian dự kiến
              </label>
              <input
                type="text"
                id="thoi_gian_du_kien"
                name="thoi_gian_du_kien"
                value={formData.thoi_gian_du_kien}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                placeholder="Ví dụ: 3 ngày 2 đêm"
              />
            </div>

            <div>
              <label
                htmlFor="mo_ta_chi_tiet"
                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
              >
                Mô tả chi tiết
              </label>
              <textarea
                id="mo_ta_chi_tiet"
                name="mo_ta_chi_tiet"
                value={formData.mo_ta_chi_tiet}
                onChange={handleChange}
                rows={4}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                placeholder="Mô tả chi tiết về tour"
              />
            </div>

            <div>
              <label
                htmlFor="url_anh_bia"
                className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1"
              >
                Ảnh bìa
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="url_anh_bia"
                  name="url_anh_bia"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="url_anh_bia"
                  className="cursor-pointer px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm bg-white dark:bg-theme-surface text-theme-text-secondary hover:bg-gray-50"
                >
                  Chọn ảnh
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer màu xám */}
        <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm bg-white dark:bg-theme-surface text-theme-text-primary hover:bg-gray-50 dark:hover:bg-theme-surface0 focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-theme-primary text-white hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{isEditing ? 'Cập nhật' : 'Thêm mới'}</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TourFormModal;