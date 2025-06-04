import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkAdminAuth } from "./api/services/authService";
import { getToken } from './api/services/authService';

import Sidebar from "./components/common/Sidebar";
import LoginPage from "./pages/LoginPage";

import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import CustomersPage from "./pages/CustomersPage";
import PartnersPage from "./pages/PartnersPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import SalesPage from "./pages/SalesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import OverviewPage from "./pages/OverviewPage";
// Component bảo vệ Route
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAdminAuth();
  
  // Kiểm tra token realtime
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.replace('/login');
    }
  }, []);
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);

  useEffect(() => {
    // Kiểm tra xem token có tồn tại không mỗi khi component được render
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(token !== null);
      
      // Nếu không có token, chuyển về login
      if (!token && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    };

    checkAuth();
    
    // Lắng nghe sự kiện storage để cập nhật state khi token thay đổi
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Kiểm tra token định kỳ (mỗi 30 giây)
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && isAuthenticated) {
        setIsAuthenticated(false);
        window.location.replace('/login');
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated]);

  // Layout cho các trang cần bảo vệ
  const ProtectedLayout = ({ children }) => (
  <div className='flex h-screen bg-theme-background text-theme-text-primary overflow-hidden'>
      <Sidebar />
      {children}
    </div>
  );

  return (
    <Routes>
      {/* Route đăng nhập - không cần bảo vệ */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes cần bảo vệ */}
      <Route path='/' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <OverviewPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='/products' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ProductsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='/users' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <UsersPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
            <Route path='/customers' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <CustomersPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='/partners' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <PartnersPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='/orders' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <OrdersPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
          <Route path='/sales' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SalesPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='/analytics' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <AnalyticsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />

      <Route path='/settings' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback cho các route không hợp lệ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;