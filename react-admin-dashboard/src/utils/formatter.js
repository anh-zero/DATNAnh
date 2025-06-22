// Format date with Intl.DateTimeFormat
export const formatDate = (
  dateString,
  options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

// Format time for inputs
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format currency
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format phone number to Vietnamese format
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Clean the input
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  // Return original if not standard format
  return phoneNumber;
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

// Get relative time (e.g., "2 giờ trước")
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
};

/**
 * Định dạng số tiền thành chuỗi tiền tệ với đơn vị VND
 * @param {number} amount - Số tiền cần định dạng
 * @param {string} currency - Đơn vị tiền tệ (mặc định là 'VND')
 * @returns {string} Chuỗi tiền tệ đã được định dạng
 */
// Cải thiện hàm formatCurrency để xử lý nhiều loại dữ liệu
export const formatCurrency = (value) => {
  // Thêm logging để debug
  console.log("formatCurrency input:", value, typeof value);

  if (value === null || value === undefined || value === '') {
    return '0 đ';
  }

  // Đảm bảo chuyển về số
  let numericValue = 0;

  try {
    if (typeof value === 'string') {
      // Xử lý chuỗi cẩn thận hơn
      const cleanValue = value.replace(/[^\d.-]/g, '');
      numericValue = parseFloat(cleanValue);
    } else {
      numericValue = parseFloat(value);
    }
  } catch (error) {
    console.error("Error parsing currency value:", value, error);
    return '0 đ';
  }

  // Kiểm tra lại sau khi parse
  if (isNaN(numericValue)) {
    console.warn("Invalid currency value after parsing:", value);
    return '0 đ';
  }

  // Kiểm tra nếu giá trị là 0
  if (numericValue === 0) {
    return '0 đ';
  }

  // Format theo tiền tệ Việt Nam
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
};