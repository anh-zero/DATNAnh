import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { getAllReviewsForStats } from "../api/services/reviewService";

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import ReviewsTable from '../components/reviews/ReviewsTable';

const ReviewsPage = () => {
    const [reviewsStats, setReviewsStats] = useState({
        totalReviews: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        avgRating: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReviewsStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Gọi API lấy toàn bộ danh sách đánh giá để tính toán
            const response = await getAllReviewsForStats();

            if (response && response.success) {
                const reviews = response.data || [];

                // Tính toán thống kê từ danh sách đánh giá
                const totalReviews = reviews.length;
                const approvedReviews = reviews.filter(r => r.da_duyet).length;
                const pendingReviews = reviews.filter(r => !r.da_duyet).length;

                // Tính điểm trung bình (chỉ tính các đánh giá được duyệt)
                let totalRating = 0;
                let ratedCount = 0;

                reviews.forEach(review => {
                    if (review.da_duyet && review.diem_danh_gia) {
                        totalRating += review.diem_danh_gia;
                        ratedCount++;
                    }
                });

                const avgRating = ratedCount > 0 ? totalRating / ratedCount : 0;

                setReviewsStats({
                    totalReviews,
                    approvedReviews,
                    pendingReviews,
                    avgRating
                });
            } else {
                throw new Error("Không thể lấy dữ liệu đánh giá tour");
            }
        } catch (error) {
            console.error("Error fetching reviews stats:", error);
            setError("Không thể tải thông tin thống kê đánh giá");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Trì hoãn để đảm bảo auth đã được xử lý
        const timer = setTimeout(() => {
            fetchReviewsStats();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý Đánh giá Tour' />

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
                        name='Tổng đánh giá'
                        icon={MessageSquare}
                        value={reviewsStats.totalReviews.toLocaleString()}
                        color='#4299E1' // Xanh dương
                        isLoading={isLoading}
                    />
                    <StatCard
                        name='Đã duyệt'
                        icon={CheckCircle}
                        value={reviewsStats.approvedReviews.toLocaleString()}
                        color='#10B981' // Xanh lá
                        isLoading={isLoading}
                    />
                    <StatCard
                        name='Chờ duyệt'
                        icon={AlertTriangle}
                        value={reviewsStats.pendingReviews.toLocaleString()}
                        color='#F59E0B' // Cam
                        isLoading={isLoading}
                    />
                    <StatCard
                        name='Điểm trung bình'
                        icon={Star}
                        value={reviewsStats.avgRating.toFixed(1)}
                        color='#8B5CF6' // Tím
                        isLoading={isLoading}
                    />
                </motion.div>

                <ReviewsTable onDataChange={fetchReviewsStats} />
            </main>
        </div>
    );
};

export default ReviewsPage;