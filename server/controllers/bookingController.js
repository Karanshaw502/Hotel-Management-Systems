const Booking = require('../models/Booking');
const Room = require('../models/Room');

const bookingController = {
    createBooking: async (req, res) => {
        try {
            const { roomId, checkInDate, checkOutDate, guests, specialRequests } = req.body;

            if (!roomId || !checkInDate || !checkOutDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide room, check-in date, and check-out date'
                });
            }

            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);

            if (checkOut <= checkIn) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-out date must be after check-in date'
                });
            }

            if (checkIn < new Date().setHours(0, 0, 0, 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-in date cannot be in the past'
                });
            }

            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }

            if (room.status === 'booked') {
                return res.status(400).json({
                    success: false,
                    message: 'Room is already booked'
                });
            }

            const existingBooking = await Booking.findOne({
                room: roomId,
                status: { $in: ['pending', 'confirmed', 'checked-in'] },
                $or: [
                    {
                        checkInDate: { $lte: checkIn },
                        checkOutDate: { $gt: checkIn }
                    },
                    {
                        checkInDate: { $lt: checkOut },
                        checkOutDate: { $gte: checkOut }
                    },
                    {
                        checkInDate: { $gte: checkIn },
                        checkOutDate: { $lte: checkOut }
                    }
                ]
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: 'Room is already booked for these dates'
                });
            }

            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const totalPrice = nights * room.price;

            const booking = await Booking.create({
                user: req.user._id,
                room: roomId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests: guests || 1,
                totalPrice,
                specialRequests: specialRequests || '',
                status: 'confirmed',
                paymentStatus: 'pending'
            });

            await Room.findByIdAndUpdate(roomId, { status: 'booked' });

            const populatedBooking = await Booking.findById(booking._id)
                .populate('user', 'name email phone')
                .populate('room', 'roomNumber name type price');

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking: populatedBooking,
                    nights,
                    totalPrice
                }
            });
        } catch (error) {
            console.error('Create booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    },

    getUserBookings: async (req, res) => {
        try {
            const bookings = await Booking.find({ user: req.user._id })
                .populate('room', 'roomNumber name type price images')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                count: bookings.length,
                data: { bookings }
            });
        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings',
                error: error.message
            });
        }
    },

    getBookingById: async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id)
                .populate('user', 'name email phone')
                .populate('room', 'roomNumber name type price description amenities');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this booking'
                });
            }

            res.json({
                success: true,
                data: { booking }
            });
        } catch (error) {
            console.error('Get booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch booking',
                error: error.message
            });
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to cancel this booking'
                });
            }

            if (booking.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking is already cancelled'
                });
            }

            if (booking.status === 'checked-out') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel a completed booking'
                });
            }

            booking.status = 'cancelled';
            await booking.save();

            await Room.findByIdAndUpdate(booking.room, { status: 'available' });

            res.json({
                success: true,
                message: 'Booking cancelled successfully',
                data: { booking }
            });
        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel booking',
                error: error.message
            });
        }
    }
};

module.exports = bookingController;
