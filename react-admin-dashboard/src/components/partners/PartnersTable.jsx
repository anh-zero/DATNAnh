import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const userData = [
	{
		id: 1,
		name: "Nhà hàng ABC",
		email: "contact@abc.com",
		role: "Trần Tuấn Anh",
		status: "Hoạt động",
		phone: "0123456789",
		service: "Nhà hàng",
		startDate: "01/01/2023",
	},
	{
		id: 2,
		name: "Khách sạn cao cấp XYZ",
		email: "info@xyz.com",
		role: "Vũ Mạnh Hòa",
		status: "Ngừng hoạt động",
		phone: "0987654321",
		service: "Khách sạn",
		startDate: "15/03/2022",
	},
	{
		id: 3,
		name: "Hãng hàng không DEF",
		email: "support@def.com",
		role: "Nguyễn Mai Chi",
		status: "Hoạt động",
		phone: "0912345678",
		service: "Máy bay",
		startDate: "10/10/2021",
	}
];

const PartnersTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredUsers, setFilteredUsers] = useState(userData);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = userData.filter(
			(user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
		);
		setFilteredUsers(filtered);
	};

	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-theme-text-primary'>Đối tác</h2>
				<div className='relative'>
					<input
						type='text'
						placeholder='Tìm kiếm đối tác...'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className='absolute left-3 top-2.5 text-theme-text-secondary' size={18} />
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Tên đối tác
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Loại đối tác
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Người liên hệ
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Email
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Số điện thoại
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Trạng thái
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Ngày bắt đầu hợp tác
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
								Hành động
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-700'>
						{filteredUsers.map((user) => (
							<motion.tr
								key={user.id}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='flex-shrink-0 h-10 w-10'>
											<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
												{user.name.charAt(0)}
											</div>
										</div>
										<div className='ml-4'>
											<div className='text-sm font-medium text-theme-text-primary'>{user.name}</div>
										</div>
									</div>
								</td>

								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-theme-text-secondary'>{user.service}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span className='text-sm text-theme-text-secondary'>{user.role}</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-theme-text-secondary'>{user.email}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-theme-text-secondary'>{user.phone}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "Hoạt động"
											? "bg-green-800 text-green-100"
											: "bg-red-800 text-red-100"
											}`}
									>
										{user.status}
									</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-theme-text-secondary'>{user.startDate}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
									<button className='text-indigo-400 hover:text-indigo-300 mr-2'>Sửa</button>
									<button className='text-red-400 hover:text-red-300'>Xóa</button>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};
export default PartnersTable;
