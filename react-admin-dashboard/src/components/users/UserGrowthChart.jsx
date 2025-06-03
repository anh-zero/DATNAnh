import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const userGrowthData = [
	{ month: "Jan", users: 100 },
	{ month: "Feb", users: 200 },
	{ month: "Mar", users: 300 },
	{ month: "Apr", users: 400 },
	{ month: "May", users: 500 },
	{ month: "Jun", users: 600 },
];

const UserGrowthChart = () => {
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
					<LineChart data={userGrowthData}>
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
							dataKey='users'
							stroke='#4299E1'
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default UserGrowthChart;
