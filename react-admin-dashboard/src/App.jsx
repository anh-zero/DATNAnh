import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/common/Sidebar";
import UsersPage from "./pages/UsersPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import SalesPage from "./pages/SalesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import OverviewPage from "./pages/OverviewPage";
import ToursPage from './pages/ToursPage';
import TourSchedulesPage from './pages/TourSchedulesPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Routes>
      {/* Route đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Route mặc định - chuyển hướng dựa trên trạng thái đăng nhập */}
      <Route
        path="/"
        element={
          isAuthenticated ?
            <Navigate to="/overview" replace /> :
            <Navigate to="/login" replace />
        }
      />

      {/* Các routes được bảo vệ */}
      <Route path='/overview' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <OverviewPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path='/users' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <UsersPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path='/customers' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <CustomersPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path='/orders' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <OrdersPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path='/sales' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <SalesPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path='/analytics' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <AnalyticsPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      <Route path='/settings' element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <SettingsPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/tours" element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <ToursPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/tours/:tourId/schedules" element={
        isAuthenticated ? (
          <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
            <Sidebar />
            <TourSchedulesPage />
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Fallback cho các route không hợp lệ */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;