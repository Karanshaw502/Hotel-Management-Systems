const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
