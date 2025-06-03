import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserGrowthChart from "../components/users/UserGrowthChart";
import UserActivityHeatmap from "../components/users/UserActivityHeatmap";
import UserDemographicsChart from "../components/users/UserDemographicsChart";

const userStats = {
	totalUsers: 1300,
	newUsersToday: 3,
	activeUsers: 12,
	churnRate: "2.4%",
};

const UsersPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Người dùng' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Tổng số người dùng'
						icon={UsersIcon}
						value={userStats.totalUsers.toLocaleString()}
						color='#4299E1' // Xanh dương
					/>
					<StatCard
						name='Người dùng mới hôm nay'
						icon={UserPlus}
						value={userStats.newUsersToday}
						color='#50E3C2' // Xanh ngọc
					/>
					<StatCard
						name='Người dùng đang hoạt động'
						icon={UserCheck}
						value={userStats.activeUsers.toLocaleString()}
						color='#F59E0B' // Cam nhạt
					/>
					<StatCard
						name='Tỷ lệ bỏ dùng'
						icon={UserX}
						value={userStats.churnRate}
						color='#EF4444' // Đỏ nhạt
					/>
				</motion.div>

				<UsersTable />

				{/* USER CHARTS */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
					<UserGrowthChart />
					<UserActivityHeatmap />
					<UserDemographicsChart />
				</div>
			</main>
		</div>
	);
};
export default UsersPage;
