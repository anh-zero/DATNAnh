import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getAllLocations } from '../../api/services/locationService';

const PartnerFormModal = ({ partner = null, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        ten_doi_tac: '',
        dia_chi: '',
        id_dia_diem: '',
        so_dien_thoai: '',
        email: '',
        mo_ta_chi_tiet_doi_tac: '',
        ma_so_thue: ''
    });

    const [locations, setLocations] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch locations for dropdown
        const fetchLocations = async () => {
            try {
                const response = await getAllLocations({ limit: 100 });
                setLocations(response.locations || []);
            } catch (err) {
                console.error("Error fetching locations:", err);
                setError("Không thể tải danh sách địa điểm");
            }
        };

        fetchLocations();

        // Populate form with partner data if editing
        if (partner) {
            setFormData({
                ten_doi_tac: partner.ten_doi_tac || '',
                dia_chi: partner.dia_chi || '',
                id_dia_diem: partner.id_dia_diem || '',
                so_dien_thoai: partner.so_dien_thoai || '',
                email: partner.email || '',
                mo_ta_chi_tiet_doi_tac: partner.mo_ta_chi_tiet_doi_tac || '',
                ma_so_thue: partner.ma_so_thue || ''
            });
        }
    }, [partner]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ten_doi_tac || formData.ten_doi_tac.trim().length < 2) {
            newErrors.ten_doi_tac = 'Tên đối tác phải có ít nhất 2 ký tự.';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }

        if (formData.so_dien_thoai && !/^[0-9]{10,11}$/.test(formData.so_dien_thoai.replace(/\s/g, ''))) {
            newErrors.so_dien_thoai = 'Số điện thoại phải có 10-11 chữ số.';
        }

        if (formData.ma_so_thue && !/^[0-9]{10,13}$/.test(formData.ma_so_thue.replace(/\s/g, ''))) {
            newErrors.ma_so_thue = 'Mã số thuế phải có 10-13 chữ số.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setError('');

            try {
                // Convert id_dia_diem to number if provided
                const submissionData = {
                    ...formData,
                    id_dia_diem: formData.id_dia_diem ? parseInt(formData.id_dia_diem) : null
                };

                await onSubmit(submissionData);
            } catch (err) {
                console.error("Error in form submission:", err);
                setError(err.message || 'Đã có lỗi xảy ra khi lưu thông tin đối tác.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg w-full max-w-lg relative border border-theme-border shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Header màu xám */}
                <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme-border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-theme-text-primary">
                        {partner && partner.id_doi_tac ? 'Chỉnh sửa Đối tác' : 'Thêm Đối tác mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                            <p><strong>Lỗi:</strong> {error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ten_doi_tac">
                                Tên đối tác <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ten_doi_tac"
                                id="ten_doi_tac"
                                value={formData.ten_doi_tac}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                            {errors.ten_doi_tac && <p className="text-red-500 text-xs mt-1">{errors.ten_doi_tac}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="so_dien_thoai">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                name="so_dien_thoai"
                                id="so_dien_thoai"
                                value={formData.so_dien_thoai}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                            {errors.so_dien_thoai && <p className="text-red-500 text-xs mt-1">{errors.so_dien_thoai}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ma_so_thue">
                                Mã số thuế
                            </label>
                            <input
                                type="text"
                                name="ma_so_thue"
                                id="ma_so_thue"
                                value={formData.ma_so_thue}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                            {errors.ma_so_thue && <p className="text-red-500 text-xs mt-1">{errors.ma_so_thue}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="dia_chi">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="dia_chi"
                                id="dia_chi"
                                value={formData.dia_chi}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="id_dia_diem">
                                Địa điểm liên kết
                            </label>
                            <select
                                name="id_dia_diem"
                                id="id_dia_diem"
                                value={formData.id_dia_diem}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            >
                                <option value="">-- Chọn địa điểm --</option>
                                {locations.map(location => (
                                    <option key={location.id_dia_diem} value={location.id_dia_diem}>
                                        {location.ten_dia_diem}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="mo_ta_chi_tiet_doi_tac">
                                Mô tả chi tiết
                            </label>
                            <textarea
                                name="mo_ta_chi_tiet_doi_tac"
                                id="mo_ta_chi_tiet_doi_tac"
                                value={formData.mo_ta_chi_tiet_doi_tac || ''}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer màu xám */}
                <div className="sticky bottom-0 z-10 bg-theme-surface border-t border-theme-border p-6">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm bg-white dark:bg-theme-surface text-theme-text-primary hover:bg-gray-50 dark:hover:bg-theme-surface0 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm bg-theme-primary text-white hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-theme-surface0 flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>{partner && partner.id_doi_tac ? 'Cập nhật' : 'Thêm mới'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PartnerFormModal;