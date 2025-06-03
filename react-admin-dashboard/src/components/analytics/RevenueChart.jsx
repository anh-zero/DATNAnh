import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const revenueData = [
	{ month: "Jan", doanh_thu: 4000, muc_tieu: 3800 },
	{ month: "Feb", doanh_thu: 3000, muc_tieu: 3200 },
	{ month: "Mar", doanh_thu: 5000, muc_tieu: 4500 },
	{ month: "Apr", doanh_thu: 4500, muc_tieu: 4200 },
	{ month: "May", doanh_thu: 6000, muc_tieu: 5500 },
	{ month: "Jun", doanh_thu: 5500, muc_tieu: 5800 },
	{ month: "Jul", doanh_thu: 7000, muc_tieu: 6500 },
];

const RevenueChart = () => {
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");

	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-theme-text-primary'>Doanh thu/Mục tiêu</h2>
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

			<div style={{ width: "100%", height: 400 }}>
				<ResponsiveContainer>
					<AreaChart data={revenueData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='month' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", color: "#2D3748" }}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Legend />
						<Area type='monotone' dataKey='doanh_thu' stroke='#4299E1' fill='#4299E1' fillOpacity={0.3} />
						<Area type='monotone' dataKey='muc_tieu' stroke='#10B981' fill='#10B981' fillOpacity={0.3} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default RevenueChart;
