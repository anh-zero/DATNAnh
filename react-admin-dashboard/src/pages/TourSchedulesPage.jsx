import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Search } from 'lucide-react'; // Thêm Search
import TourSchedulesTable from '../components/tourSchedules/TourSchedulesTable';
import TourScheduleFormModal from '../components/tourSchedules/TourScheduleFormModal';
import TourScheduleDetailsModal from '../components/tourSchedules/TourScheduleDetailsModal'; // NEW IMPORT
import Header from '../components/common/Header';
import { getTourById } from '../api/services/tourService'; // Để lấy tên tour

const TourSchedulesPage = () => {
    const { tourId } = useParams();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingSchedule, setViewingSchedule] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [tourName, setTourName] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // NEW STATE for search

    useEffect(() => {
        const fetchTourName = async () => {
            if (tourId) {
                try {
                    const tourData = await getTourById(tourId);
                    setTourName(tourData.ten_tour || `ID ${tourId}`);
                } catch (error) {
                    console.error("Failed to fetch tour details:", error);
                    setTourName(`ID ${tourId}`);
                }
            }
        };
        fetchTourName();
    }, [tourId]);

    const handleSearchChange = (event) => { // NEW FUNCTION for search
        setSearchTerm(event.target.value);
        // Nếu tìm kiếm phía server, bạn có thể muốn reset page hoặc gọi fetch lại ở đây
        // setRefreshKey(prevKey => prevKey + 1); // Hoặc để table tự xử lý
    };

    const handleOpenFormModal = (schedule = null) => {
        setEditingSchedule(schedule);
        setIsFormModalOpen(true);
        setIsDetailsModalOpen(false); // Đảm bảo modal chi tiết đóng khi mở form
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSchedule(null);
    };

    const handleOpenDetailsModal = async (scheduleData) => { // Nhận scheduleData trực tiếp từ table
        setViewingSchedule(scheduleData); // API call không cần thiết nếu table đã có đủ data
        setIsDetailsModalOpen(true);
        // Nếu cần fetch thêm chi tiết:
        // setIsLoadingDetails(true);
        // try {
        //     const detailedSchedule = await getTourScheduleById(tourId, scheduleId);
        //     setViewingSchedule(detailedSchedule);
        //     setIsDetailsModalOpen(true);
        // } catch (error) {
        //     console.error("Failed to fetch schedule details:", error);
        //     alert("Không thể tải chi tiết lịch trình.");
        // } finally {
        //     setIsLoadingDetails(false);
        // }
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingSchedule(null);
    };

    const handleSuccess = () => {
        handleCloseFormModal();
        handleCloseDetailsModal(); // Đóng cả modal chi tiết nếu đang mở
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title={`Lịch trình cho Tour: ${tourName}`} />
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <RouterLink
                        to="/tours"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Quay lại Tours
                    </RouterLink>
                    {/* Search bar and Add button will be inside TourSchedulesTable or a new header component for the table */}
                </div>

                <TourSchedulesTable
                    tourId={tourId}
                    onEdit={handleOpenFormModal}
                    onViewDetails={handleOpenDetailsModal}
                    refreshKey={refreshKey}
                    searchTerm={searchTerm} // Pass searchTerm
                    onSearchChange={handleSearchChange} // Pass search handler
                    onAddSchedule={() => handleOpenFormModal()} // Pass handler to open form modal
                />

                {isFormModalOpen && (
                    <TourScheduleFormModal
                        isOpen={isFormModalOpen}
                        onClose={handleCloseFormModal}
                        schedule={editingSchedule}
                        tourId={tourId}
                        onSuccess={handleSuccess}
                    />
                )}

                {isDetailsModalOpen && viewingSchedule && ( // NEW MODAL INSTANCE
                    <TourScheduleDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={handleCloseDetailsModal}
                        schedule={viewingSchedule}
                        isLoading={isLoadingDetails}
                        onEdit={handleOpenFormModal} // Để mở form sửa từ modal chi tiết
                    />
                )}
            </main>
        </div>
    );
};

export default TourSchedulesPage;