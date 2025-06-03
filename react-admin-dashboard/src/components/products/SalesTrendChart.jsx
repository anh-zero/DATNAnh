import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const salesData = [
	{ month: "Jan", doanh_số: 4000 },
	{ month: "Feb", doanh_số: 3000 },
	{ month: "Mar", doanh_số: 5000 },
	{ month: "Apr", doanh_số: 4500 },
	{ month: "May", doanh_số: 6000 },
	{ month: "Jun", doanh_số: 5500 },
];

const SalesTrendChart = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Tình hình doanh số</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={salesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' /> {/* Sáng hơn */}
						<XAxis dataKey='month' stroke='#718096' /> {/* Sáng hơn */}
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748"
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Legend />
						<Line type='monotone' dataKey='doanh_số' stroke='#4299E1' strokeWidth={3} dot={{ r: 4, fill: "#4299E1" }} /> {/* Xanh dương chủ đạo */}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default SalesTrendChart;
