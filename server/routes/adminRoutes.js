const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, adminController.getDashboardStats);
router.get('/users', protect, admin, adminController.getAllUsers);
router.get('/bookings', protect, admin, adminController.getAllBookings);
router.patch('/bookings/:id', protect, admin, adminController.updateBookingStatus);
router.patch('/users/:id/toggle-status', protect, admin, adminController.toggleUserStatus);
router.delete('/users/:id', protect, admin, adminController.deleteUser);

module.exports = router;
