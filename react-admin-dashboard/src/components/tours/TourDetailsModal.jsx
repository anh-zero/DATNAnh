import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Calendar, MapPin, Users, Clock, Edit, ImageOff,
    Tag, CalendarDays, Package, DollarSign, FileText
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import TourFormModal from './TourFormModal';
import { getTourSchedulesByTourId } from '../../api/services/tourScheduleService'; // Thêm import này

// Component hiển thị từng mục thông tin chi tiết
const DetailItem = ({ label, value, icon: Icon, fullWidth = false, isHtml = false }) => (
    <div className={`flex items-start py-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        {Icon && <Icon size={18} className="mr-3 mt-1 text-theme-primary flex-shrink-0" />}
        <div className="flex-grow">
            <span className="text-sm font-medium text-gray-600 dark:text-theme-text-secondary">{label}:</span>
            {isHtml ? (
                <div className="text-gray-800 dark:text-theme-text-primary break-words text-base prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: value || '<span class="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>' }} />
            ) : (
                <p className="text-gray-800 dark:text-theme-text-primary break-words text-base">
                    {value || <span className="italic text-gray-400 dark:text-gray-500">Chưa có thông tin</span>}
                </p>
            )}
        </div>
    </div>
);

const TourDetailsModal = ({ tour, isOpen, onClose, isLoading }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Thêm useEffect để lấy lịch trình
    useEffect(() => {
        if (isOpen && tour?.id_san_pham_tour && activeTab === 'schedules') {
            fetchTourSchedules();
        }
    }, [isOpen, tour?.id_san_pham_tour, activeTab]);

    // Hàm lấy lịch trình tour
    const fetchTourSchedules = async () => {
        if (!tour?.id_san_pham_tour) return;

        try {
            setLoadingSchedules(true);
            const response = await getTourSchedulesByTourId(tour.id_san_pham_tour);
            if (response && response.success) {
                setSchedules(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch tour schedules:", error);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Nếu chuyển sang tab lịch trình và chưa có dữ liệu, load dữ liệu
        if (tab === 'schedules' && schedules.length === 0 && !loadingSchedules) {
            fetchTourSchedules();
        }
    };

    if (!isOpen || (!tour && !isLoading)) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 w-full max-w-xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto mb-4"></div>
                    <p className="text-theme-text-primary">Đang tải chi tiết tour...</p>
                </div>
            </div>
        );
    }

    const handleEdit = () => {
        setShowEditModal(true);
    };

    // Định dạng trạng thái lịch trình
    const getScheduleStatusClass = (status) => {
        switch (status) {
            case 'Đã hủy':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'Đang mở bán':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Đã kết thúc':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Sắp mở bán':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Đã khởi hành':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Hết chỗ':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <motion.div
                    className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-4xl relative border border-theme-border max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
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
                            {/* Icon tour */}
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                                <Tag size={32} />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1 text-center">
                                {tour.ten_tour || 'Tour không có tên'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                                <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                    ID: {tour.id_san_pham_tour}
                                </p>
                                {tour.thoi_gian_du_kien && (
                                    <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                        | {tour.thoi_gian_du_kien}
                                    </p>
                                )}
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
                                onClick={() => handleTabChange('info')}
                            >
                                Thông tin
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-sm focus:outline-none
                ${activeTab === 'schedules'
                                        ? 'border-b-2 border-theme-primary text-theme-primary'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                                onClick={() => handleTabChange('schedules')}
                            >
                                Lịch trình
                            </button>
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="overflow-y-auto">
                        <div className="px-6 py-6">
                            {/* Info Tab */}
                            {activeTab === 'info' && (
                                <>
                                    {tour.url_anh_bia && (
                                        <div className="mb-6 rounded-md overflow-hidden border border-theme-border">
                                            <img
                                                src={tour.url_anh_bia.startsWith('http') ? tour.url_anh_bia : `${API_BASE_URL}${tour.url_anh_bia}`}
                                                alt={tour.ten_tour}
                                                className="w-full h-auto max-h-80 object-contain"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/800x400?text=Không+thể+hiển+thị+ảnh';
                                                }}
                                            />
                                        </div>
                                    )}
                                    {!tour.url_anh_bia && (
                                        <div className="mb-6 p-4 rounded-md border border-theme-border bg-gray-50 dark:bg-theme-surface flex items-center justify-center text-gray-400 dark:text-gray-500 h-40">
                                            <ImageOff size={32} className="mr-2" /> Không có ảnh bìa
                                        </div>
                                    )}

                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin chung</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                        <DetailItem label="Tên tour" value={tour.ten_tour} icon={Tag} />
                                        <DetailItem label="Thời gian dự kiến" value={tour.thoi_gian_du_kien} icon={Clock} />
                                        <DetailItem label="Ngày tạo" value={formatDateTime(tour.ngay_tao)} icon={CalendarDays} />
                                        <DetailItem label="Cập nhật lần cuối" value={formatDateTime(tour.ngay_cap_nhat)} icon={CalendarDays} />
                                    </div>

                                    {tour.mo_ta_chi_tiet && (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Mô tả chi tiết</h3>
                                            <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary">
                                                <div
                                                    className="prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: tour.mo_ta_chi_tiet }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Schedules Tab */}
                            {activeTab === 'schedules' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">
                                        Lịch trình khởi hành ({schedules?.length || 0})
                                    </h3>

                                    {loadingSchedules ? (
                                        <div className="text-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-theme-primary border-t-transparent mx-auto mb-4"></div>
                                            <p className="text-theme-text-secondary">Đang tải lịch trình...</p>
                                        </div>
                                    ) : !schedules || schedules.length === 0 ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Chưa có lịch trình nào cho tour này.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {schedules.map(s => (
                                                <div key={s.id_lich_trinh_tour} className="border border-theme-border rounded-md p-4 hover:bg-theme-surface transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center">
                                                            <Calendar size={18} className="text-theme-primary mr-2" />
                                                            <h4 className="font-medium text-theme-text-primary">Lịch trình #{s.id_lich_trinh_tour}</h4>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-md text-xs ${getScheduleStatusClass(s.trang_thai_lich_trinh)}`}>
                                                            {s.trang_thai_lich_trinh || 'Chưa xác định'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        <div className="flex items-center">
                                                            <CalendarDays size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Khởi hành: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {formatDate(s.ngay_khoi_hanh)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <CalendarDays size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Kết thúc: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {formatDate(s.ngay_ket_thuc)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <DollarSign size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Giá: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {s.gia_tien?.toLocaleString('vi-VN')} VNĐ
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Users size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Số chỗ: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {s.so_luong_cho_da_dat}/{s.so_luong_cho_toi_da}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {s.ghi_chu && (
                                                        <div className="mt-3 text-sm">
                                                            <p className="text-theme-text-secondary">Ghi chú:</p>
                                                            <p className="text-theme-text-primary mt-1 whitespace-pre-line">
                                                                {s.ghi_chu}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                        <div className="text-right">
                            {activeTab === 'info' && (
                                <button
                                    onClick={handleEdit}
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

            {showEditModal && (
                <TourFormModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                    }}
                    tour={tour}
                />
            )}
        </>
    );
};

export default TourDetailsModal;