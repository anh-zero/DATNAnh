import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Edit, Loader, AlertCircle, UserCircle, Mail, Phone, Calendar,
  MapPin, Clock, CalendarDays, User
} from "lucide-react";
import { formatDate } from "../../utils/formatter";
import { getCustomerBookings } from "../../api/services/customerService";
import BookingDetailsModal from './BookingDetailsModal';

// Component hiển thị từng mục thông tin giống như trong UserDetailsModal
const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
  <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
    <div className="flex-grow">
      <span className="text-sm font-medium text-gray-600 dark:text-theme-text-secondary">{label}:</span>
      <p className="text-gray-800 dark:text-theme-text-primary break-words text-base">
        {value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}
      </p>
    </div>
  </div>
);

const CustomerDetailsModal = ({ customer, onClose, onEditClick }) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-4xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center mb-6">
            {/* Avatar section */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1">
              {customer.ho_ten || 'Chưa có tên'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-theme-text-tertiary mb-3">
              ID khách hàng: {customer.id_khach_hang}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-theme-border bg-white dark:bg-theme-surface0">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none 
              ${activeTab === 'info'
                  ? 'border-b-2 border-theme-primary text-theme-primary'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
              onClick={() => setActiveTab('info')}
            >
              Thông tin
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none
              ${activeTab === 'bookings'
                  ? 'border-b-2 border-theme-primary text-theme-primary'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
              onClick={() => setActiveTab('bookings')}
            >
              Đơn đặt tour
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="px-6 py-6 overflow-auto">
          {activeTab === 'info' && (
            <>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                <DetailItem
                  label="Họ và tên"
                  value={customer.ho_ten}
                  icon={User}
                />
                <DetailItem
                  label="Email"
                  value={customer.email_lien_he}
                  icon={Mail}
                />
                <DetailItem
                  label="Số điện thoại"
                  value={customer.so_dien_thoai}
                  icon={Phone}
                />
                <DetailItem
                  label="Ngày sinh"
                  value={formatDate(customer.ngay_sinh)}
                  icon={Calendar}
                />
                <DetailItem
                  label="Giới tính"
                  value={customer.gioi_tinh}
                  icon={User}
                />
                <DetailItem
                  label="Địa chỉ"
                  value={customer.dia_chi}
                  icon={MapPin}
                  fullWidth
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Thông tin hệ thống</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                <DetailItem
                  label="Ngày tạo"
                  value={formatDate(customer.ngay_tao, true)}
                  icon={CalendarDays}
                />
                <DetailItem
                  label="Cập nhật lần cuối"
                  value={formatDate(customer.ngay_cap_nhat, true)}
                  icon={CalendarDays}
                />
              </div>

              {customer.ghi_chu && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Ghi chú</h3>
                  <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary text-sm">
                    {customer.ghi_chu}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'bookings' && (
            <CustomerBookingsTab customerId={customer.id_khach_hang} />
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
          <div className="text-right">
            {activeTab === 'info' && onEditClick && (
              <button
                onClick={() => onEditClick(customer)}
                className="px-6 py-2.5 mr-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-theme-surface0"
              >
                <Edit size={16} className="inline-block mr-2" />
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
            >
              Đóng
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// The customer bookings tab component with improved styling
const CustomerBookingsTab = ({ customerId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const result = await getCustomerBookings(customerId, pagination.currentPage, pagination.limit);

        if (result && result.success) {
          setBookings(result.data || []);
          setPagination(result.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 10
          });
          setError(null);
        } else {
          setError('Không thể tải dữ liệu: ' + (result?.message || 'Lỗi không xác định'));
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Không thể tải lịch sử đặt tour. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchBookings();
    }
  }, [customerId, pagination.currentPage, pagination.limit]);

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400 border-emerald-200';
      case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 border-red-200';
      case 'Đã xác nhận': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400 border-blue-200';
      case 'Chờ thanh toán': return 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400 border-amber-200';
      case 'Mới': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-theme-primary animate-spin mr-2" />
        <span className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500 dark:text-red-400">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-theme-surface0">
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
          <Calendar size={48} strokeWidth={1} />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Không có đơn đặt tour</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Khách hàng chưa có đơn đặt tour nào.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-theme-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-theme-border">
          <thead className="bg-gray-50 dark:bg-theme-surface1">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                Tour
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                Ngày khởi hành
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                SL khách
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                Tổng tiền
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-theme-text-secondary uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-theme-surface0 divide-y divide-gray-200 dark:divide-theme-border">
            {bookings.map((booking) => (
              <tr
                key={booking.id_dat_tour}
                className="hover:bg-gray-50 dark:hover:bg-theme-surface1 transition-colors cursor-pointer"
                onClick={() => handleBookingClick(booking)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-theme-text-primary">
                  {booking.id_dat_tour}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-theme-text-primary">
                  <div className="font-medium">{booking.ten_tour || 'N/A'}</div>
                  {booking.url_anh_bia && (
                    <img
                      src={booking.url_anh_bia}
                      alt={booking.ten_tour}
                      className="w-12 h-8 object-cover rounded mt-1"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-theme-text-primary">
                  {formatDate(booking.ngay_khoi_hanh)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-800 dark:text-theme-text-primary">
                  {booking.so_luong_khach}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-theme-text-primary">
                  {formatCurrency(booking.tong_tien_thanh_toan)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-medium leading-5 rounded-full border ${getStatusClass(booking.trang_thai_dat_tour)}`}>
                    {booking.trang_thai_dat_tour}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-theme-surface0 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-theme-border">
            <div className="flex-1 flex justify-between items-center">
              <div className="text-sm text-gray-700 dark:text-theme-text-secondary">
                <span className="font-medium">{bookings.length}</span> trong số <span className="font-medium">{pagination.totalItems}</span> đơn
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-theme-border bg-white dark:bg-theme-surface1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-theme-surface2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-theme-border bg-white dark:bg-theme-surface1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-theme-surface2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-theme-border bg-white dark:bg-theme-surface1 text-sm font-medium text-gray-700 dark:text-theme-text-primary">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-theme-border bg-white dark:bg-theme-surface1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-theme-surface2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-theme-border bg-white dark:bg-theme-surface1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-theme-surface2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết booking */}
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseBookingDetails}
        />
      )}
    </>
  );
};

export default CustomerDetailsModal;