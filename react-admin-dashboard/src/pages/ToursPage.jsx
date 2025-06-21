import React, { useEffect, useState } from 'react';
import { Map, User, Calendar, Image } from "lucide-react";
import { motion } from "framer-motion";
import { getAllTours, getTourStatistics } from "../api/services/tourService";

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
            // Kiểm tra token trước khi gọi API
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token không tồn tại");
            }

            // Lấy thống kê tour từ backend (nếu có endpoint thống kê)
            try {
                const statsResponse = await getTourStatistics();
                if (statsResponse && statsResponse.data) {
                    setToursStats({
                        totalTours: statsResponse.data.totalTours || 0,
                        activeTours: statsResponse.data.activeTours || 0,
                        scheduledTours: statsResponse.data.scheduledTours || 0,
                        upcomingTours: statsResponse.data.upcomingTours || 0
                    });
                    return;
                }
            } catch (statError) {
                console.log("Tour statistics not available, fetching all tours instead");
            }

            // Nếu không có endpoint thống kê, tính toán từ danh sách tours
            const response = await getAllTours({ limit: 100 });

            if (response && response.data) {
                const tours = response.data.tours || [];
                const total = tours.length;

                // Giả định phân loại tours (có thể thay đổi theo logic thực tế)
                const active = tours.filter(tour =>
                    tour.lichtrinhtour &&
                    tour.lichtrinhtour.some(lt => lt.trang_thai_lich_trinh === 'Đang mở bán')
                ).length;

                const scheduled = tours.filter(tour =>
                    tour.lichtrinhtour &&
                    tour.lichtrinhtour.some(lt => lt.trang_thai_lich_trinh === 'Sắp mở bán')
                ).length;

                const upcoming = tours.filter(tour =>
                    tour.lichtrinhtour &&
                    tour.lichtrinhtour.some(lt => new Date(lt.ngay_khoi_hanh) > new Date())
                ).length;

                setToursStats({
                    totalTours: total,
                    activeTours: active,
                    scheduledTours: scheduled,
                    upcomingTours: upcoming
                });
            }
        } catch (error) {
            console.error("Error fetching tours stats:", error);
            setError("Không thể tải thông tin tours");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn việc fetch dữ liệu để đảm bảo auth đã được xử lý
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
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name='Tổng số tour'
                        icon={Map}
                        value={toursStats.totalTours.toLocaleString()}
                        color='#4299E1' // Xanh dương
                    />
                    <StatCard
                        name='Tour đang mở bán'
                        icon={User}
                        value={toursStats.activeTours}
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
                        icon={Image}
                        value={toursStats.upcomingTours}
                        color='#8B5CF6' // Tím
                    />
                </motion.div>

                <ToursTable />
            </main>
        </div>
    );
};

export default ToursPage;