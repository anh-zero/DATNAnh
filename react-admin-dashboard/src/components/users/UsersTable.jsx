import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../api/services/userService";
import UserFormModal from "./UserFormModal";

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      console.log('Users data response:', response);

      // Kiểm tra cấu trúc dữ liệu
      const userData = Array.isArray(response) ? response :
        (response.data ? response.data : []);

      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      setError('Không thể tải dữ liệu người dùng: ' + (err.message || 'Lỗi không xác định'));
      console.error('User loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) => user.username?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (username) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUser(username);
        // Cập nhật lại danh sách users sau khi xóa
        setUsers(users.filter(user => user.username !== username));
        setFilteredUsers(filteredUsers.filter(user => user.username !== username));
      } catch (err) {
        alert('Không thể xóa người dùng');
        console.error(err);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null); // Đặt null để biết là tạo mới
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user); // Đặt user hiện tại để biết là chỉnh sửa
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setError(null); // Clear previous errors
    try {
      if (selectedUser) {
        // Chỉnh sửa user
        console.log('UsersTable: Updating user. Original username:', selectedUser.username);
        console.log('UsersTable: Form data being sent to API:', formData); // LOG 1: formData có username mới không?

        const response = await updateUser(selectedUser.username, formData);
        console.log('UsersTable: API response for updated user:', response); // LOG 2: Toàn bộ response từ API là gì?

        const updatedUserObject = response.data;
        console.log('UsersTable: Extracted updated user object from API response:', updatedUserObject); // LOG 3: updatedUserObject có username mới không?

        if (response.success && updatedUserObject && updatedUserObject.username) {
          console.log('UsersTable: Current selectedUser before map:', selectedUser); // LOG 5: Kiểm tra selectedUser
          const newUsersList = users.map(user => {
            // Match by the original username to find the user to update
            if (user.username === selectedUser.username) { // So sánh với username GỐC
              console.log('UsersTable: Updating user in local state. Old:', user, 'Applying:', updatedUserObject);
              return { ...user, ...updatedUserObject };
            }
            return user;
          });
          console.log('UsersTable: New users list after map:', newUsersList); // LOG 4
          setUsers(newUsersList);

          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            setFilteredUsers(newUsersList.filter(
              (u) => u.username?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
            ));
          } else {
            setFilteredUsers(newUsersList);
          }
          // setIsModalOpen(false); // Close modal on success
          // setSelectedUser(null);
        } else {
          console.error('UsersTable: Failed to update user or critical user data (like username) missing in API response.', response);
          setError('Không thể cập nhật người dùng. Dữ liệu trả về không hợp lệ hoặc thiếu thông tin username.');
        }
      } else {
        // Tạo mới user (logic này đã được sửa ở lần trước)
        const response = await createUser(formData);
        console.log('API response for new user:', response);

        const newUserObject = response.data;
        console.log('Extracted new user object:', newUserObject);

        if (response.success && newUserObject) {
          setUsers(prevUsers => {
            const userToAdd = {
              username: newUserObject.username,
              email: newUserObject.email,
            };
            const updatedUsersList = [...prevUsers, userToAdd];
            console.log('Updated users list:', updatedUsersList);

            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              setFilteredUsers(updatedUsersList.filter(
                (u) => u.username?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
              ));
            } else {
              setFilteredUsers(updatedUsersList);
            }
            return updatedUsersList;
          });
        } else {
          console.error('Failed to create user or user data missing in response', response);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu user:', error);
      // Cân nhắc ném lỗi để UserFormModal có thể xử lý nếu cần, hoặc hiển thị thông báo lỗi tại đây
      // throw error; 
      setError('Lỗi khi lưu người dùng: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
    }
  };

  return (
    <motion.div
      className='bg-theme-surface shadow-lg rounded-xl p-6 border border-theme-border relative z-20'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-theme-text-primary'>Người dùng</h2>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Tìm kiếm người dùng...'
              className='bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-secondary rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary'
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className='absolute left-3 top-2.5 text-theme-text-secondary' size={18} />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className='flex items-center bg-theme-primary hover:bg-theme-primary-hover text-white px-4 py-2 rounded-lg transition duration-200'
          >
            <UserPlus size={18} className='mr-2' />
            Thêm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-theme-text-secondary">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-25 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-theme-border'>
            <thead>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  Username
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-theme-border'>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.username}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className='hover:bg-theme-background'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary'>
                    {user.username}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary'>
                    <button
                      className='text-theme-primary hover:text-theme-primary-hover mr-2'
                      onClick={() => handleOpenEditModal(user)}
                    >
                      Sửa
                    </button>
                    <button
                      className='text-red-500 hover:text-red-400'
                      onClick={() => handleDelete(user.username)}
                    >
                      Xóa
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <UserFormModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </motion.div>
  );
};

export default UsersTable;