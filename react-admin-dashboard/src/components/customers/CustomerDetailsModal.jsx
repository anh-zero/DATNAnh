import { motion } from 'framer-motion';
import { X, UserCircle, Mail, Phone, CreditCard, CalendarDays, MapPin, Link2, Info } from 'lucide-react';

const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
  <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
    <div className="flex-grow">
      <span className="text-sm font-medium text-gray-600 dark:text-theme-text-secondary">{label}:</span>
      <p className="text-gray-800 dark:text-theme-text-primary break-words text-base">{value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}</p>
    </div>
  </div>
);

const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return null;
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return new Date(dateString).toLocaleString('vi-VN', options);
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg p-6 w-full max-w-xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-theme-primary bg-opacity-10 flex items-center justify-center text-theme-primary border-2 border-theme-primary mb-3">
            <UserCircle size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1">
            {customer.ho_ten}
          </h2>
          <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">ID Khách hàng: {customer.id_khach_hang}</p>
        </div>

        <div className="border-t border-gray-200 dark:border-theme-border pt-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
            <DetailItem label="Email" value={customer.email_lien_he} icon={Mail} />
            <DetailItem label="Số điện thoại" value={customer.so_dien_thoai} icon={Phone} />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-theme-border pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin cá nhân</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
            <DetailItem label="CCCD/CMND" value={customer.cccd} icon={CreditCard} />
            <DetailItem label="Ngày sinh" value={formatDate(customer.ngay_sinh)} icon={CalendarDays} />
            <DetailItem label="Địa chỉ" value={customer.dia_chi_kh} icon={MapPin} fullWidth={true} />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-theme-border pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin hệ thống</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
            {customer.id_nguoi_dung ? (
              <>
                <DetailItem label="Tên người dùng liên kết" value={customer.ten_nguoi_dung_lien_ket} icon={UserCircle} />
                <DetailItem label="Email người dùng liên kết" value={customer.email_nguoi_dung_lien_ket} icon={Mail} />
              </>
            ) : (
              <DetailItem label="Người dùng liên kết" value="Khách hàng vãng lai (Không có tài khoản)" icon={Info} fullWidth={true} />
            )}
            <DetailItem label="Ngày tạo" value={formatDate(customer.ngay_tao, true)} icon={CalendarDays} />
            <DetailItem label="Cập nhật lần cuối" value={formatDate(customer.ngay_cap_nhat, true)} icon={CalendarDays} />
          </div>
        </div>


        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerDetailsModal;