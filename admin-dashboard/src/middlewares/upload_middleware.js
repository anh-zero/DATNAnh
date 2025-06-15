const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Hàm để đảm bảo thư mục tồn tại
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

// Cấu hình lưu trữ cho Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Xác định thư mục lưu trữ dựa trên loại file hoặc route (tùy chỉnh nếu cần)
        // Ví dụ: lưu avatar vào 'public/uploads/avatars/'
        // Ví dụ: lưu ảnh bìa tour vào 'public/uploads/tour_covers/'
        let uploadPath = 'uploads/others/'; // Thư mục mặc định

        if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/avatars/';
        } else if (file.fieldname === 'url_anh_bia') { // Giả sử fieldname cho ảnh bìa tour
            uploadPath = 'uploads/tour_covers/';
        }
        // Đảm bảo thư mục tồn tại trước khi lưu
        ensureDirectoryExistence(path.join(__dirname, '..', '..', uploadPath, 'file.txt')); // 'file.txt' chỉ để lấy dirname
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc file (tùy chọn, ví dụ chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Chỉ chấp nhận file ảnh
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên file ảnh!'), false);
    }
};

// Khởi tạo Multer với cấu hình storage và fileFilter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Giới hạn kích thước file 5MB
    },
    fileFilter: fileFilter
});

// Export instance của multer đã được cấu hình
// Khi bạn require file này, bạn sẽ nhận được đối tượng 'upload' này
// và có thể gọi upload.single(), upload.array(), v.v.
module.exports = upload;