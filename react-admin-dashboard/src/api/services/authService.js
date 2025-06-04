import api from '../axios';

export const loginAdmin = async (credentials) => {
  try {
    // Backend expects 'loginIdentifier' and 'mat_khau'
    const payload = {
      loginIdentifier: credentials.username, // Assuming 'username' from LoginPage can be username or email
      mat_khau: credentials.password,
    };
    console.log('Sending login payload:', payload);
    const response = await api.post('/api/auth/login', payload); // Endpoint seems to be /api/admin/login based on your backend structure

    console.log('Login API Response:', response.data);

    // Backend response structure: { success: true, message: "...", data: { token: "...", user: { id_nguoi_dung, ten_dang_nhap, email_dang_nhap, vai_tro } } }
    if (response.data.success && response.data.data && response.data.data.token) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);

      // Store user information if needed
      if (user) {
        localStorage.setItem('user', JSON.stringify(user)); // Store the whole user object
        localStorage.setItem('userRole', user.vai_tro || 'user'); // Default to 'user' if vai_tro is not present
        localStorage.setItem('userId', user.id_nguoi_dung);
        localStorage.setItem('username', user.ten_dang_nhap);
      } else {
        // Fallback if user object is not directly available but role might be elsewhere (less likely with current backend)
        localStorage.setItem('userRole', 'admin'); // Or derive from token if possible/needed
      }
      return true;
    }
    // If success is false or token is missing in the expected place
    console.error('Login failed:', response.data.message || 'Token or user data missing in response.');
    return false;
  } catch (error) {
    console.error('Đăng nhập thất bại:', error.response?.data || error.message || error);
    // Rethrow the error so the component can catch it and display a message
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