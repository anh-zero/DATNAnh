import React from 'react';
import BookingsTable from '../components/bookings/BookingsTable';

const BookingsPage = () => {
    return (
        <div className="flex-1 overflow-y-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">Quản lý đặt tour</h1>
            <div className="bg-theme-surface rounded-lg shadow-sm border border-theme-border">
                <BookingsTable />
            </div>
        </div>
    );
};

export default BookingsPage;