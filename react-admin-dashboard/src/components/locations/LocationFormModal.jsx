import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const LocationFormModal = ({ location = null, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        ten_dia_diem: '',
        mo_ta: '',
        dia_chi: '',
        thanh_pho: '',
        quoc_gia: 'Việt Nam',
        loai_dia_diem: 'Điểm tham quan',
        kinh_do: '',
        vi_do: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Populate form with location data if editing
        if (location) {
            setFormData({
                ten_dia_diem: location.ten_dia_diem || '',
                mo_ta: location.mo_ta || '',
                dia_chi: location.dia_chi || '',
                thanh_pho: location.thanh_pho || '',
                quoc_gia: location.quoc_gia || 'Việt Nam',
                loai_dia_diem: location.loai_dia_diem || 'Điểm tham quan',
                kinh_do: location.kinh_do || '',
                vi_do: location.vi_do || ''
            });
        }
    }, [location]);

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

        if (!formData.ten_dia_diem || formData.ten_dia_diem.trim().length < 2) {
            newErrors.ten_dia_diem = 'Tên địa điểm phải có ít nhất 2 ký tự.';
        }

        if (formData.kinh_do && isNaN(parseFloat(formData.kinh_do))) {
            newErrors.kinh_do = 'Kinh độ phải là số.';
        }

        if (formData.vi_do && isNaN(parseFloat(formData.vi_do))) {
            newErrors.vi_do = 'Vĩ độ phải là số.';
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
                // Convert lat/long to numbers if provided
                const submissionData = {
                    ...formData,
                    kinh_do: formData.kinh_do ? parseFloat(formData.kinh_do) : null,
                    vi_do: formData.vi_do ? parseFloat(formData.vi_do) : null
                };

                await onSubmit(submissionData);
            } catch (err) {
                console.error("Error in form submission:", err);
                setError(err.message || 'Đã có lỗi xảy ra khi lưu thông tin địa điểm.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const locationTypes = ['Điểm tham quan', 'Thành phố', 'Khách sạn', 'Nhà hàng', 'Sân bay', 'Khác'];

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
                        {location && location.id_dia_diem ? 'Chỉnh sửa Địa điểm' : 'Thêm Địa điểm mới'}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="ten_dia_diem">
                                Tên địa điểm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ten_dia_diem"
                                id="ten_dia_diem"
                                value={formData.ten_dia_diem}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            />
                            {errors.ten_dia_diem && <p className="text-red-500 text-xs mt-1">{errors.ten_dia_diem}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="loai_dia_diem">
                                Loại địa điểm <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="loai_dia_diem"
                                id="loai_dia_diem"
                                value={formData.loai_dia_diem}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                            >
                                {locationTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="thanh_pho">
                                    Thành phố
                                </label>
                                <input
                                    type="text"
                                    name="thanh_pho"
                                    id="thanh_pho"
                                    value={formData.thanh_pho}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="quoc_gia">
                                    Quốc gia
                                </label>
                                <input
                                    type="text"
                                    name="quoc_gia"
                                    id="quoc_gia"
                                    value={formData.quoc_gia}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="kinh_do">
                                    Kinh độ
                                </label>
                                <input
                                    type="text"
                                    name="kinh_do"
                                    id="kinh_do"
                                    value={formData.kinh_do}
                                    onChange={handleInputChange}
                                    placeholder="VD: 105.842100"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                                {errors.kinh_do && <p className="text-red-500 text-xs mt-1">{errors.kinh_do}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="vi_do">
                                    Vĩ độ
                                </label>
                                <input
                                    type="text"
                                    name="vi_do"
                                    id="vi_do"
                                    value={formData.vi_do}
                                    onChange={handleInputChange}
                                    placeholder="VD: 20.985400"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-white dark:bg-theme-surface text-theme-text-primary"
                                />
                                {errors.vi_do && <p className="text-red-500 text-xs mt-1">{errors.vi_do}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-theme-text-secondary mb-1" htmlFor="mo_ta">
                                Mô tả
                            </label>
                            <textarea
                                name="mo_ta"
                                id="mo_ta"
                                value={formData.mo_ta || ''}
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
                                <span>{location && location.id_dia_diem ? 'Cập nhật' : 'Thêm mới'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LocationFormModal;