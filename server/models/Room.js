const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Room type is required'],
        enum: ['standard', 'deluxe', 'suite', 'presidential'],
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        default: 2
    },
    amenities: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    floor: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ price: 1 });

module.exports = mongoose.model('Room', roomSchema);
