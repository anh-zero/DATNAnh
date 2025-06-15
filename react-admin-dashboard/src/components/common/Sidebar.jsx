import { Home, ShoppingBag, BarChart, Calendar, Menu, Settings, LogOut, Users, Star, MapPin, Plane, FileText, TrendingUp, Building, Heart } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from '../../api/services/authService';

const SIDEBAR_ITEMS = [
	// Tổng quan
	{
		name: "Tổng quan",
		icon: Home,
		colorClass: "text-theme-primary",
		href: "/",
		group: null
	},

	// Divider placeholder - KINH DOANH
	{
		name: "KINH DOANH",
		icon: null,
		colorClass: null,
		href: null,
		group: "divider"
	},

	// Kinh doanh items
	{
		name: "Quản lý Đặt tour",
		icon: ShoppingBag,
		colorClass: "text-theme-primary",
		href: "/orders",
		group: "business"
	},
	{
		name: "Báo cáo & Doanh thu",
		icon: TrendingUp,
		colorClass: "text-theme-primary",
		href: "/analytics",
		group: "business"
	},

	// Divider placeholder - SẢN PHẨM
	{
		name: "SẢN PHẨM",
		icon: null,
		colorClass: null,
		href: null,
		group: "divider"
	},

	// Sản phẩm items
	{
		name: 'Sản phẩm Tours',
		icon: Plane,
		colorClass: "text-theme-primary",
		href: '/tours',
		group: "product"
	},
	{
		name: "Lịch khởi hành",
		icon: Calendar,
		colorClass: "text-theme-primary",
		href: "/schedules",
		group: "product"
	},
	{
		name: "Đối tác",
		icon: Building,
		colorClass: "text-theme-primary",
		href: "/partners",
		group: "product"
	},

	// Divider placeholder - QUẢN LÝ CHUNG
	{
		name: "QUẢN LÝ CHUNG",
		icon: null,
		colorClass: null,
		href: null,
		group: "divider"
	},

	// Quản lý chung items
	{
		name: "Khách hàng",
		icon: Users,
		colorClass: "text-theme-primary",
		href: "/customers",
		group: "management"
	},
	{
		name: "Quản lý Đánh giá",
		icon: Star,
		colorClass: "text-theme-primary",
		href: "/reviews",
		group: "management"
	},
	{
		name: "Quản lý Địa điểm",
		icon: MapPin,
		colorClass: "text-theme-primary",
		href: "/locations",
		group: "management"
	},

	// Divider placeholder - HỆ THỐNG
	{
		name: "HỆ THỐNG",
		icon: null,
		colorClass: null,
		href: null,
		group: "divider"
	},

	// Hệ thống items
	{
		name: "Người dùng hệ thống",
		icon: Users,
		colorClass: "text-theme-primary",
		href: "/users",
		group: "system"
	},
	{
		name: "Cài đặt",
		icon: Settings,
		colorClass: "text-theme-text-secondary",
		href: "/settings",
		group: "system"
	},
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"
				}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-theme-surface p-4 flex flex-col border-r border-theme-border font-inter'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-theme-primary hover:text-white text-theme-text-secondary transition-colors max-w-fit'
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-8 flex-grow overflow-y-auto'>
					{SIDEBAR_ITEMS.map((item, index) => (
						item.group === "divider" ? (
							// Modified divider with left-aligned header
							<div key={`divider-${index}`} className="my-6 px-1">
								{isSidebarOpen && (
									<div className="flex flex-col">
										{/* Left-aligned category label */}
										<span className="text-[10px] font-medium text-theme-text-tertiary opacity-70 tracking-wider pl-3 pb-2">
											{item.name}
										</span>
										{/* Single horizontal line below the text */}
										<div className="h-px bg-theme-border w-full"></div>
									</div>
								)}
								{!isSidebarOpen && <div className="h-px bg-theme-border w-full"></div>}
							</div>
						) : item.href ? (
							<Link key={item.href} to={item.href}>
								<motion.div
									className={`flex items-center py-3.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 mb-1.5 ${location.pathname === item.href
										? 'bg-theme-primary/10 text-theme-primary font-semibold'
										: 'text-theme-text-secondary hover:bg-theme-primary/5'
										}`}
								>
									{item.icon && (
										<item.icon
											size={18}
											className={`${location.pathname === item.href ? 'text-theme-primary' : 'text-theme-text-secondary'} min-w-[18px]`}
										/>
									)}
									<AnimatePresence>
										{isSidebarOpen && (
											<motion.span
												className='ml-3.5 whitespace-nowrap'
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: "auto" }}
												exit={{ opacity: 0, width: 0 }}
												transition={{ duration: 0.2, delay: 0.3 }}
											>
												{item.name}
											</motion.span>
										)}
									</AnimatePresence>
								</motion.div>
							</Link>
						) : null
					))}
				</nav>

				<div className="mt-auto pt-4 border-t border-theme-border">
					<button
						onClick={() => {
							if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
								logoutAdmin();
							}
						}}
						className='flex items-center py-3.5 px-4 text-sm font-medium rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors duration-200'
					>
						<LogOut size={18} />
						{isSidebarOpen && <span className="ml-3.5 truncate">Đăng xuất</span>}
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default Sidebar;
