import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
const salesByCategory = [
	{ name: "Việt Nam", value: 4500 },
	{ name: "Nhật Bản", value: 3200 },
	{ name: "Trung Quốc", value: 2800 },
	{ name: "Úc", value: 2100 },
];

const COLORS = [
	"#4299E1", // theme-primary
	"#50E3C2", // theme-accent
	"#8B5CF6", // purple
	"#F59E0B", // orange
	"#EC4899", // pink
];

const SalesByCategoryChart = () => {
	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Doanh thu theo điểm đến</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={salesByCategory}
							cx='50%'
							cy='50%'
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{salesByCategory.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748",
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
export default SalesByCategoryChart;
