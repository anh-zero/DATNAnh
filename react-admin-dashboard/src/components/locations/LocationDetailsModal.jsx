import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Edit, Map, Building, Users, Calendar, Activity, MapPin,
    Globe, Phone, Mail, Clock, Info, Loader, AlertCircle, CalendarDays
} from 'lucide-react';
import { getLocationActivities, getLocationPartners } from '../../api/services/locationService';
import { formatDate } from "../../utils/formatter";

// Component hiển thị từng mục thông tin giống như CustomerDetailsModal
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

const LocationDetailsModal = ({ location, onClose, onEdit }) => {
    const [activities, setActivities] = useState([]);
    const [partners, setPartners] = useState([]);
    const [activeTab, setActiveTab] = useState('info');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location?.id_dia_diem && activeTab === 'activities') {
            fetchActivities();
        } else if (location?.id_dia_diem && activeTab === 'partners') {
            fetchPartners();
        }
    }, [location?.id_dia_diem, activeTab]);

    const fetchActivities = async () => {
        if (!location?.id_dia_diem) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await getLocationActivities(location.id_dia_diem);
            if (response && response.success) {
                setActivities(response.data || []);
            } else {
                setError('Không thể tải danh sách hoạt động.');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            setError('Đã xảy ra lỗi khi tải danh sách hoạt động.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPartners = async () => {
        if (!location?.id_dia_diem) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await getLocationPartners(location.id_dia_diem);
            if (response && response.success) {
                setPartners(response.data || []);
            } else {
                setError('Không thể tải danh sách đối tác.');
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
            setError('Đã xảy ra lỗi khi tải danh sách đối tác.');
        } finally {
            setIsLoading(false);
        }
    };

    const getLocationTypeBadge = (type) => {
        const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";

        if (!type) return <span className={`${baseStyle} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600`}>Không xác định</span>;

        switch (type) {
            case 'Điểm tham quan':
                return <span className={`${baseStyle} bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50`}>Điểm tham quan</span>;
            case 'Thành phố':
                return <span className={`${baseStyle} bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50`}>Thành phố</span>;
            case 'Khách sạn':
                return <span className={`${baseStyle} bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50`}>Khách sạn</span>;
            case 'Nhà hàng':
                return <span className={`${baseStyle} bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 border border-green-200 dark:border-green-800/50`}>Nhà hàng</span>;
            case 'Sân bay':
                return <span className={`${baseStyle} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600`}>Sân bay</span>;
            default:
                return <span className={`${baseStyle} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600`}>Khác</span>;
        }
    };

    if (!location) {
        return null; // Không hiển thị nếu không có dữ liệu địa điểm
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-4xl relative border border-theme-border max-h-[90vh] overflow-y-auto shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                {/* Sticky header - Áp dụng kiểu như CustomerDetailsModal */}
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center mb-6">
                        {/* Icon map */}
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                            <Map size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1">
                            {location.ten_dia_diem || 'Địa điểm không có tên'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                ID: {location.id_dia_diem}
                            </p>
                            {getLocationTypeBadge(location.loai_dia_diem)}
                        </div>
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
                            ${activeTab === 'activities'
                                    ? 'border-b-2 border-theme-primary text-theme-primary'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('activities')}
                        >
                            Hoạt động
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm focus:outline-none
                            ${activeTab === 'partners'
                                    ? 'border-b-2 border-theme-primary text-theme-primary'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('partners')}
                        >
                            Đối tác
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="px-6 py-6 overflow-auto">
                    {activeTab === 'info' && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin địa điểm</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                <DetailItem
                                    label="Tên địa điểm"
                                    value={location.ten_dia_diem}
                                    icon={Map}
                                />
                                <DetailItem
                                    label="Loại địa điểm"
                                    value={location.loai_dia_diem}
                                    icon={Info}
                                />
                                <DetailItem
                                    label="Thành phố"
                                    value={location.thanh_pho}
                                    icon={Building}
                                />
                                <DetailItem
                                    label="Quốc gia"
                                    value={location.quoc_gia || 'Việt Nam'}
                                    icon={Globe}
                                />
                                <DetailItem
                                    label="Địa chỉ"
                                    value={location.dia_chi}
                                    icon={MapPin}
                                    fullWidth
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Tọa độ địa lý</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                <DetailItem
                                    label="Kinh độ"
                                    value={location.kinh_do != null ? location.kinh_do : undefined}
                                    icon={Globe}
                                />
                                <DetailItem
                                    label="Vĩ độ"
                                    value={location.vi_do != null ? location.vi_do : undefined}
                                    icon={Globe}
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Thông tin hệ thống</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                <DetailItem
                                    label="Ngày tạo"
                                    value={formatDate(location.ngay_tao, true)}
                                    icon={CalendarDays}
                                />
                                <DetailItem
                                    label="Cập nhật lần cuối"
                                    value={formatDate(location.ngay_cap_nhat, true)}
                                    icon={Clock}
                                />
                            </div>

                            {location.mo_ta && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Mô tả</h3>
                                    <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary text-sm">
                                        {location.mo_ta}
                                    </div>
                                </>
                            )}

                            {location.kinh_do != null && location.vi_do != null && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Bản đồ</h3>
                                    <div className="border border-gray-200 dark:border-theme-border rounded-lg overflow-hidden h-64 bg-gray-50 dark:bg-theme-surface1">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://maps.google.com/maps?q=${location.vi_do},${location.kinh_do}&z=15&output=embed`}
                                            title="Bản đồ địa điểm"
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'activities' && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={20} className="text-theme-primary" />
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary">Hoạt động tại địa điểm này</h3>
                            </div>

                            {error && (
                                <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 mb-4 rounded-md">
                                    <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-6 h-6 text-theme-primary animate-spin mr-2" />
                                    <span className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</span>
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-theme-surface0">
                                    <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                        <Activity size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Không có hoạt động</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Địa điểm này chưa có hoạt động nào được ghi nhận.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id_hoat_dong}
                                            className="p-4 border border-gray-200 dark:border-theme-border rounded-lg hover:bg-gray-50 dark:hover:bg-theme-surface1 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-theme-text-primary">{activity.ten_hoat_dong}</h4>
                                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-xs">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {activity.thoi_gian_bat_dau ?
                                                            `${activity.thoi_gian_bat_dau.substr(0, 5)}` +
                                                            (activity.thoi_gian_ket_thuc ? ` - ${activity.thoi_gian_ket_thuc.substr(0, 5)}` : '')
                                                            : 'Chưa có thời gian'}
                                                    </span>
                                                </div>
                                            </div>
                                            {activity.mo_ta_chi_tiet && (
                                                <p className="text-sm text-gray-600 dark:text-theme-text-secondary mt-1">{activity.mo_ta_chi_tiet}</p>
                                            )}
                                            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <Map size={14} className="mr-1" />
                                                <span>Tour: {activity.ten_tour || 'Không có thông tin'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'partners' && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Building size={20} className="text-theme-primary" />
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary">Đối tác tại địa điểm này</h3>
                            </div>

                            {error && (
                                <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 mb-4 rounded-md">
                                    <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-6 h-6 text-theme-primary animate-spin mr-2" />
                                    <span className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</span>
                                </div>
                            ) : partners.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-theme-surface0">
                                    <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                        <Building size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Không có đối tác</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Địa điểm này chưa có đối tác nào được ghi nhận.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {partners.map((partner) => (
                                        <div
                                            key={partner.id_doi_tac}
                                            className="p-4 border border-gray-200 dark:border-theme-border rounded-lg hover:bg-gray-50 dark:hover:bg-theme-surface1 transition-colors"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium text-gray-900 dark:text-theme-text-primary">{partner.ten_doi_tac}</h4>
                                                <span className="text-xs bg-theme-primary/20 text-theme-primary dark:bg-theme-primary/30 dark:text-theme-primary-light px-2 py-1 rounded-full">
                                                    ID: {partner.id_doi_tac}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                {partner.so_dien_thoai && (
                                                    <div className="flex items-center">
                                                        <Phone size={16} className="text-theme-primary mr-2" />
                                                        <span className="text-gray-600 dark:text-theme-text-secondary">{partner.so_dien_thoai}</span>
                                                    </div>
                                                )}
                                                {partner.email && (
                                                    <div className="flex items-center">
                                                        <Mail size={16} className="text-theme-primary mr-2" />
                                                        <span className="text-gray-600 dark:text-theme-text-secondary">{partner.email}</span>
                                                    </div>
                                                )}
                                                {partner.ma_so_thue && (
                                                    <div className="flex items-center">
                                                        <Info size={16} className="text-theme-primary mr-2" />
                                                        <span className="text-gray-600 dark:text-theme-text-secondary">MST: {partner.ma_so_thue}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sticky footer - thay đổi để giống với CustomerDetailsModal */}
                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                    <div className="text-right">
                        {activeTab === 'info' && onEdit && (
                            <button
                                onClick={() => onEdit(location)}
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

export default LocationDetailsModal;