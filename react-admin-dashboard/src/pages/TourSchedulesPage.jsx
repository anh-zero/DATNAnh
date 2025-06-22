import React, { useEffect, useState } from 'react';
import { Calendar, Tag, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getTourScheduleStatistics } from "../api/services/tourScheduleService";

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import TourSchedulesTable from '../components/tourSchedules/TourSchedulesTable';

const TourSchedulesPage = () => {
    const [schedulesStats, setSchedulesStats] = useState({
        totalSchedules: 0,
        activeSchedules: 0,
        completedSchedules: 0,
        upcomingSchedules: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSchedulesStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token không tồn tại");
            }

            // Gọi API thống kê
            const statsResponse = await getTourScheduleStatistics();
            if (statsResponse && statsResponse.success) {
                const stats = statsResponse.data || {};
                setSchedulesStats({
                    totalSchedules: stats.totalSchedules || 0,
                    activeSchedules: stats.activeSchedules || 0,
                    completedSchedules: stats.completedSchedules || 0,
                    upcomingSchedules: stats.upcomingSchedules || 0
                });
            } else {
                throw new Error("Không thể lấy thống kê lịch trình tour");
            }
        } catch (error) {
            console.error("Error fetching schedules stats:", error);
            setError("Không thể tải thông tin thống kê lịch trình");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn để đảm bảo auth đã được xử lý
        const timer = setTimeout(() => {
            fetchSchedulesStats();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý Lịch Trình Tour' />

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
                        name='Tổng số lịch trình'
                        icon={Calendar}
                        value={schedulesStats.totalSchedules.toLocaleString()}
                        color='#4299E1' // Xanh dương
                    />
                    <StatCard
                        name='Đang mở bán'
                        icon={Tag}
                        value={schedulesStats.activeSchedules.toLocaleString()}
                        color='#50E3C2' // Xanh ngọc
                    />
                    <StatCard
                        name='Đã hoàn thành'
                        icon={Clock}
                        value={schedulesStats.completedSchedules.toLocaleString()}
                        color='#F59E0B' // Cam nhạt
                    />
                    <StatCard
                        name='Sắp khởi hành'
                        icon={Users}
                        value={schedulesStats.upcomingSchedules.toLocaleString()}
                        color='#8B5CF6' // Tím
                    />
                </motion.div>

                <TourSchedulesTable />
            </main>
        </div>
    );
};

export default TourSchedulesPage;