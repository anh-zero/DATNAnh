import React from 'react';
import { X, UserCircle, Mail, Shield, CalendarDays, CircleCheck, CircleX } from 'lucide-react';
import { motion } from 'framer-motion';

const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
    <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-gray-600 dark:text-theme-text-secondary">{label}:</span>
            <p className="text-gray-800 dark:text-theme-text-primary break-words text-base">{value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}</p>
        </div>
    </div>
);

const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

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

    const getUserStatusBadge = () => {
        // Chuyển đổi thành số
        const statusNum = parseInt(user.dang_hoat_dong);

        if (statusNum === 1) {
            return <span className="px-2.5 py-1.5 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 font-medium">Đang hoạt động</span>;
        } else if (statusNum === 0) {
            return <span className="px-2.5 py-1.5 text-sm rounded-full bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400 font-medium">Ngưng hoạt động</span>;
        } else if (statusNum === 2) {
            return <span className="px-2.5 py-1.5 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 font-medium">Đã xóa</span>;
        } else {
            return <span className="px-2.5 py-1.5 text-sm rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 font-medium">Không rõ ({user.dang_hoat_dong})</span>;
        }
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // Thêm dấu / trước đường dẫn và chuyển đổi dấu \ thành /
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${url.replace(/\\/g, '/')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center mb-6">
                        {/* Thay đổi từ w-20 h-20 thành w-32 h-32 và thêm shadow */}
                        <div className="w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-theme-border shadow-lg">
                            {user.url_anh_dai_dien ? (
                                <img
                                    src={getAvatarUrl(user.url_anh_dai_dien)}
                                    alt={`${user.ten_dang_nhap}'s avatar`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                                    {/* Tăng kích thước icon */}
                                    <UserCircle size={64} className="text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1">
                            {user.ten_dang_nhap}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-theme-text-tertiary mb-3">
                            ID người dùng: {user.id_nguoi_dung}
                        </p>
                        <div>{getUserStatusBadge()}</div>
                    </div>
                </div>

                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin tài khoản</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                        <DetailItem
                            label="Email đăng nhập"
                            value={user.email_dang_nhap}
                            icon={Mail}
                        />
                        <DetailItem
                            label="Vai trò"
                            value={user.vai_tro ? user.vai_tro.charAt(0).toUpperCase() + user.vai_tro.slice(1) : null}
                            icon={Shield}
                        />
                        <DetailItem
                            label="Trạng thái"
                            value={parseInt(user.dang_hoat_dong) === 1 ? "Đang hoạt động" : "Không hoạt động"}
                            icon={parseInt(user.dang_hoat_dong) === 1 ? CircleCheck : CircleX}
                        />
                    </div>
                </div>

                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin hệ thống</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                        <DetailItem
                            label="Ngày tạo"
                            value={formatDate(user.ngay_tao, true)}
                            icon={CalendarDays}
                        />
                        <DetailItem
                            label="Cập nhật lần cuối"
                            value={formatDate(user.ngay_cap_nhat, true)}
                            icon={CalendarDays}
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6 mt-6">
                    <div className="text-right">
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

export default UserDetailsModal;