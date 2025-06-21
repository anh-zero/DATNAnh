import { MapPin, Map, Globe, Building, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getAllLocations } from "../api/services/locationService";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import LocationsTable from "../components/locations/LocationsTable";

const LocationsPage = () => {
    const [locationsStats, setLocationsStats] = useState({
        totalLocations: 0,
        tourismLocations: 0,
        hotels: 0,
        cities: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocationsStats = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Kiểm tra token trước khi gọi API
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token không tồn tại");
            }

            // Lấy tất cả địa điểm để tính toán thống kê
            const response = await getAllLocations({ limit: 100 });

            if (response && response.locations) {
                const locations = response.locations;
                const total = locations.length;
                const tourism = locations.filter(loc => loc.loai_dia_diem === 'Điểm tham quan').length;
                const hotels = locations.filter(loc => loc.loai_dia_diem === 'Khách sạn').length;
                const cities = locations.filter(loc => loc.loai_dia_diem === 'Thành phố').length;

                setLocationsStats({
                    totalLocations: total,
                    tourismLocations: tourism,
                    hotels: hotels,
                    cities: cities
                });
            }
        } catch (error) {
            console.error("Error fetching locations stats:", error);
            setError("Không thể tải thông tin địa điểm");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn việc fetch dữ liệu để đảm bảo auth đã được xử lý
        const timer = setTimeout(() => {
            fetchLocationsStats();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý Địa điểm' />

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
                        name='Tổng số địa điểm'
                        icon={Map}
                        value={locationsStats.totalLocations.toLocaleString()}
                        color='#4299E1' // Xanh dương
                    />
                    <StatCard
                        name='Điểm tham quan'
                        icon={MapPin}
                        value={locationsStats.tourismLocations}
                        color='#50E3C2' // Xanh ngọc
                    />
                    <StatCard
                        name='Khách sạn'
                        icon={Building}
                        value={locationsStats.hotels.toLocaleString()}
                        color='#F59E0B' // Cam nhạt
                    />
                    <StatCard
                        name='Thành phố'
                        icon={Globe}
                        value={locationsStats.cities}
                        color='#8B5CF6' // Tím
                    />
                </motion.div>

                <LocationsTable />
            </main>
        </div>
    );
};

export default LocationsPage;