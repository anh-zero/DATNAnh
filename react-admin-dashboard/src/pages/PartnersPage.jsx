import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import PartnersTable from "../components/partners/PartnersTable";


const userStats = {
	totalUsers: 50,
	newUsersToday: 12,
	activeUsers: 47,
	churnRate: "2.4%",
};

const PartnersPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Đối tác' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Tổng số đối tác'
						icon={UsersIcon}
						value={userStats.totalUsers.toLocaleString()}
						color='#6366F1'
					/>
					<StatCard name='Đối tác mới trong tháng' icon={UserPlus} value={userStats.newUsersToday} color='#10B981' />
					<StatCard
						name='Đối tác đang hoạt động'
						icon={UserCheck}
						value={userStats.activeUsers.toLocaleString()}
						color='#F59E0B'
					/>
					<StatCard name='Tỷ lệ hủy bỏ liên kết' icon={UserX} value={userStats.churnRate} color='#EF4444' />
				</motion.div>

				<PartnersTable />

				{/* USER CHARTS */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
					{/* <UserGrowthChart />
					<UserActivityHeatmap />
					<UserDemographicsChart /> */}
				</div>
			</main>
		</div>
	);
};
export default PartnersPage;
