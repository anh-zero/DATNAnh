import { BarChart2, DollarSign, Handshake, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { logoutAdmin } from '../../api/services/authService';

const SIDEBAR_ITEMS = [
	{name: "Overview", icon: BarChart2, colorClass: "text-theme-primary", href: "/",},
	{ name: "Users", icon: Users, colorClass: "text-theme-primary", href: "/users" },
	{ name: "Customers", icon: UserPlus, colorClass: "text-theme-primary", href: "/customers" },
	{ name: "Partners", icon: Handshake, colorClass: "text-theme-primary", href: "/partners" },
	{ name: "Tours", icon: ShoppingBag, colorClass: "text-theme-primary", href: "/products" },
	{ name: "Bookings", icon: ShoppingCart, colorClass: "text-theme-primary", href: "/orders" },
	{ name: "Sales", icon: DollarSign, colorClass: "text-theme-primary", href: "/sales" },
	{ name: "Analytics", icon: TrendingUp, colorClass: "text-theme-primary", href: "/analytics" },
	{ name: "Settings", icon: Settings, colorClass: "text-theme-text-secondary", href: "/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const navigate = useNavigate();

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"
				}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-theme-surface p-4 flex flex-col border-r border-theme-border'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-theme-primary hover:text-white text-theme-text-secondary transition-colors max-w-fit'
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-8 flex-grow'>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-theme-primary hover:text-white text-theme-text-secondary transition-colors mb-2'>
								<item.icon size={20} className={`${item.colorClass} min-w-[20px]`} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-4 whitespace-nowrap'
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
					))}
				</nav>

				<div className="mt-auto pt-4 border-t border-theme-border">
					<button
						onClick={() => {
							if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
								logoutAdmin();
							}
						}}
						className='flex items-center p-3 text-sm font-medium rounded-lg hover:bg-theme-background text-red-500 hover:text-red-400 transition-colors duration-200'
					>
						<LogOut size={20} />
						{isSidebarOpen && <span className="truncate">Đăng xuất</span>}
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default Sidebar;
