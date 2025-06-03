import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const COLORS = ["#4299E1", "#50E3C2", "#8B5CF6", "#F59E0B", "#EC4899"];

const SALES_CHANNEL_DATA = [
	{ name: "Website", lượt_truy_cập: 45600 },
	{ name: "Mobile App", lượt_truy_cập: 38200 },
	{ name: "Sàn thương mại", lượt_truy_cập: 29800 },
	{ name: "Mạng xã hội", lượt_truy_cập: 18700 },
];

const SalesChannelChart = () => {
	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 lg:col-span-2 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-lg font-medium mb-4 text-theme-text-primary'>Phân theo nền tảng</h2>

			<div className='h-80'>
				<ResponsiveContainer>
					<BarChart data={SALES_CHANNEL_DATA}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='name' stroke='#718096' />
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
						<Bar dataKey={"lượt_truy_cập"}>
							{SALES_CHANNEL_DATA.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default SalesChannelChart;
