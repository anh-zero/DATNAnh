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

  const isEditing = !!tour;

  useEffect(() => {
    if (tour) {
      setFormData({
        ten_tour: tour.ten_tour || '',
        mo_ta_chi_tiet: tour.mo_ta_chi_tiet || '',
        thoi_gian_du_kien: tour.thoi_gian_du_kien || '',
        url_anh_bia: tour.url_anh_bia || ''
      });

      console.log("Tour data loaded:", {
        id: tour.id_san_pham_tour,
        name: tour.ten_tour,
        originalImage: tour.url_anh_bia
      });

      if (tour.url_anh_bia) {
        // Kiểm tra nếu URL hình ảnh là đường dẫn đầy đủ hoặc đường dẫn tương đối
        if (tour.url_anh_bia.startsWith('http')) {
          setImagePreview(tour.url_anh_bia);
        } else {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          setImagePreview(`${API_BASE_URL}${tour.url_anh_bia}`);
          console.log("Image preview URL:", `${API_BASE_URL}${tour.url_anh_bia}`);
        }
      }
    }
  }, [tour]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field '${name}' changed to:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected image:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Kích thước hình ảnh không được vượt quá 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      console.log("Image preview created");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    console.log("Image removed, previous url_anh_bia:", formData.url_anh_bia);
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, url_anh_bia: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Tạo một bản sao mới của formData để tránh thay đổi state gốc
      const dataToSubmit = { ...formData };

      // XÓA url_anh_bia khỏi object dữ liệu gửi đi
      // Đây là điểm quan trọng! Không gửi url_anh_bia hiện tại
      delete dataToSubmit.url_anh_bia;

      // Tạo FormData mới
      const submitData = new FormData();

      // Thêm các trường dữ liệu cơ bản
      Object.keys(dataToSubmit).forEach(key => {
        if (dataToSubmit[key]) {
          submitData.append(key, dataToSubmit[key]);
        }
      });

      // QUAN TRỌNG: Chỉ thêm file ảnh mới nếu có
      if (imageFile) {
        submitData.append('url_anh_bia', imageFile);
        console.log("Adding new image:", imageFile.name, imageFile.size, "bytes");
      }

      // Debug: Log các key trong FormData
      console.log("FormData fields:", [...submitData.keys()]);

      let response;
      if (isEditing) {
        response = await updateTour(tour.id_san_pham_tour, submitData);
      } else {
        response = await createTour(submitData);
      }

      console.log("Server response:", response);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-theme-surface p-6 rounded-lg shadow-lg max-w-2xl w-full relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          className="absolute top-4 right-4 text-theme-text-secondary hover:text-theme-text-primary"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">
          {isEditing ? 'Chỉnh sửa Tour' : 'Thêm Tour mới'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="ten_tour"
                className="block text-sm font-medium text-theme-text-secondary"
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
                className="w-full p-2 border border-theme-border rounded-md bg-theme-background focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="Nhập tên tour"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="thoi_gian_du_kien"
                className="block text-sm font-medium text-theme-text-secondary"
              >
                Thời gian dự kiến
              </label>
              <input
                type="text"
                id="thoi_gian_du_kien"
                name="thoi_gian_du_kien"
                value={formData.thoi_gian_du_kien}
                onChange={handleChange}
                className="w-full p-2 border border-theme-border rounded-md bg-theme-background focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="Ví dụ: 3 ngày 2 đêm"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mo_ta_chi_tiet"
                className="block text-sm font-medium text-theme-text-secondary"
              >
                Mô tả chi tiết
              </label>
              <textarea
                id="mo_ta_chi_tiet"
                name="mo_ta_chi_tiet"
                value={formData.mo_ta_chi_tiet}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-theme-border rounded-md bg-theme-background focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="Mô tả chi tiết về tour"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="url_anh_bia"
                className="block text-sm font-medium text-theme-text-secondary"
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
                  className="cursor-pointer bg-theme-background border border-theme-border px-4 py-2 rounded-md text-theme-text-secondary hover:bg-theme-hover"
                >
                  Chọn ảnh
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-2 text-red-500 hover:text-red-700"
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

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border rounded-md text-theme-text-secondary hover:bg-theme-hover"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm tour'}
            </button>
          </div>

          {/* Thêm nút Debug chỉ hiển thị trong môi trường phát triển */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs mr-auto"
              onClick={() => {
                console.group('Form Debug Info');
                console.log('Form Data:', formData);
                console.log('Image File:', imageFile);
                console.log('Is Editing:', isEditing);
                console.log('Original Tour:', tour);
                console.groupEnd();
              }}
            >
              Debug
            </button>
          )}

          {isEditing && (
            <button
              type="button"
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-md text-xs mt-2"
              onClick={async () => {
                if (!imageFile) {
                  alert("Vui lòng chọn một file ảnh trước");
                  return;
                }

                try {
                  setIsSubmitting(true);
                  setError('');

                  // Tạo một FormData mới chỉ chứa file ảnh
                  const imageOnlyData = new FormData();
                  imageOnlyData.append('url_anh_bia', imageFile);

                  console.log("Sending image-only update");
                  const response = await updateTour(tour.id_san_pham_tour, imageOnlyData);

                  console.log("Image update response:", response);
                  alert("Cập nhật ảnh thành công!");
                  onClose();
                } catch (err) {
                  console.error("Error updating image:", err);
                  setError(err.message || "Không thể cập nhật ảnh");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Chỉ cập nhật ảnh
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default TourFormModal;