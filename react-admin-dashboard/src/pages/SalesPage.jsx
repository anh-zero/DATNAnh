import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import SalesOverviewChart from "../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../components/sales/DailySalesTrend";

const salesStats = {
	totalRevenue: "12,234,567₫",
	averageOrderValue: "785,123₫",
	conversionRate: "3.45%",
	salesGrowth: "12.3%",
};

const SalesPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Doanh số' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* SALES STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Tổng doanh thu' icon={DollarSign} value={salesStats.totalRevenue} color='#EF4444' /> {/* Đỏ nhạt */}
					<StatCard
						name='Trung bình giá trị tour'
						icon={ShoppingCart}
						value={salesStats.averageOrderValue}
						color='#10B981' // Xanh lá
					/>
					<StatCard
						name='Tỷ lệ chuyển đổi'
						icon={TrendingUp}
						value={salesStats.conversionRate}
						color='#F59E0B' // Cam nhạt
					/>
					<StatCard name='Mức tăng trưởng' icon={CreditCard} value={salesStats.salesGrowth} color='#8B5CF6' /> {/* Tím nhạt */}
				</motion.div>

				<SalesOverviewChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<SalesByCategoryChart />
					<DailySalesTrend />
				</div>
			</main>
		</div>
	);
};
export default SalesPage;
