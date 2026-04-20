require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        await Booking.deleteMany({});
        await Room.deleteMany({});
        await User.deleteMany({});

        console.log('Cleared existing data...');

        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@hotel.com',
            password: adminPassword,
            phone: '1234567890',
            role: 'admin'
        });

        const userPassword = await bcrypt.hash('user123', 10);
        const user1 = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: userPassword,
            phone: '9876543210',
            role: 'user'
        });

        const user2 = await User.create({
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: userPassword,
            phone: '5555555555',
            role: 'user'
        });

        console.log('Created users...');

        const rooms = await Room.create([
            {
                roomNumber: '101',
                name: 'Standard Room',
                type: 'standard',
                description: 'Comfortable standard room with all basic amenities',
                price: 100,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'],
                status: 'available',
                floor: 1
            },
            {
                roomNumber: '102',
                name: 'Standard Room',
                type: 'standard',
                description: 'Cozy standard room with city view',
                price: 120,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
                status: 'available',
                floor: 1
            },
            {
                roomNumber: '201',
                name: 'Deluxe Room',
                type: 'deluxe',
                description: 'Spacious deluxe room with premium amenities',
                price: 200,
                capacity: 3,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Work Desk'],
                status: 'available',
                floor: 2
            },
            {
                roomNumber: '202',
                name: 'Deluxe Room',
                type: 'deluxe',
                description: 'Elegant deluxe room with ocean view',
                price: 220,
                capacity: 3,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Bathtub'],
                status: 'available',
                floor: 2
            },
            {
                roomNumber: '301',
                name: 'Executive Suite',
                type: 'suite',
                description: 'Luxurious suite with separate living area',
                price: 350,
                capacity: 4,
                amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Bathtub', 'Living Room', 'Kitchen'],
                status: 'available',
                floor: 3
            },
            {
                roomNumber: '302',
                name: 'Executive Suite',
                type: 'suite',
                description: 'Premium suite with panoramic city views',
                price: 380,
                capacity: 4,
                amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Living Room', 'Kitchen', 'Butler Service'],
                status: 'available',
                floor: 3
            },
            {
                roomNumber: '401',
                name: 'Presidential Suite',
                type: 'presidential',
                description: 'Ultimate luxury presidential suite',
                price: 600,
                capacity: 6,
                amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Multiple Balconies', 'Jacuzzi', 'Living Room', 'Full Kitchen', 'Butler Service', 'Private Terrace', 'Dining Room'],
                status: 'available',
                floor: 4
            },
            {
                roomNumber: '402',
                name: 'Presidential Suite',
                type: 'presidential',
                description: 'Exclusive presidential suite with garden access',
                price: 650,
                capacity: 6,
                amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Multiple Balconies', 'Private Pool', 'Living Room', 'Full Kitchen', 'Butler Service', 'Private Terrace', 'Dining Room', 'Spa Access'],
                status: 'available',
                floor: 4
            }
        ]);

        console.log('Created rooms...');

        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 5);
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 7);

        const booking = await Booking.create({
            user: user1._id,
            room: rooms[2]._id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guests: 2,
            totalPrice: 400,
            status: 'confirmed',
            specialRequests: 'Late check-in requested',
            paymentStatus: 'paid'
        });

        await Room.findByIdAndUpdate(rooms[2]._id, { status: 'booked' });

        console.log('Created sample booking...');

        console.log('\n=== Seed Data Complete ===');
        console.log('\nAdmin Credentials:');
        console.log('Email: admin@hotel.com');
        console.log('Password: admin123');
        console.log('\nUser Credentials:');
        console.log('Email: john@example.com');
        console.log('Password: user123');
        console.log('\n===========================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
