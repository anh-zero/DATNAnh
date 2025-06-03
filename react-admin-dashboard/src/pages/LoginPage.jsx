import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/services/authService';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      console.log('Gửi request đăng nhập với:', credentials);

      const success = await loginAdmin(credentials);

      if (success) {
        console.log('Đăng nhập thành công - chuyển hướng');
        // Thêm timeout nhỏ để đảm bảo token đã được lưu trước khi chuyển trang
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      }
    } catch (err) {
      console.error('Lỗi khi đăng nhập:', err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-background">
      <motion.div
        className="bg-theme-surface0 bg-opacity-50 backdrop-blur-md p-8 rounded-lg shadow-lg border border-theme-border w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Đăng nhập Admin</h2>

        {error && (
          <motion.div
            className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-theme-text-secondary mb-2" htmlFor="username">Username</label>
            <input
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-theme-text-secondary mb-2" htmlFor="password">Password</label>
            <input
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-200 ${isLoading ? 'bg-indigo-800 cursor-not-allowed' : 'bg-theme-primary hover:bg-indigo-700'
              }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;