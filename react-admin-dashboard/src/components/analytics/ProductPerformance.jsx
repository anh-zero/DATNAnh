import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const productPerformanceData = [
	{ name: "Tour A", doanh_so: 4000, doanh_thu: 2400, loi_nhuan: 2400 },
	{ name: "Tour B", doanh_so: 3000, doanh_thu: 1398, loi_nhuan: 2210 },
	{ name: "Tour C", doanh_so: 2000, doanh_thu: 9800, loi_nhuan: 2290 },
	{ name: "Tour D", doanh_so: 2780, doanh_thu: 3908, loi_nhuan: 2000 },
	{ name: "Tour E", doanh_so: 1890, doanh_thu: 4800, loi_nhuan: 2181 },
];

const ProductPerformance = () => {
	return (
		<motion.div
			className='bg-theme-surface0 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-theme-border'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-theme-text-primary mb-4'>Hiệu suất của tour tiêu biểu</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={productPerformanceData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
						<XAxis dataKey='name' stroke='#718096' />
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
						<Bar dataKey='doanh_so' fill='#4299E1' />
						<Bar dataKey='doanh_thu' fill='#10B981' />
						<Bar dataKey='loi_nhuan' fill='#F59E0B' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default ProductPerformance;
