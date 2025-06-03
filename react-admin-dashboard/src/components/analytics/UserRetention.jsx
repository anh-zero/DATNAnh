import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const userRetentionData = [
	{ name: "Tuần 1", duy_tri: 100 },
	{ name: "Tuần 2", duy_tri: 75 },
	{ name: "Tuần 3", duy_tri: 60 },
	{ name: "Tuần 4", duy_tri: 50 },
	{ name: "Tuần 5", duy_tri: 45 },
	{ name: "Tuần 6", duy_tri: 40 },
	{ name: "Tuần 7", duy_tri: 38 },
	{ name: "Tuần 8", duy_tri: 35 },
];

const UserRetention = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Sự gắn bó của khách hàng</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={userRetentionData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='name' stroke='#718096' />
						<YAxis stroke='#718096' />
						<Tooltip
							contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", color: "#2D3748" }}
							itemStyle={{ color: "#2D3748" }}
						/>
						<Legend />
						<Line type='monotone' dataKey='duy_tri' stroke='#4299E1' strokeWidth={2} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default UserRetention;
