import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const categoryData = [
	{ name: "Việt Nam", value: 4500 },
	{ name: "Nhật Bản", value: 3200 },
	{ name: "Trung Quốc", value: 2800 },
	{ name: "Úc", value: 2100 },
	{ name: "Sports & Outdoors", value: 1900 },
];

const COLORS = ["#4299E1", "#50E3C2", "#8B5CF6", "#F59E0B", "#EC4899"]; // Xanh dương, xanh ngọc, tím, cam, hồng

const CategoryDistributionChart = () => {
	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-lg font-medium mb-4 text-theme-text-primary'>Phân theo quốc gia</h2>
			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<PieChart>
						<Pie
							data={categoryData}
							cx={"50%"}
							cy={"50%"}
							labelLine={false}
							outerRadius={80}
							fill='#4299E1'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{categoryData.map((entry, index) => (
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
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default CategoryDistributionChart;
