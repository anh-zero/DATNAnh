import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const monthlySalesData = [
	{ month: "Jan", sales: 4000 },
	{ month: "Feb", sales: 3000 },
	{ month: "Mar", sales: 5000 },
	{ month: "Apr", sales: 4500 },
	{ month: "May", sales: 6000 },
	{ month: "Jun", sales: 5500 },
	{ month: "Jul", sales: 7000 },
];

const SalesOverviewChart = () => {
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");

	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-semibold text-theme-text-primary'>Tổng quan về doanh thu</h2>
				<select
					className='bg-theme-surface text-theme-text-primary rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-theme-primary border border-theme-border'
					value={selectedTimeRange}
					onChange={(e) => setSelectedTimeRange(e.target.value)}
				>
					<option>Tuần qua</option>
					<option>Tháng qua</option>
					<option>Quý qua</option>
					<option>Năm qua</option>
				</select>
			</div>
			<div className='w-full h-80'>
				<ResponsiveContainer>
					<AreaChart data={monthlySalesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='month' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", color: "#2D3748" }}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Area
							type='monotone'
							dataKey='sales'
							stroke='#4299E1'
							fill='#4299E1'
							fillOpacity={0.3}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default SalesOverviewChart;
