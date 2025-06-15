import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, CalendarX2, ArrowDownUp, AlertTriangle, Eye, Search, PlusCircle } from 'lucide-react'; // Thêm Search, PlusCircle
import { getAllSchedulesForTour, deleteTourSchedule, cancelTourSchedule } from '../../api/services/tourScheduleService';
import { formatDate, formatPrice } from '../../utils/formatter';

const TourSchedulesTable = ({ tourId, onEdit, onViewDetails, refreshKey, searchTerm, onSearchChange, onAddSchedule }) => {
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('ngay_khoi_hanh');
    const [order, setOrder] = useState('ASC');

    const fetchSchedules = useCallback(async () => {
        if (!tourId) return;
        setIsLoading(true);
        setError(null);
        try {
            // Nếu backend hỗ trợ search, thêm searchTerm vào params
            const params = { sortBy, order, /* searchTerm: searchTerm */ };
            const data = await getAllSchedulesForTour(tourId, params);
            setSchedules(data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách lịch trình.');
        } finally {
            setIsLoading(false);
        }
    }, [tourId, sortBy, order, refreshKey /*, searchTerm */]); // Thêm searchTerm nếu tìm kiếm phía server

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Client-side filtering (nếu không tìm kiếm phía server)
    const filteredSchedules = schedules.filter(schedule => {
        if (!searchTerm) return true;
        // Tìm kiếm theo ID lịch trình (chuyển ID thành string để so sánh)
        // Hoặc bạn có thể thêm các trường khác để tìm kiếm, ví dụ: trạng thái
        return schedule.id_lich_trinh_tour.toString().includes(searchTerm.toLowerCase()) ||
            schedule.trang_thai_lich_trinh.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSort = (field) => {
        const newOrder = sortBy === field && order === 'ASC' ? 'DESC' : 'ASC';
        setSortBy(field);
        setOrder(newOrder);
    };

    const renderSortIcon = (field) => {
        if (sortBy === field) {
            return order === 'ASC' ? '▲' : '▼';
        }
        return <ArrowDownUp size={14} className="inline ml-1 opacity-40" />;
    };

    const getScheduleIdentifier = (schedule) => `ID ${schedule.id_lich_trinh_tour} (Từ ${formatDate(schedule.ngay_khoi_hanh)})`;

    const handleDelete = async (scheduleId, scheduleIdentifier) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình "${scheduleIdentifier}" không?`)) {
            try {
                await deleteTourSchedule(tourId, scheduleId);
                alert(`Lịch trình "${scheduleIdentifier}" đã được xóa.`);
                fetchSchedules();
            } catch (err) {
                alert(`Lỗi khi xóa lịch trình: ${err.message || 'Lỗi không xác định.'}`);
            }
        }
    };

    const handleCancel = async (scheduleId, scheduleIdentifier) => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy lịch trình "${scheduleIdentifier}" không?`)) {
            try {
                await cancelTourSchedule(tourId, scheduleId);
                alert(`Lịch trình "${scheduleIdentifier}" đã được hủy.`);
                fetchSchedules();
            } catch (err) {
                alert(`Lỗi khi hủy lịch trình: ${err.message || 'Lỗi không xác định.'}`);
            }
        }
    };

    if (isLoading && !schedules.length) { // Chỉ hiển thị loading toàn trang nếu chưa có dữ liệu
        return (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto"></div>
                <p className="mt-4 text-theme-text-secondary">Đang tải dữ liệu lịch trình...</p>
            </div>
        );
    }

    if (error && !schedules.length) { // Chỉ hiển thị lỗi toàn trang nếu chưa có dữ liệu
        return (
            <div className="bg-red-100 dark:bg-red-900 bg-opacity-25 text-red-700 dark:text-red-300 p-4 rounded-md my-4 text-center">
                <div className="flex justify-center items-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                    <p className="font-bold">Lỗi:</p>
                </div>
                <p>{error}</p>
                <button
                    onClick={fetchSchedules}
                    className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // Không hiển thị "Chưa có lịch trình" nếu đang tìm kiếm và không có kết quả
    // if (!isLoading && !schedules.length && !searchTerm) {
    //     return <p className="text-center py-10 text-theme-text-secondary">Chưa có lịch trình nào cho tour này.</p>;
    // }


    return (
        <motion.div
            className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
                <h2 className='text-xl font-semibold text-theme-text-primary'>Danh sách Lịch trình</h2>
                <div className='flex items-center space-x-0 sm:space-x-4 w-full sm:w-auto'>
                    <div className='relative flex-grow sm:flex-grow-0'>
                        <input
                            type='text'
                            placeholder='Tìm ID, trạng thái...'
                            className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary w-full'
                            value={searchTerm}
                            onChange={onSearchChange}
                        />
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary' size={18} />
                    </div>
                    <button
                        onClick={onAddSchedule}
                        className='flex items-center bg-theme-primary hover:bg-theme-primary-hover text-white px-3 sm:px-4 py-2 rounded-lg transition duration-200 ml-2 sm:ml-0 shrink-0'
                    >
                        <PlusCircle size={18} className='mr-0 sm:mr-2' />
                        <span className="hidden sm:inline">Thêm Lịch trình</span>
                    </button>
                </div>
            </div>

            {isLoading && schedules.length > 0 && ( // Show a subtle loading indicator when refreshing
                <div className="absolute top-4 right-4 text-xs text-theme-text-secondary">Đang làm mới...</div>
            )}
            {error && schedules.length > 0 && ( // Show error as a small notification if data is already present
                <div className="my-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">Lỗi khi làm mới: {error}</div>
            )}

            {(!isLoading && !error && !filteredSchedules.length && searchTerm) && (
                <div className="text-center py-8 text-theme-text-secondary">
                    Không tìm thấy lịch trình nào khớp với "{searchTerm}".
                </div>
            )}
            {(!isLoading && !error && !filteredSchedules.length && !searchTerm && schedules.length === 0) && (
                <p className="text-center py-10 text-theme-text-secondary">Chưa có lịch trình nào cho tour này.</p>
            )}


            {filteredSchedules.length > 0 && (
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-theme-border'>
                        <thead className='bg-theme-background dark:bg-opacity-50'>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id_lich_trinh_tour')}>ID {renderSortIcon('id_lich_trinh_tour')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ngay_khoi_hanh')}>Ngày đi {renderSortIcon('ngay_khoi_hanh')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ngay_ket_thuc')}>Ngày về {renderSortIcon('ngay_ket_thuc')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('gia_tien')}>Giá {renderSortIcon('gia_tien')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Chỗ (TĐ/Đã đặt)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSort('trang_thai_lich_trinh')}>Trạng thái {renderSortIcon('trang_thai_lich_trinh')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-theme-border'>
                            {filteredSchedules.map((schedule) => ( // Sử dụng filteredSchedules
                                <motion.tr
                                    key={schedule.id_lich_trinh_tour}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className='hover:bg-theme-background cursor-pointer'
                                    onClick={() => {
                                        console.log("Row clicked in Table. Schedule data:", schedule);
                                        onViewDetails(schedule);
                                    }}
                                >
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary'>{schedule.id_lich_trinh_tour}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{formatDate(schedule.ngay_khoi_hanh)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{formatDate(schedule.ngay_ket_thuc)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{formatPrice(schedule.gia_tien)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>{schedule.so_luong_cho_toi_da} / {schedule.so_luong_cho_da_dat || 0}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${schedule.trang_thai_lich_trinh === 'Đang bán' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                                schedule.trang_thai_lich_trinh === 'Sắp mở bán' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                                                    schedule.trang_thai_lich_trinh === 'Hết chỗ' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100' :
                                                        schedule.trang_thai_lich_trinh === 'Đã hủy' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                                                            schedule.trang_thai_lich_trinh === 'Đang diễn ra' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100' :
                                                                schedule.trang_thai_lich_trinh === 'Đã kết thúc' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                            {schedule.trang_thai_lich_trinh}
                                        </span>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                                        {/* Tùy chọn: Thêm nút Eye nếu không muốn nhấp vào hàng */}
                                        {/* <button onClick={(e) => { e.stopPropagation(); onViewDetails(schedule); }} className='text-sky-500 hover:text-sky-400 mr-2 p-1' title="Xem chi tiết"><Eye size={18} /></button> */}
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(schedule); }} className='text-theme-primary hover:text-theme-primary-hover mr-2 p-1' title="Sửa"><Edit size={18} /></button>
                                        {schedule.trang_thai_lich_trinh !== 'Đã hủy' && schedule.trang_thai_lich_trinh !== 'Đã kết thúc' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleCancel(schedule.id_lich_trinh_tour, getScheduleIdentifier(schedule)); }} className='text-yellow-500 hover:text-yellow-400 mr-2 p-1' title="Hủy lịch trình"><CalendarX2 size={18} /></button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(schedule.id_lich_trinh_tour, getScheduleIdentifier(schedule)); }} className='text-red-500 hover:text-red-400 p-1' title="Xóa"><Trash2 size={18} /></button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default TourSchedulesTable;