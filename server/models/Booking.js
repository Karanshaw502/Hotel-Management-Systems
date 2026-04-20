const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room is required']
    },
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'At least 1 guest is required'],
        max: [10, 'Maximum 10 guests allowed']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Price cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        trim: true,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

bookingSchema.index({ user: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });

bookingSchema.pre('save', function(next) {
    if (this.checkOutDate <= this.checkInDate) {
        const error = new Error('Check-out date must be after check-in date');
        return next(error);
    }
    next();
});

bookingSchema.virtual('nights').get(function() {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
