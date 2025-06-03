import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const orderStatusData = [
	{ name: "Đang chờ xử lý", value: 30 },
	{ name: "Đang xử lý", value: 45 },
	{ name: "Đang chờ thanh toán", value: 60 },
	{ name: "Đã thanh toán", value: 120 },
];
const COLORS = [
	"#4299E1", // theme-primary
	"#50E3C2", // theme-accent
	"#8B5CF6", // purple
	"#F59E0B", // orange
	"#EC4899", // pink
];

const OrderDistribution = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Trạng thái booking</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={orderStatusData}
							cx='50%'
							cy='50%'
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{orderStatusData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748"
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default OrderDistribution;
