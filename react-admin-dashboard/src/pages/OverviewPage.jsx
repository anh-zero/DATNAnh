import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";

const OverviewPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Tổng quan' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Tổng doanh số' icon={Zap} value='12,345,000₫' color='#4299E1' />
					<StatCard name='Người dùng mới' icon={Users} value='1,234' color='#10B981' />
					<StatCard name='Tổng tour' icon={ShoppingBag} value='567' color='#50E3C2' />
					<StatCard name='Tỷ lệ chuyển đổi' icon={BarChart2} value='12.5%' color='#8B5CF6' />
				</motion.div>

				{/* CHARTS */}

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div>
			</main>
		</div>
	);
};
export default OverviewPage;
