import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dailyOrdersData = [
	{ date: "07/01", bookings: 45 },
	{ date: "07/02", bookings: 52 },
	{ date: "07/03", bookings: 49 },
	{ date: "07/04", bookings: 60 },
	{ date: "07/05", bookings: 55 },
	{ date: "07/06", bookings: 58 },
	{ date: "07/07", bookings: 62 },
];

const DailyOrders = () => {
	return (
		<motion.div
			className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Theo dõi booking</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={dailyOrdersData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='date' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
								color: "#2D3748",
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Legend />
						<Line
							type='monotone'
							dataKey='bookings'
							stroke='#4299E1'
							strokeWidth={3}
							dot={{ r: 4, fill: "#4299E1" }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default DailyOrders;
