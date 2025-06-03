import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react'; // Thêm icon Search

const PartnerSelectionModal = ({ isOpen, onClose, onSave, product, partnersList }) => {
    const [selectedPartners, setSelectedPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa tìm kiếm

    // Cập nhật state nội bộ khi product hoặc isOpen thay đổi
    useEffect(() => {
        if (isOpen && product) {
            setSelectedPartners(product.selectedPartners || []);
            setSearchTerm(""); // Reset tìm kiếm khi mở modal
        } else {
            // Reset khi modal đóng hoặc không có product
            setSelectedPartners([]);
            setSearchTerm("");
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleCheckboxChange = (partnerValue) => {
        setSelectedPartners(prevSelected =>
            prevSelected.includes(partnerValue)
                ? prevSelected.filter(p => p !== partnerValue) // Bỏ chọn
                : [...prevSelected, partnerValue] // Chọn thêm
        );
    };

    const handleSave = () => {
        onSave(product.id, selectedPartners);
        onClose(); // Đóng modal sau khi lưu
    };

    // Lọc danh sách đối tác dựa trên searchTerm
    const filteredPartners = partnersList.filter(partner =>
        partner.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-theme-surface rounded-lg shadow-xl p-6 w-full max-w-md border border-theme-border relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-theme-text-secondary hover:text-theme-primary"
                    aria-label="Đóng modal"
                >
                    <X size={20} />
                </button>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4 pr-8">
                    Chọn đối tác cho: <span className="text-theme-primary">{product.name}</span>
                </h3>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đối tác..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" size={18} />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-2">
                    {filteredPartners.length > 0 ? (
                        filteredPartners.map(partner => (
                            <label key={partner.value} className="flex items-center space-x-3 text-theme-text-secondary hover:bg-theme-background p-2 rounded cursor-pointer transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-theme-primary bg-theme-surface border-theme-border rounded focus:ring-theme-primary focus:ring-offset-theme-surface cursor-pointer"
                                    value={partner.value}
                                    checked={selectedPartners.includes(partner.value)}
                                    onChange={() => handleCheckboxChange(partner.value)}
                                />
                                <span>{partner.label}</span>
                            </label>
                        ))
                    ) : (
                        <p className="text-theme-text-secondary text-center py-4">Không tìm thấy đối tác nào.</p>
                    )}
                </div>
                <div className="flex justify-end space-x-3 border-t border-theme-border pt-4 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-theme-surface border border-theme-border text-theme-text-secondary rounded-md text-sm transition-colors duration-150 hover:bg-theme-background"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-md text-sm transition-colors duration-150"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnerSelectionModal;