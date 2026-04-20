const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments({ role: 'user' });
            const totalRooms = await Room.countDocuments();
            const availableRooms = await Room.countDocuments({ status: 'available' });
            const bookedRooms = await Room.countDocuments({ status: 'booked' });
            const totalBookings = await Booking.countDocuments();
            const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
            const pendingBookings = await Booking.countDocuments({ status: 'pending' });

            const recentBookings = await Booking.find()
                .populate('user', 'name email')
                .populate('room', 'roomNumber name')
                .sort({ createdAt: -1 })
                .limit(5);

            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5);

            res.json({
                success: true,
                data: {
                    stats: {
                        users: {
                            total: totalUsers,
                        },
                        rooms: {
                            total: totalRooms,
                            available: availableRooms,
                            booked: bookedRooms
                        },
                        bookings: {
                            total: totalBookings,
                            confirmed: confirmedBookings,
                            pending: pendingBookings
                        }
                    },
                    recentBookings,
                    recentUsers
                }
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard stats',
                error: error.message
            });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, role, search } = req.query;
            
            let query = {};
            
            if (role) {
                query.role = role;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await User.find(query)
                .sort({ createdAt: -1 })
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit));

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / parseInt(limit)),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
                error: error.message
            });
        }
    },

    getAllBookings: async (req, res) => {
        try {
            const { page = 1, limit = 10, status, search } = req.query;
            
            let query = {};

            if (status) {
                query.status = status;
            }

            if (search) {
                const bookings = await Booking.find()
                    .populate('user', 'name email')
                    .populate('room', 'roomNumber name');

                const filtered = bookings.filter(b => 
                    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                    b.room?.roomNumber?.toLowerCase().includes(search.toLowerCase())
                );

                return res.json({
                    success: true,
                    data: {
                        bookings: filtered,
                        pagination: {
                            current: 1,
                            pages: 1,
                            total: filtered.length
                        }
                    }
                });
            }

            const bookings = await Booking.find(query)
                .populate('user', 'name email phone')
                .populate('room', 'roomNumber name type price')
                .sort({ createdAt: -1 })
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit));

            const total = await Booking.countDocuments(query);

            res.json({
                success: true,
                data: {
                    bookings,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / parseInt(limit)),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Get all bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings',
                error: error.message
            });
        }
    },

    updateBookingStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, paymentStatus } = req.body;

            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            if (status) {
                booking.status = status;

                if (status === 'cancelled' || status === 'checked-out') {
                    await Room.findByIdAndUpdate(booking.room, { status: 'available' });
                }
            }

            if (paymentStatus) {
                booking.paymentStatus = paymentStatus;
            }

            await booking.save();

            const populatedBooking = await Booking.findById(booking._id)
                .populate('user', 'name email')
                .populate('room', 'roomNumber name');

            res.json({
                success: true,
                message: 'Booking updated successfully',
                data: { booking: populatedBooking }
            });
        } catch (error) {
            console.error('Update booking status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update booking',
                error: error.message
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.role === 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete admin users'
                });
            }

            await User.deleteOne({ _id: req.params.id });

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    },

    toggleUserStatus: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.role === 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot deactivate admin users'
                });
            }

            user.isActive = !user.isActive;
            await user.save();

            res.json({
                success: true,
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { user }
            });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: error.message
            });
        }
    }
};

module.exports = adminController;
