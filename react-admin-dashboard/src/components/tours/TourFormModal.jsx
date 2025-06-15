import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { createTour, updateTour } from '../../api/services/tourService';
// import { getPartnersForSelect } from '../../api/services/partnerService'; // For partner selection later

const TourFormModal = ({ tour, isOpen, onClose, onSubmit }) => {
  const initialFormData = {
    ten_tour: '',
    mo_ta_chi_tiet: '',
    thoi_gian_du_kien: '',
    url_anh_bia: null, // Will hold existing image URL string or null
    // partners: [], // For managing associated partners later: [{ id_doi_tac, loai_hop_tac, ghi_chu }]
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedImageFile, setSelectedImageFile] = useState(null); // For new image file
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [partnerOptions, setPartnerOptions] = useState([]); // For partner selection later

  const API_BASE_URL_FOR_IMAGES = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    if (isOpen) {
      if (tour) {
        setFormData({
          ten_tour: tour.ten_tour || '',
          mo_ta_chi_tiet: tour.mo_ta_chi_tiet || '',
          thoi_gian_du_kien: tour.thoi_gian_du_kien || '',
          url_anh_bia: tour.url_anh_bia || null,
          // partners: tour.partners || [], // For partner management later
        });
        if (tour.url_anh_bia) {
          setImagePreview(`${API_BASE_URL_FOR_IMAGES}${tour.url_anh_bia}`);
        } else {
          setImagePreview(null);
        }
        setSelectedImageFile(null); // Reset file input on open
      } else {
        setFormData(initialFormData);
        setImagePreview(null);
        setSelectedImageFile(null);
      }
      setError(null); // Clear previous errors
    }
  }, [isOpen, tour, API_BASE_URL_FOR_IMAGES]);

  // Example: Fetch partners for a select dropdown (implement later if needed)
  // useEffect(() => {
  //   if (isOpen) {
  //     const fetchPartners = async () => {
  //       try {
  //         const partners = await getPartnersForSelect(); // This function needs to be in partnerService
  //         setPartnerOptions(partners); // partners should be an array of { value, label }
  //       } catch (err) {
  //         console.error("Failed to fetch partners for select:", err);
  //       }
  //     };
  //     fetchPartners();
  //   }
  // }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, url_anh_bia: null })); // Clear existing URL if new file is chosen
    } else {
      setSelectedImageFile(null);
      // If clearing selection, and there was an existing image, restore its preview
      if (tour && tour.url_anh_bia) {
        setImagePreview(`${API_BASE_URL_FOR_IMAGES}${tour.url_anh_bia}`);
        setFormData(prev => ({ ...prev, url_anh_bia: tour.url_anh_bia }));
      } else {
        setImagePreview(null);
      }
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, url_anh_bia: null })); // Mark for removal or no image
    // If there's a file input, clear its value
    const fileInput = document.getElementById('url_anh_bia_file');
    if (fileInput) {
        fileInput.value = "";
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const data = new FormData();
    data.append('ten_tour', formData.ten_tour);
    data.append('mo_ta_chi_tiet', formData.mo_ta_chi_tiet);
    data.append('thoi_gian_du_kien', formData.thoi_gian_du_kien);

    if (selectedImageFile) {
      data.append('url_anh_bia', selectedImageFile);
    } else if (formData.url_anh_bia === null && tour?.url_anh_bia) {
      // If url_anh_bia was explicitly set to null (meaning remove existing image)
      // The backend should handle an empty or null url_anh_bia field as "remove" or "no change if not provided"
      // Forcing it to null if user cleared it:
      data.append('url_anh_bia', ''); // Send empty string to signify removal, backend needs to handle this
    }
    // If editing and no new image selected, and formData.url_anh_bia still holds the old URL,
    // the backend PUT should ideally not require the image if it's not changing.
    // If backend requires it, or to be explicit:
    // else if (tour && formData.url_anh_bia) {
    //    data.append('url_anh_bia_existing', formData.url_anh_bia); // Or handle this logic in backend
    // }


    // For partners (if implementing later):
    // data.append('partners', JSON.stringify(formData.partners));

    try {
      if (tour && tour.id_san_pham_tour) {
        await updateTour(tour.id_san_pham_tour, data);
      } else {
        await createTour(data);
      }
      onSubmit(); // This will call handleFormSubmit in ToursTable to refresh and close
    } catch (err) {
      setError(err.message || 'Lưu tour không thành công. Vui lòng kiểm tra lại thông tin.');
      console.error("Form submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg p-6 w-full max-w-2xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary mb-6">
          {tour && tour.id_san_pham_tour ? 'Chỉnh sửa Sản phẩm Tour' : 'Thêm Sản phẩm Tour mới'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
            <p><strong>Lỗi:</strong> {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ten_tour">
              Tên Tour <span className="text-red-500">*</span>
            </label>
            <input type="text" name="ten_tour" id="ten_tour" value={formData.ten_tour} onChange={handleChange} required disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="mo_ta_chi_tiet">
              Mô tả chi tiết
            </label>
            <textarea name="mo_ta_chi_tiet" id="mo_ta_chi_tiet" value={formData.mo_ta_chi_tiet} onChange={handleChange} rows="4" disabled={isLoading}
                      className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="thoi_gian_du_kien">
              Thời gian dự kiến (VD: 3 ngày 2 đêm)
            </label>
            <input type="text" name="thoi_gian_du_kien" id="thoi_gian_du_kien" value={formData.thoi_gian_du_kien} onChange={handleChange} disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">
              Ảnh bìa
            </label>
            <div className="mt-1 flex flex-col items-center">
              <div className="w-full h-48 border-2 border-gray-300 dark:border-theme-border border-dashed rounded-md flex items-center justify-center mb-2 relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Xem trước ảnh bìa" className="max-h-full max-w-full object-contain rounded-md" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Chưa có ảnh</p>
                  </div>
                )}
                 {imagePreview && (
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa ảnh hiện tại"
                    >
                        <X size={14} />
                    </button>
                )}
              </div>
              <label htmlFor="url_anh_bia_file" 
                     className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-theme-surface dark:hover:bg-theme-background text-gray-700 dark:text-theme-text-secondary font-medium py-2 px-4 rounded-md text-sm inline-flex items-center">
                <UploadCloud size={18} className="mr-2" />
                {selectedImageFile ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
              </label>
              <input type="file" name="url_anh_bia_file" id="url_anh_bia_file" onChange={handleImageChange} accept="image/*" className="hidden" />
              {selectedImageFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedImageFile.name}</p>}
            </div>
          </div>

          {/* Placeholder for Partner Selection - Implement Later */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1">Đối tác liên kết</label>
            </div> */}


          <div className="pt-6 flex justify-end space-x-3 border-t border-theme-border">
            <button type="button" onClick={onClose} disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-theme-text-secondary bg-gray-100 dark:bg-theme-surface hover:bg-gray-200 dark:hover:bg-theme-background rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-theme-surface0">
              Hủy
            </button>
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0">
              {isLoading ? (tour && tour.id_san_pham_tour ? 'Đang cập nhật...' : 'Đang tạo...') : (tour && tour.id_san_pham_tour ? 'Lưu thay đổi' : 'Tạo Tour')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TourFormModal;