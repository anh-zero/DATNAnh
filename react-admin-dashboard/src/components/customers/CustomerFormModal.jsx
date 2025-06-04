import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, CreditCard, Calendar, MapPin, Link2 } from 'lucide-react';

const CustomerFormModal = ({ customer, isOpen, onClose, onSubmit }) => {
  const initialFormData = {
    ho_ten: '',
    email_lien_he: '',
    so_dien_thoai: '',
    cccd: '',
    ngay_sinh: '',
    dia_chi_kh: '',
    id_nguoi_dung: '', // For linking to a system user
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (customer && customer.id_khach_hang) { // Editing existing customer
        setFormData({
          ho_ten: customer.ho_ten || '',
          email_lien_he: customer.email_lien_he || '',
          so_dien_thoai: customer.so_dien_thoai || '',
          cccd: customer.cccd || '',
          ngay_sinh: customer.ngay_sinh ? new Date(customer.ngay_sinh).toISOString().split('T')[0] : '', // Format for date input
          dia_chi_kh: customer.dia_chi_kh || '',
          id_nguoi_dung: customer.id_nguoi_dung || '',
        });
      } else { // Creating new customer
        setFormData(initialFormData);
      }
    }
  }, [isOpen, customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Prepare data, ensure id_nguoi_dung is number or null
      const dataToSubmit = {
        ...formData,
        id_nguoi_dung: formData.id_nguoi_dung ? parseInt(formData.id_nguoi_dung, 10) : null,
        ngay_sinh: formData.ngay_sinh || null, // Send null if empty
        cccd: formData.cccd || null,
        dia_chi_kh: formData.dia_chi_kh || null,
      };
      if (!dataToSubmit.id_nguoi_dung) delete dataToSubmit.id_nguoi_dung; // Remove if null/0 to avoid sending empty string
      if (!dataToSubmit.ngay_sinh) delete dataToSubmit.ngay_sinh;
      if (!dataToSubmit.cccd) delete dataToSubmit.cccd;
      if (!dataToSubmit.dia_chi_kh) delete dataToSubmit.dia_chi_kh;


      await onSubmit(dataToSubmit);
      // onClose(); // The parent component (CustomersTable) will call onClose on successful submission
    } catch (err) {
      setError(err.message || 'Lỗi không xác định. Vui lòng thử lại.');
      console.error("Form submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg p-6 w-full max-w-lg relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
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
            <input type="text" name="ho_ten" id="ho_ten" value={formData.ho_ten} onChange={handleChange} required disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="email_lien_he">
              Email liên hệ <span className="text-red-500">*</span>
            </label>
            <input type="email" name="email_lien_he" id="email_lien_he" value={formData.email_lien_he} onChange={handleChange} required disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="so_dien_thoai">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input type="tel" name="so_dien_thoai" id="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} required disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="cccd">
              CCCD/CMND
            </label>
            <input type="text" name="cccd" id="cccd" value={formData.cccd} onChange={handleChange} disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ngay_sinh">
              Ngày sinh
            </label>
            <input type="date" name="ngay_sinh" id="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} disabled={isLoading}
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="dia_chi_kh">
              Địa chỉ
            </label>
            <textarea name="dia_chi_kh" id="dia_chi_kh" value={formData.dia_chi_kh} onChange={handleChange} rows="3" disabled={isLoading}
                      className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="id_nguoi_dung">
              ID Người dùng liên kết (hệ thống)
            </label>
            <input type="number" name="id_nguoi_dung" id="id_nguoi_dung" value={formData.id_nguoi_dung} onChange={handleChange} disabled={isLoading} placeholder="Để trống nếu không có"
                   className="w-full bg-gray-50 dark:bg-theme-surface border border-gray-300 dark:border-theme-border text-gray-900 dark:text-theme-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-theme-text-secondary bg-gray-100 dark:bg-theme-surface hover:bg-gray-200 dark:hover:bg-theme-background rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-theme-surface0">
              Hủy
            </button>
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0">
              {isLoading ? (customer && customer.id_khach_hang ? 'Đang cập nhật...' : 'Đang tạo...') : (customer && customer.id_khach_hang ? 'Lưu thay đổi' : 'Tạo Khách hàng')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerFormModal;