import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import ProductsTable from "../components/products/ProductsTable";

const ProductsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Tour' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Tổng tours' icon={Package} value={1234} color='#4299E1' />         {/* Xanh dương */}
					<StatCard name='Bán chạy' icon={TrendingUp} value={89} color='#50E3C2' />         {/* Xanh ngọc */}
					<StatCard name='Ế hàng' icon={AlertTriangle} value={23} color='#F59E0B' />        {/* Cam nhạt */}
					<StatCard name='Tổng doanh thu' icon={DollarSign} value={"5,432,100₫"} color='#8B5CF6' /> {/* Tím nhạt */}
				</motion.div>

				<ProductsTable />

				{/* CHARTS */}
				<div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
					<SalesTrendChart />
					<CategoryDistributionChart />
				</div>
			</main>
		</div>
	);
};
export default ProductsPage;
