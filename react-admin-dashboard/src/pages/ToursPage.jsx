import React, { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import ToursTable from '../components/tours/ToursTable';
import { getTourStatistics } from '../api/services/tourService';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'; // Example icons
import StatCard from '../components/common/StatCard';

const ToursPage = () => {
    const [stats, setStats] = useState({
        totalTours: 0,
        // Add more relevant stats if available from your API
        // e.g., activeTours, toursAddedToday
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            setStatsError(null);
            try {
                const data = await getTourStatistics(); // Ensure this API endpoint exists and returns relevant data
                setStats({
                    totalTours: data.total_san_pham_tours || 0,
                    // Map other stats here
                });
            } catch (error) {
                console.error('Error fetching tour stats:', error);
                setStatsError('Không thể tải thống kê tour.');
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Sản phẩm Tours' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS CARDS - Example, adjust based on available stats */}
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
                    <StatCard
                        name='Tổng số Tours' // Changed from title to name
                        value={stats.totalTours}
                        icon={Package} // Pass the component itself, not an element
                        color="#3b82f6" // Pass a CSS color string (Tailwind's blue-500)
                    // isLoading prop is not used by StatCard as defined, so it's effectively ignored by StatCard
                    // You can keep it if other StatCard instances might use it or remove it for this instance.
                    // For the error fix, it's not relevant.
                    />
                    {/* Add more StatCard components for other statistics */}
                    {/* Example:
          <StatCard
            name='Tours Hoạt động' // Changed from title
            value={stats.activeTours || 0}
            icon={CheckCircle} // Pass the component
            color="#22c55e" // Example for green-500
            isLoading={isLoadingStats}
          />
          <StatCard
            name='Tours Mới Hôm Nay' // Changed from title
            value={stats.toursAddedToday || 0}
            icon={TrendingUp} // Pass the component
            color="#6366f1" // Example for indigo-500
            isLoading={isLoadingStats}
          />
          */}
                </div>
                {statsError && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-700 dark:text-red-300 rounded-md text-sm">
                        <p><strong>Lỗi thống kê:</strong> {statsError}</p>
                    </div>
                )}

                <ToursTable />
            </main>
        </div>
    );
};

export default ToursPage;