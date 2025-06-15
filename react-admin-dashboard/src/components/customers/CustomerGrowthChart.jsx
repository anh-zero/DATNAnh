import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const customerGrowthData = [
	{ month: "Jan", customers: 100 },
	{ month: "Feb", customers: 200 },
	{ month: "Mar", customers: 300 },
	{ month: "Apr", customers: 400 },
	{ month: "May", customers: 500 },
	{ month: "Jun", customers: 600 },
];

const CustomerGrowthChart = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Đồ thị tăng trưởng người dùng</h2>
			<div className='h-[320px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart data={customerGrowthData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='month' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748",
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Line
							type='monotone'
							dataKey='customers'
							stroke='#4299E1'
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default CustomerGrowthChart;
