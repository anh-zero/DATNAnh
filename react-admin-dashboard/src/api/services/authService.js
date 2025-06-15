import api from '../axios';

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    console.log('[authService] Token set in localStorage:', token ? `${token.substring(0, 20)}...` : 'No token was provided to setToken');
  } else {
    localStorage.removeItem('token');
    console.log('[authService] Token removed from localStorage via setToken.');
  }
};

export const loginAdmin = async (credentials) => {
  const { username, password } = credentials;
  // Backend expects loginIdentifier and mat_khau
  const payload = {
    loginIdentifier: username, // Assuming username can be email or ten_dang_nhap
    mat_khau: password,
  };
  console.log('[authService] Sending login payload:', payload);

  try {
    const response = await api.post('api/auth/login', payload);
    console.log('[authService] Login API Response:', response.data);

    if (response.data && response.data.success && response.data.data && response.data.data.token) {
      const token = response.data.data.token;
      const user = response.data.data.user;

      setToken(token); // This will now log when token is set

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.vai_tro || 'user');
        localStorage.setItem('userId', user.id_nguoi_dung);
        localStorage.setItem('username', user.ten_dang_nhap);
        console.log('[authService] User details stored in localStorage for:', user.ten_dang_nhap);
      } else {
        console.warn('[authService] User object missing in login response data.');
        // Fallback or default role setting if necessary, though backend should provide user details
        localStorage.setItem('userRole', 'admin');
      }
      return true;
    }
    console.error('[authService] Login failed due to unsuccessful response or missing token/user data:', response.data.message || 'No specific message.');
    return false;
  } catch (error) {
    console.error('[authService] Đăng nhập thất bại (exception):', error.response?.data || error.message || error);
    throw error.response?.data || error;
  }
};

// Thêm function logout
export const logoutAdmin = () => {
  // Xóa tất cả thông tin authentication
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');

  // Chuyển hướng về trang login
  window.location.replace('/login');
};

// Kiểm tra token có hợp lệ không
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Nếu bạn sử dụng JWT, có thể decode và kiểm tra expiry
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // return payload.exp * 1000 > Date.now();
    return true;
  } catch (error) {
    return false;
  }
};

// You can add a function to get current user info from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  }
  return null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};


export const checkAdminAuth = () => {
  const token = getToken();
  const userRole = localStorage.getItem('userRole');
  // Add more sophisticated checks if needed (e.g., token expiration, API call to validate token)
  return !!token && userRole === 'admin'; // Example: checks for token and admin role
};