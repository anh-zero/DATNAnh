import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";

const orderData = [
	{ id: "BK001", customer: "Tuấn Điềm", total: 333235.4, status: "Đã thanh toán", date: "2023-07-01" },
	{ id: "BK002", customer: "Ronaldo", total: 111412.0, status: "Đang xử lý", date: "2023-07-02" },
	{ id: "BK003", customer: "Ronaldo", total: 2311162.5, status: "Chưa thanh toán", date: "2023-07-03" },
	{ id: "BK004", customer: "Tuấn Dũng", total: 1114750.2, status: "Đang chờ xử lý", date: "2023-07-04" },
	{ id: "BK005", customer: "Ngọc Linh", total: 2335495.8, status: "Đã thanh toán", date: "2023-07-05" },
	{ id: "BK006", customer: "Messi", total: 333310.75, status: "Đang xử lý", date: "2023-07-06" },
	{ id: "BK007", customer: "Tuấn Điềm", total: 432528.9, status: "Chưa thanh toán", date: "2023-07-07" },
	{ id: "BK008", customer: "Messi", total: 234189.6, status: "Đã thanh toán", date: "2023-07-08" },
];

const OrdersTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredOrders, setFilteredOrders] = useState(orderData);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = orderData.filter(
			(order) => order.id.toLowerCase().includes(term) || order.customer.toLowerCase().includes(term)
		);
		setFilteredOrders(filtered);
	};

	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách booking</h2>
				<div className='relative'>
					<input
						type='text'
						placeholder='Tìm kiếm booking...'
						className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className='absolute left-3 top-2.5 text-theme-text-secondary' size={18} />
				</div>
			</div>
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-theme-border'>
					<thead>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Booking ID
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Khách hàng
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Thành tiền
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Trạng thái
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Ngày booking
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Hành động
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-theme-border'>
						{filteredOrders.map((order) => (
							<motion.tr
								key={order.id}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>
									{order.id}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>
									{order.customer}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{order.total.toLocaleString()}₫</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "Đã thanh toán"
												? "bg-green-100 text-green-800"
												: order.status === "Đang xử lý"
													? "bg-yellow-100 text-yellow-800"
													: order.status === "Chưa thanh toán"
														? "bg-blue-100 text-blue-800"
														: "bg-red-100 text-red-800"
											}`}
									>
										{order.status}
									</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{order.date}</td>

								<td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
									<button className='text-theme-primary hover:text-theme-primary-hover mr-2'>Sửa</button>
									<button className='text-red-500 hover:text-red-400'>Xóa</button>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};
export default OrdersTable;
