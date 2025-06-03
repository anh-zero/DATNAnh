import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const dailySalesData = [
	{ name: "Mon", doanh_thu: 1000 },
	{ name: "Tue", doanh_thu: 1200 },
	{ name: "Wed", doanh_thu: 900 },
	{ name: "Thu", doanh_thu: 1100 },
	{ name: "Fri", doanh_thu: 1300 },
	{ name: "Sat", doanh_thu: 1600 },
	{ name: "Sun", doanh_thu: 1400 },
];

const DailySalesTrend = () => {
	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Xu hướng</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={dailySalesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='name' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748",
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Bar dataKey='doanh_thu' fill='#10B981' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default DailySalesTrend;
