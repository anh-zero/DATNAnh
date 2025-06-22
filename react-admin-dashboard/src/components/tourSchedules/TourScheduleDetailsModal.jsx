import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Calendar, MapPin, Users, Clock, Edit, ImageOff,
    Tag, CalendarDays, Package, DollarSign, FileText, Ban, CheckCircle, User, Phone,
    Search, Plus, Check, Trash2
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import TourScheduleFormModal from './TourScheduleFormModal';
import {
    getScheduleBookings,
    getScheduleServices,
    getScheduleActivities,
    addServiceToSchedule,
    updateServiceInSchedule,
    removeServiceFromSchedule,
    addActivityToSchedule,
    updateActivityInSchedule, // Thêm dòng này
    removeActivityFromSchedule,
    getAllAvailableTourServices
} from '../../api/services/tourScheduleService';

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

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Đang mở bán':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'Sắp mở bán':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Hết chỗ':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'Đã khởi hành':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        case 'Đã kết thúc':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
        case 'Đã hủy':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

const getBookingStatusBadgeClass = (status) => {
    switch (status) {
        case 'Đã xác nhận':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'Chờ xác nhận':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Đã hủy':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'Hoàn thành':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

const TourScheduleDetailsModal = ({ schedule, isOpen, onClose, isLoading }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    // State cho các tab hiện tại
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [activities, setActivities] = useState([]);
    const [activityInput, setActivityInput] = useState('');
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // State mới cho modal chọn dịch vụ
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [availableServices, setAvailableServices] = useState([]);
    const [loadingAvailableServices, setLoadingAvailableServices] = useState(false);
    const [searchServiceTerm, setSearchServiceTerm] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);

    // State cho chức năng sửa và xóa dịch vụ
    const [editingService, setEditingService] = useState(null);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Thêm state mới cho quản lý hoạt động
    const [editingActivity, setEditingActivity] = useState(null);
    const [showEditActivityModal, setShowEditActivityModal] = useState(false);
    const [showConfirmDeleteActivityModal, setShowConfirmDeleteActivityModal] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Fetch dữ liệu khi đổi tab
    useEffect(() => {
        if (!schedule?.id_lich_trinh_tour) return;
        if (activeTab === 'bookings') {
            setLoadingBookings(true);
            getScheduleBookings(schedule.id_lich_trinh_tour)
                .then(res => {
                    console.log("API Response:", res); // Kiểm tra toàn bộ response
                    console.log("Booking data:", res.data); // Kiểm tra dữ liệu booking
                    if (res.data && res.data.length > 0) {
                        console.log("First booking:", res.data[0]); // Kiểm tra cấu trúc chi tiết booking
                    }
                    setBookings(res.data || []);
                })
                .finally(() => setLoadingBookings(false));
        }
        if (activeTab === 'services') {
            setLoadingServices(true);
            getScheduleServices(schedule.id_lich_trinh_tour)
                .then(res => setServices(res.data || []))
                .finally(() => setLoadingServices(false));
        }
        if (activeTab === 'activities') {
            setLoadingActivities(true);
            getScheduleActivities(schedule.id_lich_trinh_tour)
                .then(res => setActivities(res.data || []))
                .finally(() => setLoadingActivities(false));
        }
    }, [activeTab, schedule?.id_lich_trinh_tour]);

    // Thêm useEffect mới để lấy danh sách dịch vụ khi mở modal
    useEffect(() => {
        if (showServiceModal && availableServices.length === 0) {
            fetchAvailableServices();
        }
    }, [showServiceModal]);

    // Hàm lấy danh sách dịch vụ có sẵn
    const fetchAvailableServices = async () => {
        setLoadingAvailableServices(true);
        try {
            const response = await getAllAvailableTourServices();
            if (response && response.success) {
                setAvailableServices(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch available services:", error);
        } finally {
            setLoadingAvailableServices(false);
        }
    };

    // Hàm xử lý khi chọn/bỏ chọn dịch vụ
    const toggleServiceSelection = (serviceId) => {
        if (selectedServiceIds.includes(serviceId)) {
            setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
        } else {
            setSelectedServiceIds(prev => [...prev, serviceId]);
        }
    };

    // Hàm lọc dịch vụ theo từ khóa tìm kiếm
    const filteredServices = searchServiceTerm
        ? availableServices.filter(service =>
            service.ten_dich_vu.toLowerCase().includes(searchServiceTerm.toLowerCase()))
        : availableServices;

    // Hàm thêm các dịch vụ đã chọn vào lịch trình
    const handleAddSelectedServices = async () => {
        if (selectedServiceIds.length === 0) return;

        try {
            // Thực hiện lần lượt các cuộc gọi API để thêm từng dịch vụ
            for (const id_dich_vu_tour of selectedServiceIds) {
                await addServiceToSchedule(schedule.id_lich_trinh_tour, { id_dich_vu_tour });
            }

            // Cập nhật lại danh sách dịch vụ sau khi thêm thành công
            setLoadingServices(true);
            const response = await getScheduleServices(schedule.id_lich_trinh_tour);
            if (response && response.data) {
                setServices(response.data);
            }

            // Đóng modal và reset state
            setShowServiceModal(false);
            setSelectedServiceIds([]);
            setSearchServiceTerm('');
        } catch (error) {
            console.error("Error adding services:", error);
            // Xử lý lỗi nếu cần
        } finally {
            setLoadingServices(false);
        }
    };

    // Handler để mở modal chỉnh sửa dịch vụ
    const handleEditService = (service, e) => {
        e.stopPropagation();  // Ngăn sự kiện click lan ra ngoài
        console.log("Service being edited:", service); // Kiểm tra đối tượng dịch vụ
        setEditingService(service);
        setShowEditServiceModal(true);
    };

    // Sửa hàm này để nhận dữ liệu trực tiếp
    const handleUpdateService = async (updatedData) => {
        try {
            await updateServiceInSchedule(
                schedule.id_lich_trinh_tour,
                editingService.id_dich_vu_tour || editingService.id_dich_vu,
                {
                    ...updatedData,
                    id_dich_vu_tour: editingService.id_dich_vu_tour || editingService.id_dich_vu
                }
            );

            // Refresh danh sách dịch vụ
            setLoadingServices(true);
            const response = await getScheduleServices(schedule.id_lich_trinh_tour);
            if (response && response.data) {
                setServices(response.data);
            }

            // Đóng modal và reset state
            setShowEditServiceModal(false);
            setEditingService(null);
        } catch (error) {
            console.error("Error updating service:", error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Handler để mở modal xác nhận xóa
    const handleDeleteServiceConfirm = (service, e) => {
        e.stopPropagation();  // Ngăn sự kiện click lan ra ngoài
        setServiceToDelete(service);
        setShowConfirmDeleteModal(true);
    };

    // Handler để xóa dịch vụ
    const handleDeleteService = async () => {
        if (!serviceToDelete) return;

        try {
            // Thay đổi từ id_dich_vu thành id_dich_vu_tour
            await removeServiceFromSchedule(
                schedule.id_lich_trinh_tour,
                serviceToDelete.id_dich_vu_tour  // Thay vì serviceToDelete.id_dich_vu
            );

            // Phần còn lại giữ nguyên
            setLoadingServices(true);
            const response = await getScheduleServices(schedule.id_lich_trinh_tour);
            if (response && response.data) {
                setServices(response.data);
            }

            setShowConfirmDeleteModal(false);
            setServiceToDelete(null);
        } catch (error) {
            console.error("Error deleting service:", error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Thêm các hàm xử lý hoạt động
    const handleEditActivity = (activity, e) => {
        e.stopPropagation();
        console.log("Activity being edited:", activity);
        setEditingActivity(activity);
        setShowEditActivityModal(true);
    };

    const handleUpdateActivity = async (updatedData) => {
        try {
            await updateActivityInSchedule(
                schedule.id_lich_trinh_tour,
                editingActivity.id_hoat_dong,
                {
                    ...updatedData,
                    id_hoat_dong: editingActivity.id_hoat_dong
                }
            );

            // Refresh danh sách hoạt động
            setLoadingActivities(true);
            const response = await getScheduleActivities(schedule.id_lich_trinh_tour);
            if (response && response.data) {
                setActivities(response.data);
            }

            // Đóng modal và reset state
            setShowEditActivityModal(false);
            setEditingActivity(null);
        } catch (error) {
            console.error("Error updating activity:", error);
        } finally {
            setLoadingActivities(false);
        }
    };

    const handleDeleteActivityConfirm = (activity, e) => {
        e.stopPropagation();
        setActivityToDelete(activity);
        setShowConfirmDeleteActivityModal(true);
    };

    const handleDeleteActivity = async () => {
        if (!activityToDelete) return;

        try {
            await removeActivityFromSchedule(
                schedule.id_lich_trinh_tour,
                activityToDelete.id_hoat_dong
            );

            // Refresh danh sách hoạt động
            setLoadingActivities(true);
            const response = await getScheduleActivities(schedule.id_lich_trinh_tour);
            if (response && response.data) {
                setActivities(response.data);
            }

            setShowConfirmDeleteActivityModal(false);
            setActivityToDelete(null);
        } catch (error) {
            console.error("Error deleting activity:", error);
        } finally {
            setLoadingActivities(false);
        }
    };

    if (!isOpen || (!schedule && !isLoading)) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 w-full max-w-xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto mb-4"></div>
                    <p className="text-theme-text-primary">Đang tải chi tiết lịch trình...</p>
                </div>
            </div>
        );
    }

    const handleEdit = () => setShowEditModal(true);

    // Tính số ngày của tour
    const startDate = new Date(schedule.ngay_khoi_hanh);
    const endDate = new Date(schedule.ngay_ket_thuc);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Thêm hoạt động
    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (!activityInput.trim()) return;
        await addActivityToSchedule(schedule.id_lich_trinh_tour, { description: activityInput });
        setActivityInput('');
        setLoadingActivities(true);
        getScheduleActivities(schedule.id_lich_trinh_tour)
            .then(res => setActivities(res.data || []))
            .finally(() => setLoadingActivities(false));
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
                            {/* Icon lịch trình */}
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                                <Calendar size={32} />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1 text-center">
                                {schedule.sanphamtour?.ten_tour || 'Tour không xác định'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(schedule.trang_thai_lich_trinh)}`}>
                                    {schedule.trang_thai_lich_trinh}
                                </span>
                                <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                    ID: {schedule.id_lich_trinh_tour}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                    | {durationInDays} ngày
                                </p>
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
                                ${activeTab === 'bookings'
                                        ? 'border-b-2 border-theme-primary text-theme-primary'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                Đặt tour
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-sm focus:outline-none
                                ${activeTab === 'services'
                                        ? 'border-b-2 border-theme-primary text-theme-primary'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                                onClick={() => setActiveTab('services')}
                            >
                                Dịch vụ
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
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="overflow-y-auto">
                        <div className="px-6 py-6">
                            {/* Info Tab */}
                            {activeTab === 'info' && (
                                <>
                                    {schedule.sanphamtour?.url_anh_bia ? (
                                        <div className="mb-6 rounded-md overflow-hidden border border-theme-border">
                                            <img
                                                src={schedule.sanphamtour.url_anh_bia.startsWith('http') ?
                                                    schedule.sanphamtour.url_anh_bia :
                                                    `${API_BASE_URL}${schedule.sanphamtour.url_anh_bia}`}
                                                alt={schedule.sanphamtour?.ten_tour}
                                                className="w-full h-auto max-h-80 object-contain"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/800x400?text=Không+thể+hiển+thị+ảnh';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 p-4 rounded-md border border-theme-border bg-gray-50 dark:bg-theme-surface flex items-center justify-center text-gray-400 dark:text-gray-500 h-40">
                                            <ImageOff size={32} className="mr-2" /> Không có ảnh bìa
                                        </div>
                                    )}

                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin lịch trình</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                        <DetailItem label="Tour" value={schedule.sanphamtour?.ten_tour} icon={Tag} />
                                        <DetailItem label="Trạng thái" value={schedule.trang_thai_lich_trinh} icon={CheckCircle} />
                                        <DetailItem label="Ngày khởi hành" value={formatDate(schedule.ngay_khoi_hanh)} icon={CalendarDays} />
                                        <DetailItem label="Ngày kết thúc" value={formatDate(schedule.ngay_ket_thuc)} icon={CalendarDays} />
                                        <DetailItem label="Giá tour" value={`${schedule.gia_tien?.toLocaleString('vi-VN')} VNĐ`} icon={DollarSign} />
                                        <DetailItem
                                            label="Số chỗ"
                                            value={`${schedule.so_luong_cho_da_dat || 0}/${schedule.so_luong_cho_toi_da || 0} (Còn trống: ${(schedule.so_luong_cho_toi_da || 0) - (schedule.so_luong_cho_da_dat || 0)
                                                })`}
                                            icon={Users}
                                        />
                                    </div>

                                    {schedule.ghi_chu && (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Ghi chú</h3>
                                            <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary">
                                                <p className="whitespace-pre-line">{schedule.ghi_chu}</p>
                                            </div>
                                        </>
                                    )}

                                    {schedule.sanphamtour?.mo_ta_chi_tiet && (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Mô tả tour</h3>
                                            <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary">
                                                <div
                                                    className="prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: schedule.sanphamtour.mo_ta_chi_tiet }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Bookings Tab */}
                            {activeTab === 'bookings' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">
                                        Danh sách đặt tour ({bookings.length})
                                    </h3>
                                    {loadingBookings ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Đang tải đơn đặt tour...</p>
                                        </div>
                                    ) : bookings.length === 0 ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Chưa có đơn đặt tour nào cho lịch trình này.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookings.map(booking => (
                                                <div key={booking.id_dat_tour} className="border border-theme-border rounded-md p-4 hover:bg-theme-surface transition-colors">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <User size={18} className="text-theme-primary mr-2" />
                                                            <h4 className="font-medium text-theme-text-primary">
                                                                {booking.ho_ten || 'Khách hàng không xác định'}
                                                            </h4>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-md text-xs ${getBookingStatusBadgeClass(booking.trang_thai_dat_tour)}`}>
                                                            {booking.trang_thai_dat_tour || 'Không xác định'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        <div className="flex items-center">
                                                            <DollarSign size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Tổng tiền: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {(booking.tong_tien_du_kien || 0).toLocaleString('vi-VN')} VNĐ
                                                                {booking.tong_tien_thanh_toan > 0 ? ` (Đã thanh toán: ${booking.tong_tien_thanh_toan.toLocaleString('vi-VN')} VNĐ)` : ''}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <CalendarDays size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Ngày đặt: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {formatDate(booking.ngay_dat_tour)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Users size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">Số khách: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                {booking.so_luong_nguoi || 0}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Tag size={14} className="text-theme-text-secondary mr-1" />
                                                            <span className="text-theme-text-secondary">ID: </span>
                                                            <span className="font-medium text-theme-text-primary ml-1">
                                                                #{booking.id_dat_tour}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center mt-3 text-sm text-theme-text-secondary">
                                                        <MapPin size={14} className="mr-1" />
                                                        <span>{booking.email_lien_he || booking.khachhang?.email_lien_he || booking.email || 'Không có email'}</span>
                                                        <span className="mx-2">•</span>
                                                        <Phone size={14} className="mr-1" />
                                                        <span>{booking.so_dien_thoai || 'Không có SĐT'}</span>
                                                    </div>

                                                    {booking.ghi_chu && (
                                                        <div className="mt-3 text-sm">
                                                            <p className="text-theme-text-secondary">Ghi chú:</p>
                                                            <p className="text-theme-text-primary mt-1 whitespace-pre-line bg-gray-50 dark:bg-theme-surface1 p-2 rounded-md">
                                                                {booking.ghi_chu}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Services Tab - Đã cập nhật với nút sửa/xóa */}
                            {activeTab === 'services' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">
                                        Dịch vụ lịch trình ({services.length})
                                    </h3>
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setShowServiceModal(true)}
                                            className="flex items-center gap-2 bg-theme-primary text-white px-4 py-2 rounded hover:bg-theme-primary/90"
                                        >
                                            <Plus size={18} /> Thêm dịch vụ
                                        </button>
                                    </div>
                                    {loadingServices ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Đang tải dịch vụ...</p>
                                        </div>
                                    ) : services.length === 0 ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Chưa có dịch vụ nào cho lịch trình này.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-2">
                                            {services.map((service, idx) => (
                                                <li key={service.id_dich_vu || idx} className="border border-theme-border rounded-md p-3 flex items-center">
                                                    <Package size={18} className="text-theme-primary mr-2" />
                                                    <div className="flex-grow">
                                                        <span className="font-medium text-theme-text-primary">{service.ten_dich_vu}</span>
                                                        {service.loai_dich_vu && (
                                                            <span className="ml-2 text-xs text-theme-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                                {service.loai_dich_vu}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => handleEditService(service, e)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-theme-surface1 rounded-full text-blue-500"
                                                            title="Sửa dịch vụ"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteServiceConfirm(service, e)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-theme-surface1 rounded-full text-red-500"
                                                            title="Xóa dịch vụ"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}

                            {/* Activities Tab */}
                            {activeTab === 'activities' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">
                                        Lịch trình hoạt động ({activities.length})
                                    </h3>
                                    <form className="flex gap-2 mb-4" onSubmit={handleAddActivity}>
                                        <input
                                            type="text"
                                            className="border rounded px-3 py-2 flex-1"
                                            placeholder="Mô tả hoạt động mới..."
                                            value={activityInput}
                                            onChange={e => setActivityInput(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="bg-theme-primary text-white px-4 py-2 rounded hover:bg-theme-primary/90"
                                        >
                                            Thêm hoạt động
                                        </button>
                                    </form>
                                    {loadingActivities ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Đang tải hoạt động...</p>
                                        </div>
                                    ) : activities.length === 0 ? (
                                        <div className="text-center py-10 text-theme-text-secondary">
                                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Chưa có hoạt động nào được ghi lại cho lịch trình này.</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-4">
                                            <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                            <div className="space-y-6">
                                                {activities.map((activity, index) => (
                                                    <div key={activity.id_hoat_dong || index} className="relative">
                                                        <div className="absolute -left-4 mt-1 w-7 h-7 rounded-full bg-theme-primary/10 border-2 border-theme-primary flex items-center justify-center">
                                                            <FileText size={14} className="text-theme-primary" />
                                                        </div>
                                                        <div className="pl-6 flex justify-between">
                                                            <div className="flex-grow">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {formatDateTime(activity.ngay_tao || activity.timestamp)}
                                                                </p>
                                                                <p className="text-base text-theme-text-primary mt-1">
                                                                    {activity.ten_hoat_dong || activity.description || 'N/A'}
                                                                </p>
                                                                {(activity.mo_ta_chi_tiet || activity.details) && (
                                                                    <p className="text-sm text-theme-text-secondary mt-1 bg-gray-50 dark:bg-theme-surface1 p-2 rounded-md">
                                                                        {activity.mo_ta_chi_tiet || activity.details}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex space-x-2 ml-4">
                                                                <button
                                                                    onClick={(e) => handleEditActivity(activity, e)}
                                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-theme-surface1 rounded-full text-blue-500"
                                                                    title="Sửa hoạt động"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteActivityConfirm(activity, e)}
                                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-theme-surface1 rounded-full text-red-500"
                                                                    title="Xóa hoạt động"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                        <div className="text-right">
                            {activeTab === 'info' && schedule.trang_thai_lich_trinh !== 'Đã hủy' && (
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

            {/* Modal chọn dịch vụ */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <motion.div
                        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-2xl border border-theme-border shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="p-6 border-b border-theme-border flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-theme-text-primary">
                                Chọn dịch vụ cho lịch trình
                            </h3>
                            <button
                                onClick={() => setShowServiceModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Tìm kiếm */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dịch vụ..."
                                    className="w-full px-4 py-2 pl-10 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                    value={searchServiceTerm}
                                    onChange={(e) => setSearchServiceTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>

                            {/* Danh sách dịch vụ */}
                            {loadingAvailableServices ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-theme-primary border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-theme-text-secondary">Đang tải danh sách dịch vụ...</p>
                                </div>
                            ) : filteredServices.length === 0 ? (
                                <div className="text-center py-10 text-theme-text-secondary">
                                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Không tìm thấy dịch vụ nào phù hợp.</p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto border border-theme-border rounded-md">
                                    {filteredServices.map((service) => (
                                        <div
                                            key={service.id_dich_vu_tour}
                                            className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-theme-surface1 cursor-pointer border-b border-theme-border last:border-b-0 ${selectedServiceIds.includes(service.id_dich_vu_tour)
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : ''
                                                }`}
                                            onClick={() => toggleServiceSelection(service.id_dich_vu_tour)}
                                        >
                                            <div className={`w-6 h-6 rounded-full border ${selectedServiceIds.includes(service.id_dich_vu_tour)
                                                ? 'bg-theme-primary border-theme-primary flex items-center justify-center'
                                                : 'border-gray-300 dark:border-gray-600'
                                                } mr-3`}>
                                                {selectedServiceIds.includes(service.id_dich_vu_tour) && (
                                                    <Check size={14} className="text-white" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="font-medium text-theme-text-primary">{service.ten_dich_vu}</div>
                                                {service.mo_ta && (
                                                    <div className="text-sm text-theme-text-secondary">{service.mo_ta}</div>
                                                )}
                                            </div>
                                            {service.loai_dich_vu && (
                                                <span className="text-xs text-theme-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                    {service.loai_dich_vu}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Số lượng đã chọn và nút */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-theme-text-secondary">
                                    Đã chọn {selectedServiceIds.length} dịch vụ
                                </div>
                                <div className="space-x-3">
                                    <button
                                        onClick={() => setShowServiceModal(false)}
                                        className="px-4 py-2 border border-theme-border rounded-md hover:bg-gray-50 dark:hover:bg-theme-surface1"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAddSelectedServices}
                                        disabled={selectedServiceIds.length === 0}
                                        className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Thêm vào lịch trình
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal chỉnh sửa dịch vụ */}
            {showEditServiceModal && editingService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <motion.div
                        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md border border-theme-border shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="p-6 border-b border-theme-border flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-theme-text-primary">
                                Chỉnh sửa dịch vụ
                            </h3>
                            <button
                                onClick={() => setShowEditServiceModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const updatedData = {
                                ten_dich_vu: formData.get('ten_dich_vu'),
                                mo_ta: formData.get('mo_ta') || '',
                                loai_dich_vu: formData.get('loai_dich_vu') || ''
                            };
                            handleUpdateService(updatedData);
                        }} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Tên dịch vụ
                                    </label>
                                    <input
                                        type="text"
                                        name="ten_dich_vu"
                                        defaultValue={editingService.ten_dich_vu}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Loại dịch vụ
                                    </label>
                                    <input
                                        type="text"
                                        name="loai_dich_vu"
                                        defaultValue={editingService.loai_dich_vu || ''}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="mo_ta"
                                        defaultValue={editingService.mo_ta || ''}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditServiceModal(false)}
                                    className="px-4 py-2 border border-theme-border rounded-md hover:bg-gray-50 dark:hover:bg-theme-surface1"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal xác nhận xóa dịch vụ */}
            {showConfirmDeleteModal && serviceToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <motion.div
                        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md border border-theme-border shadow-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-theme-text-primary mb-4">
                                Xác nhận xóa
                            </h3>

                            <p className="text-theme-text-secondary mb-2">
                                Bạn có chắc chắn muốn xóa dịch vụ này khỏi lịch trình?
                            </p>

                            <div className="p-4 border border-theme-border rounded-md bg-theme-surface mb-6">
                                <p className="font-medium">{serviceToDelete.ten_dich_vu}</p>
                                {serviceToDelete.loai_dich_vu && (
                                    <p className="text-sm text-theme-text-secondary mt-1">
                                        Loại: {serviceToDelete.loai_dich_vu}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmDeleteModal(false)}
                                    className="px-4 py-2 border border-theme-border rounded-md hover:bg-gray-50 dark:hover:bg-theme-surface1"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteService}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal chỉnh sửa hoạt động */}
            {showEditActivityModal && editingActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <motion.div
                        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md border border-theme-border shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="p-6 border-b border-theme-border flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-theme-text-primary">
                                Chỉnh sửa hoạt động
                            </h3>
                            <button
                                onClick={() => setShowEditActivityModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const updatedData = {
                                ten_hoat_dong: formData.get('ten_hoat_dong'),
                                mo_ta_chi_tiet: formData.get('mo_ta_chi_tiet') || '',
                                thoi_gian_bat_dau: formData.get('thoi_gian_bat_dau') || null,
                                thoi_gian_ket_thuc: formData.get('thoi_gian_ket_thuc') || null
                            };
                            handleUpdateActivity(updatedData);
                        }} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Tên hoạt động
                                    </label>
                                    <input
                                        type="text"
                                        name="ten_hoat_dong"
                                        defaultValue={editingActivity.ten_hoat_dong}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Thời gian bắt đầu
                                    </label>
                                    <input
                                        type="time"
                                        name="thoi_gian_bat_dau"
                                        defaultValue={editingActivity.thoi_gian_bat_dau}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Thời gian kết thúc
                                    </label>
                                    <input
                                        type="time"
                                        name="thoi_gian_ket_thuc"
                                        defaultValue={editingActivity.thoi_gian_ket_thuc}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                                        Mô tả chi tiết
                                    </label>
                                    <textarea
                                        name="mo_ta_chi_tiet"
                                        defaultValue={editingActivity.mo_ta_chi_tiet || ''}
                                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-theme-surface1"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditActivityModal(false)}
                                    className="px-4 py-2 border border-theme-border rounded-md hover:bg-gray-50 dark:hover:bg-theme-surface1"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal xác nhận xóa hoạt động */}
            {showConfirmDeleteActivityModal && activityToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <motion.div
                        className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md border border-theme-border shadow-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-theme-text-primary mb-4">
                                Xác nhận xóa
                            </h3>

                            <p className="text-theme-text-secondary mb-2">
                                Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình?
                            </p>

                            <div className="p-4 border border-theme-border rounded-md bg-theme-surface mb-6">
                                <p className="font-medium">{activityToDelete.ten_hoat_dong}</p>
                                {activityToDelete.mo_ta_chi_tiet && (
                                    <p className="text-sm text-theme-text-secondary mt-1">
                                        {activityToDelete.mo_ta_chi_tiet}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmDeleteActivityModal(false)}
                                    className="px-4 py-2 border border-theme-border rounded-md hover:bg-gray-50 dark:hover:bg-theme-surface1"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteActivity}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {showEditModal && (
                <TourScheduleFormModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    schedule={schedule}
                />
            )}
        </>
    );
};

export default TourScheduleDetailsModal;