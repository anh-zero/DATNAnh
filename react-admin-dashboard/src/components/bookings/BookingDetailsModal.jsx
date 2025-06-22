import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Calendar, User, MapPin, Phone, DollarSign, Tag, CalendarDays,
    Edit, Ban, Users, Clock, Check, FileText, Plus, Trash2, Star, MessageSquare
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatter';
import {
    getBookingParticipants,
    addParticipantToBooking,
    updateBookingParticipant,
    deleteBookingParticipant,
    getBookingReview
} from '../../api/services/bookingService';
import { toast } from 'react-hot-toast';

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

// Thêm mới ParticipantForm component
const ParticipantForm = ({ participant = {}, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        ho_ten: participant.ho_ten || '',
        ngay_sinh: participant.ngay_sinh ? new Date(participant.ngay_sinh).toISOString().split('T')[0] : '',
        ghi_chu: participant.ghi_chu || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">Họ tên</label>
                <input
                    type="text"
                    name="ho_ten"
                    value={formData.ho_ten}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-theme-border rounded-md bg-theme-background"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">Ngày sinh</label>
                <input
                    type="date"
                    name="ngay_sinh"
                    value={formData.ngay_sinh}
                    onChange={handleChange}
                    className="w-full p-2 border border-theme-border rounded-md bg-theme-background"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">Ghi chú</label>
                <textarea
                    name="ghi_chu"
                    value={formData.ghi_chu}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-theme-border rounded-md bg-theme-background"
                />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-theme-border rounded-md hover:bg-theme-surface1"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary/90"
                >
                    {participant.id_nguoi_tham_gia ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );
};

const BookingDetailsModal = ({ booking, isOpen, onClose, isLoading }) => {
    // State cũ giữ nguyên...
    const [activeTab, setActiveTab] = useState('info');

    // State cho người tham gia
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [showEditParticipantModal, setShowEditParticipantModal] = useState(false);
    const [showDeleteParticipantModal, setShowDeleteParticipantModal] = useState(false);
    const [currentParticipant, setCurrentParticipant] = useState(null);

    // State cho đánh giá
    const [review, setReview] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);

    // Thêm useEffect để load dữ liệu theo tab
    useEffect(() => {
        if (!isOpen || !booking) return;

        const bookingId = booking.booking?.id_dat_tour || booking.id_dat_tour;

        if (activeTab === 'participants') {
            fetchParticipants(bookingId);
        } else if (activeTab === 'review') {
            fetchReview(bookingId);
        }
    }, [activeTab, booking, isOpen]);

    // Thêm các hàm fetch data
    const fetchParticipants = async (bookingId) => {
        if (!bookingId) return;

        setLoadingParticipants(true);
        try {
            const response = await getBookingParticipants(bookingId);
            if (response.success && response.data) {
                setParticipants(response.data);
            } else {
                setParticipants([]);
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
            toast.error("Không thể tải danh sách người tham gia");
            setParticipants([]);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const fetchReview = async (bookingId) => {
        if (!bookingId) return;

        setLoadingReview(true);
        try {
            const response = await getBookingReview(bookingId);
            if (response.success && response.data) {
                setReview(response.data);
            } else {
                setReview(null);
            }
        } catch (error) {
            console.error("Error fetching review:", error);
            toast.error("Không thể tải đánh giá");
            setReview(null);
        } finally {
            setLoadingReview(false);
        }
    };

    // Các hàm xử lý người tham gia
    const handleAddParticipant = async (data) => {
        const bookingId = booking.booking?.id_dat_tour || booking.id_dat_tour;
        if (!bookingId) return;

        try {
            const response = await addParticipantToBooking(bookingId, data);
            if (response.success) {
                toast.success("Thêm người tham gia thành công");
                setShowAddParticipantModal(false);
                fetchParticipants(bookingId);
            }
        } catch (error) {
            console.error("Error adding participant:", error);
            toast.error("Thêm người tham gia thất bại");
        }
    };

    const handleEditParticipant = (participant) => {
        setCurrentParticipant(participant);
        setShowEditParticipantModal(true);
    };

    const handleUpdateParticipant = async (data) => {
        const bookingId = booking.booking?.id_dat_tour || booking.id_dat_tour;
        if (!bookingId || !currentParticipant) return;

        try {
            const response = await updateBookingParticipant(
                bookingId,
                currentParticipant.id_nguoi_tham_gia,
                data
            );
            if (response.success) {
                toast.success("Cập nhật người tham gia thành công");
                setShowEditParticipantModal(false);
                fetchParticipants(bookingId);
            }
        } catch (error) {
            console.error("Error updating participant:", error);
            toast.error("Cập nhật người tham gia thất bại");
        }
    };

    const handleDeleteParticipantConfirm = (participant) => {
        setCurrentParticipant(participant);
        setShowDeleteParticipantModal(true);
    };

    const handleDeleteParticipant = async () => {
        const bookingId = booking.booking?.id_dat_tour || booking.id_dat_tour;
        if (!bookingId || !currentParticipant) return;

        try {
            const response = await deleteBookingParticipant(
                bookingId,
                currentParticipant.id_nguoi_tham_gia
            );
            if (response.success) {
                toast.success("Xóa người tham gia thành công");
                setShowDeleteParticipantModal(false);
                fetchParticipants(bookingId);
            }
        } catch (error) {
            console.error("Error deleting participant:", error);
            toast.error("Xóa người tham gia thất bại");
        }
    };

    if (!isOpen) return null;

    // Kiểm tra booking trước khi render và kiểm tra thêm cấu trúc booking.booking
    if (!booking) {
        console.error("Booking data is null or undefined");
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 text-center">
                    <div className="text-theme-text-primary">
                        <p className="text-red-500 mb-2">Lỗi dữ liệu</p>
                        <p>Không thể tải thông tin chi tiết đơn đặt tour.</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-theme-primary text-white rounded-md"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Xử lý trường hợp dữ liệu nằm trong booking.booking
    const bookingData = booking.booking || booking;

    // Các hàm sự kiện vẫn giữ nguyên
    const handleEdit = (e) => {
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            // Đảm bảo truyền bookingData đã được xử lý
            const editEvent = new CustomEvent('openEditBookingModal', { detail: bookingData });
            document.dispatchEvent(editEvent);
        }, 100);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        onClose();
        setTimeout(() => {
            // Đảm bảo lấy id đúng từ bookingData
            const cancelEvent = new CustomEvent('openCancelBookingModal', { detail: bookingData.id_dat_tour });
            document.dispatchEvent(cancelEvent);
        }, 100);
    };

    // Calculate tour duration sử dụng bookingData
    const startDate = bookingData.ngay_khoi_hanh ? new Date(bookingData.ngay_khoi_hanh) : null;
    const endDate = bookingData.ngay_ket_thuc ? new Date(bookingData.ngay_ket_thuc) : null;
    const durationInDays = startDate && endDate ?
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 :
        null;

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Mới':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Đã xác nhận':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Hoàn thành':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Đã hủy':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'Chờ thanh toán':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Get payment status badge class
    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'Đã thanh toán':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Thanh toán một phần':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Chờ thanh toán':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Hoàn tiền':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Đảm bảo dữ liệu được hiển thị đúng dù cấu trúc khác nhau
    const customerName = bookingData.ho_ten || bookingData.ten_khach_hang || 'Chưa có thông tin';
    const customerPhone = bookingData.so_dien_thoai || bookingData.sdt_khach_hang || 'Chưa có thông tin';
    const customerEmail = bookingData.email_khach_hang || bookingData.email_lien_he || 'Chưa có thông tin';
    const bookingPrice = typeof bookingData.tong_tien_du_kien === 'string'
        ? parseFloat(bookingData.tong_tien_du_kien)
        : (bookingData.tong_tien_du_kien || 0);
    const paidAmount = typeof bookingData.tong_tien_thanh_toan === 'string'
        ? parseFloat(bookingData.tong_tien_thanh_toan)
        : (bookingData.tong_tien_thanh_toan || 0);
    const tourName = bookingData.ten_tour || 'Tour không xác định';

    // Helper để format số tiền
    const formatPrice = (price) => {
        if (price === undefined || price === null) return '0 VNĐ';
        return formatCurrency(price) || '0 VNĐ';
    };

    // Log giá trị tổng tiền để kiểm tra
    console.log("BookingData tổng tiền:", {
        tong_tien_du_kien: bookingData.tong_tien_du_kien,
        tong_tien_du_kien_type: typeof bookingData.tong_tien_du_kien,
        tong_tien_thanh_toan: bookingData.tong_tien_thanh_toan,
        tong_tien_thanh_toan_type: typeof bookingData.tong_tien_thanh_toan,
        bookingPrice,
        paidAmount
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-theme-surface0 rounded-lg p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent mb-3"></div>
                    <p className="text-theme-text-primary">Đang tải thông tin đặt tour...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-4xl relative border border-theme-border max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
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
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                            <Calendar size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1 text-center">
                            {tourName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(bookingData.trang_thai_dat_tour)}`}>
                                {bookingData.trang_thai_dat_tour || 'Chưa có trạng thái'}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                ID: {bookingData.id_dat_tour}
                            </p>
                            {durationInDays && (
                                <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                    | {durationInDays} ngày
                                </p>
                            )}
                        </div>
                    </div>

                    {/* THÊM THANH ĐIỀU HƯỚNG TAB TẠI ĐÂY */}
                    <div className="flex space-x-1 border-b border-theme-border">
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'info'
                                ? 'text-theme-primary border-b-2 border-theme-primary'
                                : 'text-theme-text-secondary'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Thông tin chung
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'participants'
                                ? 'text-theme-primary border-b-2 border-theme-primary'
                                : 'text-theme-text-secondary'}`}
                            onClick={() => setActiveTab('participants')}
                        >
                            Người tham gia
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'review'
                                ? 'text-theme-primary border-b-2 border-theme-primary'
                                : 'text-theme-text-secondary'}`}
                            onClick={() => setActiveTab('review')}
                        >
                            Đánh giá
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto">
                    <div className="px-6 py-6">
                        {activeTab === 'info' && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin đặt tour</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                    <DetailItem label="Trạng thái đặt tour" value={bookingData.trang_thai_dat_tour} icon={Check} />
                                    <DetailItem label="Trạng thái thanh toán" value={bookingData.trang_thai_thanh_toan} icon={DollarSign} />
                                    <DetailItem label="Ngày đặt tour" value={formatDate(bookingData.ngay_dat || bookingData.ngay_dat_tour)} icon={CalendarDays} />
                                    <DetailItem label="Số lượng khách" value={bookingData.so_luong_khach || bookingData.so_luong_nguoi} icon={Users} />
                                    <DetailItem label="Tổng tiền dự kiến" value={formatPrice(bookingPrice)} icon={DollarSign} />
                                    <DetailItem label="Đã thanh toán" value={formatPrice(paidAmount)} icon={DollarSign} />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Thông tin khách hàng</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                    <DetailItem label="Họ tên" value={customerName} icon={User} />
                                    <DetailItem label="Số điện thoại" value={customerPhone} icon={Phone} />
                                    <DetailItem label="Email" value={customerEmail} icon={MapPin} />
                                    {bookingData.dia_chi_kh && <DetailItem label="Địa chỉ" value={bookingData.dia_chi_kh} icon={MapPin} />}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Thông tin lịch trình tour</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                    <DetailItem label="Tên tour" value={tourName} icon={Tag} />
                                    <DetailItem label="Mã lịch trình" value={bookingData.id_lich_trinh_tour} icon={Tag} />
                                    <DetailItem label="Ngày khởi hành" value={formatDate(bookingData.ngay_khoi_hanh)} icon={CalendarDays} />
                                    <DetailItem label="Ngày kết thúc" value={formatDate(bookingData.ngay_ket_thuc)} icon={CalendarDays} />
                                    {durationInDays &&
                                        <DetailItem label="Thời gian tour" value={`${durationInDays} ngày`} icon={Clock} />
                                    }
                                    {bookingData.gia_lich_trinh &&
                                        <DetailItem label="Giá tour" value={formatPrice(bookingData.gia_lich_trinh)} icon={DollarSign} />
                                    }
                                </div>

                                {/* Ghi chú */}
                                {(bookingData.ghi_chu_dat_tour || bookingData.ghi_chu) && (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Ghi chú</h3>
                                        <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary">
                                            <p className="whitespace-pre-line">{bookingData.ghi_chu_dat_tour || bookingData.ghi_chu}</p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'participants' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary">
                                        Danh sách người tham gia ({participants.length})
                                    </h3>
                                    <button
                                        onClick={() => setShowAddParticipantModal(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-theme-primary text-white rounded-md text-sm"
                                    >
                                        <Plus size={16} />
                                        Thêm người tham gia
                                    </button>
                                </div>

                                {loadingParticipants ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                                        <p className="mt-2 text-theme-text-secondary">Đang tải danh sách người tham gia...</p>
                                    </div>
                                ) : participants.length > 0 ? (
                                    <div className="border border-theme-border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-theme-surface1">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-theme-border">
                                                {participants.map((participant, index) => (
                                                    <tr key={participant.id_nguoi_tham_gia}>
                                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                        <td className="px-4 py-3 text-sm">{participant.ho_ten}</td>
                                                        <td className="px-4 py-3 text-sm">{formatDate(participant.ngay_sinh)}</td>
                                                        <td className="px-4 py-3 text-sm">{participant.ghi_chu || '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleEditParticipant(participant)}
                                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteParticipantConfirm(participant)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-theme-border rounded-md">
                                        <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                                        <p className="mt-2 text-theme-text-secondary">Chưa có người tham gia nào được thêm</p>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'review' && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">
                                    Đánh giá từ khách hàng
                                </h3>

                                {loadingReview ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                                        <p className="mt-2 text-theme-text-secondary">Đang tải đánh giá...</p>
                                    </div>
                                ) : review ? (
                                    <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md">
                                        <div className="flex items-center mb-3">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={20} fill={i < review.diem_danh_gia ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                            <span className="ml-2 font-medium">{review.diem_danh_gia}/5</span>
                                        </div>

                                        <p className="text-gray-700 dark:text-theme-text-primary mb-4">{review.binh_luan}</p>

                                        <div className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                            Đánh giá vào ngày {formatDate(review.ngay_danh_gia)}
                                        </div>

                                        {review.phan_hoi_quan_tri && (
                                            <div className="mt-4 pl-4 border-l-2 border-theme-primary">
                                                <h4 className="font-medium text-theme-primary mb-1">Phản hồi từ quản trị viên:</h4>
                                                <p className="text-gray-700 dark:text-theme-text-primary">{review.phan_hoi_quan_tri}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-theme-border rounded-md">
                                        <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                                        <p className="mt-2 text-theme-text-secondary">Khách hàng chưa có đánh giá nào</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                    <div className="text-right">
                        {bookingData.trang_thai_dat_tour !== 'Đã hủy' && (
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2.5 mr-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 dark:focus:ring-offset-theme-surface0"
                            >
                                <Ban size={16} className="inline-block mr-2" />
                                Hủy đơn
                            </button>
                        )}
                        <button
                            onClick={handleEdit}
                            className="px-6 py-2.5 mr-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-theme-surface0"
                        >
                            <Edit size={16} className="inline-block mr-2" />
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-theme-primary text-white rounded-md hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Modal thêm người tham gia */}
            {showAddParticipantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md p-6 border border-theme-border relative">
                        <h3 className="text-lg font-medium mb-4 pr-8">Thêm người tham gia</h3>
                        <button
                            onClick={() => setShowAddParticipantModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <ParticipantForm
                            onSubmit={handleAddParticipant}
                            onCancel={() => setShowAddParticipantModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal sửa người tham gia */}
            {showEditParticipantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md p-6 border border-theme-border relative">
                        <h3 className="text-lg font-medium mb-4 pr-8">Sửa người tham gia</h3>
                        <button
                            onClick={() => setShowEditParticipantModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <ParticipantForm
                            participant={currentParticipant}
                            onSubmit={handleUpdateParticipant}
                            onCancel={() => setShowEditParticipantModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa người tham gia */}
            {showDeleteParticipantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-md p-6 border border-theme-border">
                        <h3 className="text-lg font-medium mb-3">Xác nhận xóa</h3>
                        <p className="mb-6 text-theme-text-secondary">
                            Bạn có chắc chắn muốn xóa người tham gia <span className="font-medium">{currentParticipant?.ho_ten}</span> khỏi danh sách?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteParticipantModal(false)}
                                className="px-4 py-2 border border-theme-border rounded-md hover:bg-theme-surface1"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteParticipant}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailsModal;