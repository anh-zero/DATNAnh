// filepath: c:\Users\kaito\Desktop\ADMIN\react-admin-dashboard\src\components\products\ProductsTable.jsx
import { motion } from "framer-motion";
import { Edit, Handshake, Search, Trash2, Users } from "lucide-react"; // Thêm Users icon
import { useState } from "react";
import PartnerSelectionModal from "./PartnerSelectionModal"; // Import modal

// ... PARTNERS_LIST và PRODUCT_DATA giữ nguyên ...
const PARTNERS_LIST = [
    { value: "partner1", label: "Nhà hàng ABC" },
    { value: "partner2", label: "Khách sạn cao cấp XYZ" },
    { value: "partner3", label: "Hãng hàng không DEF" },
];

const PRODUCT_DATA = [
    {
        id: 1,
        name: "Du Lịch Hà Nội - Vịnh Hạ Long",
        category: "Hà Nội - Hạ Long...",
        address: "Thành phố Hạ Long",
        day: 4,
        price: 9939000,
        maxGroupSize: 8,
        status: "Đã thanh toán",
        selectedPartners: ["partner1"],
    },
    {
        id: 2,
        name: "Du Lịch Nghỉ Dưỡng...",
        category: "Hồ Tràm - Vũng...",
        address: "Minera Hot Springs...",
        day: 3,
        price: 6499000,
        maxGroupSize: 15,
        status: "Đã thanh toán",
        selectedPartners: ["partner2", "partner3"],
    },
    {
        id: 3,
        name: "Du Lịch Côn Đảo...",
        category: "Côn Đảo",
        address: "Côn Đảo",
        day: 2,
        price: 5700000,
        maxGroupSize: 15,
        status: "Đã thanh toán",
        selectedPartners: [],
    },
    {
        id: 4,
        name: "Du Lịch Đà Nẵng...",
        category: "Huế - Hội An -...",
        address: "Đà Nẵng - Hội An...",
        day: 4,
        price: 8000000,
        maxGroupSize: 18,
        status: "Đã thanh toán",
        selectedPartners: ["partner1", "partner4"],
    },
];


const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState(PRODUCT_DATA);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [isModalOpen, setIsModalOpen] = useState(false); // State cho modal
    const [editingProduct, setEditingProduct] = useState(null); // State cho sản phẩm đang sửa

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(
            (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
    };

    // Mở modal và đặt sản phẩm cần chỉnh sửa
    const openPartnerModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    // Đóng modal
    const closePartnerModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    // Hàm xử lý lưu đối tác từ modal
    const handleSavePartners = (productId, newSelectedPartners) => {
        // Cập nhật state gốc 'products'
        const updatedProducts = products.map(product =>
            product.id === productId ? { ...product, selectedPartners: newSelectedPartners } : product
        );
        setProducts(updatedProducts);

        // Cập nhật lại 'filteredProducts' dựa trên state 'products' đã cập nhật và searchTerm hiện tại
        const term = searchTerm.toLowerCase();
        const newlyFiltered = updatedProducts.filter(
            (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
        );
        setFilteredProducts(newlyFiltered);
        // Đóng modal đã được thực hiện trong component Modal
    };

    // Hàm hiển thị tóm tắt đối tác
    const renderPartnerSummary = (selectedPartners) => {
        if (!selectedPartners || selectedPartners.length === 0) {
            return <span className="text-gray-500">Chưa chọn</span>;
        }
        const partnerLabels = selectedPartners
            .map(pValue => PARTNERS_LIST.find(p => p.value === pValue)?.label)
            .filter(Boolean); // Lọc bỏ các giá trị không tìm thấy (phòng trường hợp dữ liệu không nhất quán)

        if (partnerLabels.length <= 2) {
            return partnerLabels.join(', ');
        } else {
            return `${partnerLabels.slice(0, 1).join(', ')} + ${partnerLabels.length - 1} khác`;
        }
    };


    return (
        <> {/* Sử dụng Fragment để bao bọc */}
            <motion.div
                className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border mb-8'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* ... Phần search và tiêu đề ... */}
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách tour</h2>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Tìm kiếm tour...'
                            className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary'
                            onChange={handleSearch}
                            value={searchTerm}
                        />
                        <Search className='absolute left-3 top-2.5 text-theme-text-secondary' size={18} />
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-theme-border'>
                        <thead>
                            <tr>
                                {/* ... các th khác ... */}
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Avatar
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Tên tour
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Địa điểm
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Địa chỉ
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Số ngày
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Giá
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Số chỗ tối đa
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Đối tác {/* Giữ nguyên tiêu đề cột */}
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Trạng thái
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-primary uppercase tracking-wider bg-theme-surface'>
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-theme-border'>
                            {filteredProducts.map((product) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className='hover:bg-theme-background'
                                >
                                    {/* ... các td khác ... */}
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>
                                        <img
                                            src='https://via.placeholder.com/50'
                                            alt='Avatar'
                                            className='w-10 h-10 rounded-full'
                                        />
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.name}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.category}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.address}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.day}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.price.toLocaleString()}₫</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{product.maxGroupSize}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary text-center'> {/* Căn giữa icon nếu muốn */}
                                        {/* Chỉ hiển thị nút icon */}
                                        <button
                                            onClick={() => openPartnerModal(product)}
                                            className='text-theme-primary hover:text-theme-primary-hover p-1 rounded hover:bg-theme-surface inline-flex items-center justify-center'
                                            title={product.selectedPartners && product.selectedPartners.length > 0
                                                ? product.selectedPartners.map(p => PARTNERS_LIST.find(pl => pl.value === p)?.label).filter(Boolean).join(', ')
                                                : "Chưa có đối tác - Chỉnh sửa"}
                                        >
                                            <Handshake size={18} />
                                        </button>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${product.status === "Đã thanh toán" ? "text-green-500" : "text-red-500"}`}>
                                        {product.status}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                                        <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                            <Edit size={18} />
                                        </button>
                                        <button className='text-red-400 hover:text-red-300'>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Render Modal */}
            <PartnerSelectionModal
                isOpen={isModalOpen}
                onClose={closePartnerModal}
                onSave={handleSavePartners}
                product={editingProduct}
                partnersList={PARTNERS_LIST}
            />
        </>
    );
};
export default ProductsTable;
