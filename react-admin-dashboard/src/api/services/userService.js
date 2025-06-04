import api from '../axios'; // Your pre-configured axios instance

/**
 * Fetches all users from the backend.
 * @param {object} params - Query parameters for pagination, search, sort.
 * @param {number} params.page - Page number.
 * @param {number} params.limit - Items per page.
 * @param {string} params.searchTerm - Search term.
 * @param {string} params.sortBy - Field to sort by.
 * @param {string} params.order - Sort order ('ASC' or 'DESC').
 * @returns {Promise<object>} - The response from the API, typically { users: [], pagination: {} }.
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/api/users', { params });
    // Assuming the backend returns data in the structure: { success: true, message: "...", data: { users: [], pagination: {} } }
    // or for paginatedResponse: { success: true, message: "...", data: [], pagination: {} }
    // Adjust based on your actual backend paginatedResponse structure.
    // If paginatedResponse puts users directly in `data` and pagination alongside:
    if (response.data.success && response.data.data && Array.isArray(response.data.data.users)) {
      return {
        users: response.data.data.users,
        pagination: response.data.data.pagination,
      };
    }
    // If paginatedResponse puts users in `data` (as an array) and pagination in `pagination` field:
    if (response.data.success && Array.isArray(response.data.data) && response.data.pagination) {
        return {
            users: response.data.data,
            pagination: response.data.pagination,
        };
    }
    // Fallback or if structure is different, you might need to adjust
    // For now, let's assume the backend's paginatedResponse utility wraps users and pagination inside a 'data' object.
    // If your `paginatedResponse` directly returns `{ data: [usersArray], pagination: {}, ... }`
    // then `response.data.data` would be the users array.
    // Let's stick to a common pattern: API returns { success, message, data: { users, pagination } }
    // Or, if your controller uses `paginatedResponse(res, message, result.users, result.pagination);`
    // then the structure is likely `res.json({ success: true, message, data: usersArray, pagination: paginationObject })`
    // So, `response.data.data` is the array of users, and `response.data.pagination` is the pagination object.
     if (response.data.success && Array.isArray(response.data.data) && response.data.pagination) {
      return {
        users: response.data.data,
        pagination: response.data.pagination,
      };
    }
    // If the backend directly returns { users: [], pagination: {} } inside response.data.data
     if (response.data.success && response.data.data && Array.isArray(response.data.data.users)) {
      return response.data.data; // { users: [], pagination: {} }
    }
    // Defaulting to a structure where users are directly in data and pagination is separate
    // This matches the getAllUsers controller using `paginatedResponse(res, 'Lấy danh sách người dùng thành công.', result.users, result.pagination);`
    // which likely means response.data = { success: true, message: '...', data: result.users, pagination: result.pagination }
    return {
        users: response.data.data || [],
        pagination: response.data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Creates a new user.
 * @param {FormData} userData - User data as FormData (to support file uploads).
 * Backend expects: ten_dang_nhap, email_dang_nhap, mat_khau, vai_tro, url_anh_dai_dien (file)
 * @returns {Promise<object>} - The created user object.
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Backend controller returns: successResponse(res, 'Tạo người dùng thành công.', newUser, 201);
    // So, newUser is in response.data.data
    return response.data; // Expected: { success: true, message: "...", data: newUserObject }
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Updates an existing user.
 * @param {string|number} userId - The ID of the user to update (id_nguoi_dung).
 * @param {FormData} userData - User data as FormData.
 * Backend expects fields like: ten_dang_nhap, email_dang_nhap, vai_tro, url_anh_dai_dien (file)
 * @returns {Promise<object>} - The API response message.
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Backend controller returns: successResponse(res, result.message);
    // So, response.data will be { success: true, message: "..." }
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Deletes a user (soft delete).
 * @param {string|number} userId - The ID of the user to delete (id_nguoi_dung).
 * @returns {Promise<object>} - The API response message.
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
    // Backend controller returns: successResponse(res, result.message);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Fetches a single user by ID.
 * @param {string|number} userId - The ID of the user (id_nguoi_dung).
 * @returns {Promise<object>} - The user object.
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    // Backend controller returns: successResponse(res, 'Lấy thông tin người dùng thành công.', user);
    // So, user object is in response.data.data
    return response.data; // Expected: { success: true, message: "...", data: userObject }
  } catch (error) {
    console.error('Error fetching user by ID:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Add other user-related services if needed, e.g., changeUserStatus, resetPassword
// export const changeUserStatus = async (userId, isActive) => { ... };
// export const resetPassword = async (userId, newPassword) => { ... };