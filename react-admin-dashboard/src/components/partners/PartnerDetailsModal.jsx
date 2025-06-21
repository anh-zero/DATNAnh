import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Edit, Building, MapPin, Phone, Mail,
    CalendarDays, Clock, FileText, DollarSign,
    Package, Bookmark, Users
} from 'lucide-react';
import { formatDate, formatCurrency } from "../../utils/formatter";
import { getPartnerServices } from '../../api/services/partnerService';

// Component hiển thị từng mục thông tin chi tiết
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

const PartnerDetailsModal = ({ partner, onClose, onEdit }) => {
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('info');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (partner?.id_doi_tac && activeTab === 'services') {
            fetchPartnerServices();
        }
    }, [partner?.id_doi_tac, activeTab]);

    const fetchPartnerServices = async () => {
        if (!partner?.id_doi_tac) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await getPartnerServices(partner.id_doi_tac);
            console.log('Partner services response:', response);
            if (response && response.success) {
                setServices(response.data || []);
            } else {
                setError('Không thể tải danh sách dịch vụ cung cấp.');
            }
        } catch (error) {
            console.error('Error fetching partner services:', error);
            setError('Đã xảy ra lỗi khi tải danh sách dịch vụ cung cấp.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!partner) {
        return null;
    }

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
                        {/* Icon đối tác */}
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                            <Building size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-theme-text-primary mb-1 text-center">
                            {partner.ten_doi_tac || 'Đối tác không có tên'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                            <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                ID: {partner.id_doi_tac}
                            </p>
                            {/* Mã số thuế */}
                            {partner.ma_so_thue && (
                                <p className="text-sm text-gray-500 dark:text-theme-text-tertiary">
                                    MST: {partner.ma_so_thue}
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
                            onClick={() => setActiveTab('info')}
                        >
                            Thông tin
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm focus:outline-none
                            ${activeTab === 'services'
                                    ? 'border-b-2 border-theme-primary text-theme-primary'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('services')}
                        >
                            Dịch vụ cung cấp
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="px-6 py-6 overflow-auto">
                    {activeTab === 'info' && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Thông tin đối tác</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                <DetailItem
                                    label="Tên đối tác"
                                    value={partner.ten_doi_tac}
                                    icon={Building}
                                />
                                <DetailItem
                                    label="Mã số thuế"
                                    value={partner.ma_so_thue}
                                    icon={FileText}
                                />
                                <DetailItem
                                    label="Email"
                                    value={partner.email}
                                    icon={Mail}
                                />
                                <DetailItem
                                    label="Số điện thoại"
                                    value={partner.so_dien_thoai}
                                    icon={Phone}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border mt-4">
                                <DetailItem
                                    label="Địa chỉ"
                                    value={partner.dia_chi}
                                    icon={MapPin}
                                    fullWidth
                                />
                                <DetailItem
                                    label="Địa điểm đối tác"
                                    value={partner.ten_dia_diem_doi_tac}
                                    icon={MapPin}
                                    fullWidth
                                />
                            </div>

                            {partner.mo_ta_chi_tiet_doi_tac && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Mô tả chi tiết</h3>
                                    <div className="bg-gray-50 dark:bg-theme-surface1 p-4 rounded-md text-gray-700 dark:text-theme-text-primary text-sm">
                                        {partner.mo_ta_chi_tiet_doi_tac}
                                    </div>
                                </>
                            )}

                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mt-6 mb-4">Thông tin hệ thống</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-200 dark:divide-theme-border">
                                <DetailItem
                                    label="Ngày tạo"
                                    value={formatDate(partner.ngay_tao, true)}
                                    icon={CalendarDays}
                                />
                                <DetailItem
                                    label="Cập nhật lần cuối"
                                    value={formatDate(partner.ngay_cap_nhat, true)}
                                    icon={Clock}
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'services' && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-theme-text-primary mb-4">Dịch vụ cung cấp</h3>
                            {isLoading ? (
                                <div className="text-center py-10">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-primary border-t-transparent"></div>
                                    <p className="mt-3 text-theme-text-secondary">Đang tải dữ liệu...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-10 text-red-500">
                                    <p>{error}</p>
                                </div>
                            ) : services.length === 0 ? (
                                <div className="text-center py-10 text-theme-text-secondary">
                                    <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Đối tác này chưa cung cấp dịch vụ nào.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {services.map(service => (
                                        <div key={service.id_dich_vu_tour} className="border border-theme-border rounded-md p-4 hover:bg-theme-surface transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Bookmark size={18} className="text-theme-primary mr-2" />
                                                    <h4 className="font-medium text-theme-text-primary">{service.ten_dich_vu}</h4>
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs">
                                                    {service.loai_dich_vu || 'Không phân loại'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center">
                                                    <DollarSign size={14} className="text-theme-text-secondary mr-1" />
                                                    <span className="text-theme-text-secondary">Giá nhập: </span>
                                                    <span className="font-medium text-theme-text-primary ml-1">
                                                        {service.gia_nhap ? formatCurrency(service.gia_nhap) : 'Không có thông tin'}
                                                    </span>
                                                </div>

                                                {service.so_luong && (
                                                    <div className="flex items-center">
                                                        <Package size={14} className="text-theme-text-secondary mr-1" />
                                                        <span className="text-theme-text-secondary">Số lượng: </span>
                                                        <span className="font-medium text-theme-text-primary ml-1">
                                                            {service.so_luong} {service.don_vi_tinh || ''}
                                                        </span>
                                                    </div>
                                                )}

                                                {(service.thoi_gian_bat_dau || service.thoi_gian_ket_thuc) && (
                                                    <div className="flex items-center">
                                                        <Clock size={14} className="text-theme-text-secondary mr-1" />
                                                        <span className="text-theme-text-secondary">Thời gian: </span>
                                                        <span className="font-medium text-theme-text-primary ml-1">
                                                            {service.thoi_gian_bat_dau ? formatDate(service.thoi_gian_bat_dau) : ''}
                                                            {service.thoi_gian_bat_dau && service.thoi_gian_ket_thuc && ' - '}
                                                            {service.thoi_gian_ket_thuc ? formatDate(service.thoi_gian_ket_thuc) : ''}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center">
                                                    <CalendarDays size={14} className="text-theme-text-secondary mr-1" />
                                                    <span className="text-theme-text-secondary">Ngày tạo: </span>
                                                    <span className="font-medium text-theme-text-primary ml-1">
                                                        {formatDate(service.ngay_tao)}
                                                    </span>
                                                </div>
                                            </div>

                                            {service.ghi_chu && (
                                                <div className="mt-3 text-sm">
                                                    <p className="text-theme-text-secondary">Ghi chú:</p>
                                                    <p className="text-theme-text-primary mt-1 whitespace-pre-line">
                                                        {service.ghi_chu}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-3 text-xs text-theme-text-tertiary">
                                                Tour: <span className="font-medium">{service.ten_tour || 'Không có thông tin'}</span>
                                                {service.ngay_khoi_hanh && (
                                                    <span> (Khởi hành: {formatDate(service.ngay_khoi_hanh)})</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                    <div className="text-right">
                        {activeTab === 'info' && onEdit && (
                            <button
                                onClick={() => onEdit(partner)}
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

export default PartnerDetailsModal;