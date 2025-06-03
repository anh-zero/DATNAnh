import { motion } from "framer-motion";
import { DollarSign, Users, ShoppingBag, Eye, ArrowDownRight, ArrowUpRight } from "lucide-react";

const overviewData = [
	{ name: "Doanh thu", value: "21,234,567₫", change: 12.5, icon: DollarSign, color: "#4299E1" }, // xanh dương
	{ name: "Khách hàng", value: "678", change: 8.3, icon: Users, color: "#50E3C2" }, // xanh ngọc
	{ name: "Booking", value: "76", change: -3.2, icon: ShoppingBag, color: "#EF4444" }, // đỏ
	{ name: "Ghé trang", value: "34,567", change: 15.7, icon: Eye, color: "#8B5CF6" }, // tím nhạt
];

const OverviewCards = () => {
	return (
		<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
			{overviewData.map((item, index) => (
				<motion.div
					key={item.name}
					className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<div className='flex items-center justify-between'>
						<div>
							<h3 className='text-sm font-medium text-theme-text-secondary'>{item.name}</h3>
							<p className='mt-1 text-xl font-semibold text-theme-text-primary'>{item.value}</p>
						</div>

						<div
							className="p-3 rounded-full"
							style={{ backgroundColor: `${item.color}20` }} // 20 = 12% opacity in hex
						>
							<item.icon className="size-6" style={{ color: item.color }} />
						</div>
					</div>
					<div
						className={`
              mt-4 flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}
            `}
					>
						{item.change >= 0 ? <ArrowUpRight size='20' /> : <ArrowDownRight size='20' />}
						<span className='ml-1 text-sm font-medium'>{Math.abs(item.change)}%</span>
						<span className='ml-2 text-sm text-theme-text-secondary'>so với quý trước</span>
					</div>
				</motion.div>
			))}
		</div>
	);
};
export default OverviewCards;
