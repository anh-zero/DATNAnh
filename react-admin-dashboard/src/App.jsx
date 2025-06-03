import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkAdminAuth } from "./api/services/authService";

import Sidebar from "./components/common/Sidebar";
import LoginPage from "./pages/LoginPage";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import PartnersPage from "./pages/PartnersPage";
import OrdersPage from "./pages/OrdersPage";
import SalesPage from "./pages/SalesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// Component bảo vệ Route
const ProtectedRoute = ({ children }) => {
   const isAuthenticated = checkAdminAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);

  useEffect(() => {
    // Kiểm tra xem token có tồn tại không mỗi khi component được render
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('token') !== null);
    };

    checkAuth();
    // Lắng nghe sự kiện storage để cập nhật state khi token thay đổi
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

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
            {/* <OverviewPage /> */}
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