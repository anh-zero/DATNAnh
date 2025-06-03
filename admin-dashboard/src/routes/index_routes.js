const express = require('express');
const authRoutes = require('./auth_routes');
const userRoutes = require('./user_routes');
const customerRoutes = require('./customer_routes');
const partnerRoutes = require('./partner_routes');
const tourRoutes = require('./tour_routes');
const bookingRoutes = require('./booking_routes');
const tourReviewRoutes = require('./tour_review_routes'); 
// const locationRoutes = require('./location_routes');
// const overviewRoutes = require('./overview_routes'); // Giữ lại nếu đã có

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/partners', partnerRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', tourReviewRoutes);
// router.use('/locations', locationRoutes);
// router.use('/overview', overviewRoutes); // Giữ lại nếu đã có

module.exports = router;