import { motion } from "framer-motion";
import {
	ResponsiveContainer,
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Legend,
	Tooltip,
} from "recharts";

const customerSegmentationData = [
	{ subject: "Giữ lời hứa", A: 120, B: 110, fullMark: 150 },
	{ subject: "Trung thành", A: 98, B: 130, fullMark: 150 },
	{ subject: "Hài lòng", A: 86, B: 130, fullMark: 150 },
	{ subject: "Chịu chi", A: 99, B: 100, fullMark: 150 },
	{ subject: "Thường xuyên", A: 85, B: 90, fullMark: 150 },
	{ subject: "Khó chịu", A: 65, B: 85, fullMark: 150 },
];

const CustomerSegmentation = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Phân khúc khách hàng</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<RadarChart cx='50%' cy='50%' outerRadius='80%' data={customerSegmentationData}>
						<PolarGrid stroke='#E2E8F0' />
						<PolarAngleAxis dataKey='subject' stroke='#718096' />
						<PolarRadiusAxis angle={30} domain={[0, 150]} stroke='#718096' />
						<Radar name='Cá nhân' dataKey='A' stroke='#4299E1' fill='#4299E1' fillOpacity={0.6} />
						<Radar name='Theo nhóm' dataKey='B' stroke='#10B981' fill='#10B981' fillOpacity={0.6} />
						<Legend />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderColor: "#E2E8F0",
							}}
							itemStyle={{ color: "#2D3748" }}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default CustomerSegmentation;
