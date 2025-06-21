import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Star, Hotel, MapPin, Map, Globe } from 'lucide-react';
import { getAllPartners } from '../api/services/partnerService';

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import PartnersTable from '../components/partners/PartnersTable';

const PartnersPage = () => {
    const [partnersStats, setPartnersStats] = useState({
        totalPartners: 0,
        tourismPartners: 0,
        hotelPartners: 0,
        cityPartners: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPartnersStats = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Kiểm tra token trước khi gọi API
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token không tồn tại");
            }

            // Lấy tất cả đối tác để tính toán thống kê
            const response = await getAllPartners({ limit: 100 });

            if (response && response.data && response.data.partners) {
                const partners = response.data.partners;
                const total = partners.length;

                // Phân loại đối tác dựa trên tên (có thể thay đổi nếu có trường loại đối tác)
                // Đây là cách tạm thời, tùy vào dữ liệu thực tế có thể cần điều chỉnh
                const tourism = partners.filter(partner =>
                    partner.ten_doi_tac.toLowerCase().includes('điểm') ||
                    partner.ten_doi_tac.toLowerCase().includes('du lịch') ||
                    partner.ten_doi_tac.toLowerCase().includes('tham quan')
                ).length;

                const hotels = partners.filter(partner =>
                    partner.ten_doi_tac.toLowerCase().includes('hotel') ||
                    partner.ten_doi_tac.toLowerCase().includes('resort') ||
                    partner.ten_doi_tac.toLowerCase().includes('khách sạn')
                ).length;

                const cities = partners.filter(partner =>
                    partner.ten_doi_tac.toLowerCase().includes('thành phố') ||
                    partner.ten_doi_tac.toLowerCase().includes('city')
                ).length;

                setPartnersStats({
                    totalPartners: total,
                    tourismPartners: tourism,
                    hotelPartners: hotels,
                    cityPartners: cities
                });
            }
        } catch (error) {
            console.error("Error fetching partners stats:", error);
            setError("Không thể tải thông tin đối tác");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn việc fetch dữ liệu để đảm bảo auth đã được xử lý
        const timer = setTimeout(() => {
            fetchPartnersStats();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý Đối tác' />

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
                        name='Tổng số đối tác'
                        icon={Building}
                        value={partnersStats.totalPartners.toLocaleString()}
                        color='#4299E1' // Xanh dương
                    />
                    <StatCard
                        name='Điểm tham quan'
                        icon={MapPin}
                        value={partnersStats.tourismPartners}
                        color='#50E3C2' // Xanh ngọc
                    />
                    <StatCard
                        name='Khách sạn'
                        icon={Hotel}
                        value={partnersStats.hotelPartners.toLocaleString()}
                        color='#F59E0B' // Cam nhạt
                    />
                    <StatCard
                        name='Thành phố'
                        icon={Globe}
                        value={partnersStats.cityPartners}
                        color='#8B5CF6' // Tím
                    />
                </motion.div>

                <PartnersTable />
            </main>
        </div>
    );
};

export default PartnersPage;