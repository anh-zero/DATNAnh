const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Hàm helper để tạo thư mục nếu chưa tồn tại
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

// Cấu hình lưu trữ chung
const storageConfig = (destinationPath) => multer.diskStorage({
    destination: (req, file, cb) => {
        const fullPath = path.join('uploads', destinationPath);
        ensureDirectoryExistence(fullPath + '/'); // Đảm bảo thư mục tồn tại
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file theo loại (ví dụ: chỉ cho phép ảnh)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Tạo các instance multer cho các loại upload khác nhau
const uploadTourImage = multer({
    storage: storageConfig('tours'), // Lưu vào /uploads/tours
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn 5MB
});

const uploadLocationImage = multer({
    storage: storageConfig('locations'), // Lưu vào /uploads/locations
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});

const uploadUserAvatar = multer({
    storage: storageConfig('avatars'), // Lưu vào /uploads/avatars
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 2 } // Giới hạn 2MB
});


module.exports = {
    uploadTourImage,
    uploadLocationImage,
    uploadUserAvatar
};