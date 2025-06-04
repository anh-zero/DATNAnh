import { motion } from 'framer-motion';
import { X, Mail, UserCircle, Shield, CalendarDays, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const UserDetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start py-2">
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-gray-700">{label}:</span> {/* Example: text-gray-700 for labels */}
            <p className="text-gray-900 break-words">{value || 'N/A'}</p> {/* Example: text-gray-900 for values */}
        </div>
    </div>
);

const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatUserStatus = (status) => {
        switch (status) {
            case 1: return <span className="flex items-center text-green-500"><CheckCircle size={16} className="mr-1" /> Hoạt động</span>;
            case 0: return <span className="flex items-center text-red-500"><XCircle size={16} className="mr-1" /> Bị khóa</span>;
            case 2: return <span className="flex items-center text-yellow-500"><AlertTriangle size={16} className="mr-1" /> Đã xóa (mềm)</span>;
            default: return <span className="flex items-center text-gray-400">Không xác định</span>; // Fallback color
        }
    };

    const avatarUrl = user.url_anh_dai_dien
        ? user.url_anh_dai_dien.startsWith('http')
            ? user.url_anh_dai_dien
            : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}${user.url_anh_dai_dien.startsWith('/') ? user.url_anh_dai_dien : `/${user.url_anh_dai_dien}`}`
        : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white rounded-lg p-6 w-full max-w-md relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl" // Changed bg-theme-surface0 to bg-white and added shadow-xl
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" // Adjusted close button color for white background
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center"> {/* Adjusted title color */}
                    Chi tiết Người dùng
                </h2>

                <div className="flex flex-col items-center mb-6">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={user.ten_dang_nhap} className="w-24 h-24 rounded-full object-cover border-2 border-theme-primary mb-3" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-300 mb-3"> {/* Adjusted avatar fallback colors */}
                            <UserCircle size={48} />
                        </div>
                    )}
                    <p className="text-lg font-semibold text-gray-800">{user.ten_dang_nhap}</p> {/* Adjusted username color */}
                </div>

                <div className="divide-y divide-gray-200"> {/* Adjusted divider color */}
                    <UserDetailItem label="ID Người dùng" value={user.id_nguoi_dung} />
                    <UserDetailItem label="Email" value={user.email_dang_nhap} icon={Mail} />
                    <UserDetailItem label="Vai trò" value={user.vai_tro} icon={Shield} />
                    <UserDetailItem label="Trạng thái" value={formatUserStatus(user.dang_hoat_dong)} />
                    <UserDetailItem label="Ngày tạo" value={formatDate(user.ngay_tao)} icon={CalendarDays} />
                    <UserDetailItem label="Cập nhật lần cuối" value={formatDate(user.ngay_cap_nhat)} icon={CalendarDays} />
                    <UserDetailItem label="Đăng nhập cuối" value={formatDate(user.lan_dang_nhap_cuoi)} icon={Clock} />
                </div>

                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary focus:ring-offset-white" // Adjusted focus ring offset for white background
                    >
                        Đóng
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UserDetailsModal;