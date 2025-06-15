const express = require('express');
const router = express.Router();

// Import các modules routes
// Giả định file index_routes.js này nằm trong thư mục src/routes
const authRoutes = require('./auth_routes');
const userRoutes = require('./nguoidung_routes'); // Đúng tên file cho người dùng
const customerRoutes = require('./khachhang_routes'); // CẦN KIỂM TRA: Đảm bảo bạn có file khachhang_routes.js cho khách hàng
const partnerRoutes = require('./doitac_routes');
const tourRoutes = require('./sanphamtour_routes');
const bookingRoutes = require('./dattour_routes');
const tourReviewRoutes = require('./danhgiatour_routes');
const locationRoutes = require('./diadiem_routes');
const scheduleStandaloneRoutes = require('./lichtrinhtour_standalone_routes');
const providedServiceStandaloneRoutes = require('./dichvutour_standalone_routes');
const activityStandaloneRoutes = require('./hoatdongtour_standalone_routes');
const participantRoutes = require('./nguoithamgiatrongdattour_standalone_routes'); // Thêm dòng này vào phần import routes
// const overviewRoutes = require('./overview_routes'); // Bỏ comment nếu bạn có và sử dụng file này

// Sử dụng các routes với router (không phải app)

router.use('/auth', authRoutes);
router.use('/nguoidung', userRoutes);
router.use('/khachhang', customerRoutes); // CẦN KIỂM TRA file khachhang_routes.js
router.use('/doitac', partnerRoutes);
router.use('/sanphamtour', tourRoutes); // tour_routes đã bao gồm lồng tour_schedule_routes
router.use('/dattour', bookingRoutes);
router.use('/danhgiatour', tourReviewRoutes);
router.use('/diadiem', locationRoutes);
router.use('/lichtrinhtour', scheduleStandaloneRoutes); // Endpoint riêng cho các thao tác trên schedule ID
router.use('/dichvutour', providedServiceStandaloneRoutes); // Endpoint riêng cho các thao tác trên provided service ID
router.use('/hoatdongtour', activityStandaloneRoutes); // Endpoint riêng cho các thao tác trên activity ID
router.use('/nguoithamgiatrongdattour', participantRoutes); // Thêm dòng này vào phần sử dụng routes
// router.use('/overview', overviewRoutes); // Bỏ comment nếu bạn có và sử dụng file này

module.exports = router;