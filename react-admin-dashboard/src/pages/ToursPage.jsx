import React, { useEffect, useState } from 'react';
import { Map, Calendar, Tag, Clock } from "lucide-react"; // Thay đổi icon phù hợp
import { motion } from "framer-motion";
import { getTourStatistics } from "../api/services/tourService";

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import ToursTable from '../components/tours/ToursTable';

const ToursPage = () => {
    const [toursStats, setToursStats] = useState({
        totalTours: 0,
        activeTours: 0,
        scheduledTours: 0,
        upcomingTours: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchToursStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token không tồn tại");
            }

            // Gọi trực tiếp API thống kê
            const statsResponse = await getTourStatistics();
            if (statsResponse && statsResponse.success) {
                const stats = statsResponse.data || {};
                setToursStats({
                    totalTours: stats.totalTours || 0,
                    activeTours: stats.activeTours || 0,
                    scheduledTours: stats.scheduledTours || 0,
                    upcomingTours: stats.upcomingTours || 0
                });
            } else {
                throw new Error("Không thể lấy thống kê tour");
            }
        } catch (error) {
            console.error("Error fetching tours stats:", error);
            setError("Không thể tải thông tin tours");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn để đảm bảo auth đã được xử lý
        const timer = setTimeout(() => {
            fetchToursStats();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý Tours' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <StatCard
                        name='Tổng số tour'
                        icon={Map}
                        value={toursStats.totalTours.toLocaleString()}
                        color='#4299E1' // Xanh dương
                    />
                    <StatCard
                        name='Tour đang mở bán'
                        icon={Tag}
                        value={toursStats.activeTours.toLocaleString()}
                        color='#50E3C2' // Xanh ngọc
                    />
                    <StatCard
                        name='Lịch khởi hành'
                        icon={Calendar}
                        value={toursStats.scheduledTours.toLocaleString()}
                        color='#F59E0B' // Cam nhạt
                    />
                    <StatCard
                        name='Tour sắp khởi hành'
                        icon={Clock}
                        value={toursStats.upcomingTours.toLocaleString()}
                        color='#8B5CF6' // Tím
                    />
                </motion.div>

                <ToursTable />
            </main>
        </div>
    );
};

export default ToursPage;