const Room = require('../models/Room');

const roomController = {
    getAllRooms: async (req, res) => {
        try {
            const { type, status, minPrice, maxPrice, capacity } = req.query;
            
            let query = {};

            if (type) {
                query.type = type.toLowerCase();
            }

            if (status) {
                query.status = status.toLowerCase();
            }

            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = parseInt(minPrice);
                if (maxPrice) query.price.$lte = parseInt(maxPrice);
            }

            if (capacity) {
                query.capacity = { $gte: parseInt(capacity) };
            }

            const rooms = await Room.find(query).sort({ createdAt: -1 });

            res.json({
                success: true,
                count: rooms.length,
                data: { rooms }
            });
        } catch (error) {
            console.error('Get rooms error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch rooms',
                error: error.message
            });
        }
    },

    getRoomById: async (req, res) => {
        try {
            const room = await Room.findById(req.params.id);

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }

            res.json({
                success: true,
                data: { room }
            });
        } catch (error) {
            console.error('Get room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch room',
                error: error.message
            });
        }
    },

    createRoom: async (req, res) => {
        try {
            const { roomNumber, name, type, description, price, capacity, amenities, floor } = req.body;

            if (!roomNumber || !name || !type || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide room number, name, type, and price'
                });
            }

            const existingRoom = await Room.findOne({ roomNumber });
            if (existingRoom) {
                return res.status(400).json({
                    success: false,
                    message: 'Room number already exists'
                });
            }

            const room = await Room.create({
                roomNumber,
                name,
                type: type.toLowerCase(),
                description: description || '',
                price,
                capacity: capacity || 2,
                amenities: amenities || [],
                floor: floor || 1,
                status: 'available'
            });

            res.status(201).json({
                success: true,
                message: 'Room created successfully',
                data: { room }
            });
        } catch (error) {
            console.error('Create room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create room',
                error: error.message
            });
        }
    },

    updateRoom: async (req, res) => {
        try {
            const { roomNumber, name, type, description, price, capacity, amenities, status, floor } = req.body;
            
            let room = await Room.findById(req.params.id);

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }

            if (roomNumber && roomNumber !== room.roomNumber) {
                const existingRoom = await Room.findOne({ roomNumber });
                if (existingRoom) {
                    return res.status(400).json({
                        success: false,
                        message: 'Room number already exists'
                    });
                }
            }

            if (roomNumber) room.roomNumber = roomNumber;
            if (name) room.name = name;
            if (type) room.type = type.toLowerCase();
            if (description !== undefined) room.description = description;
            if (price !== undefined) room.price = price;
            if (capacity) room.capacity = capacity;
            if (amenities) room.amenities = amenities;
            if (status) room.status = status.toLowerCase();
            if (floor) room.floor = floor;

            await room.save();

            res.json({
                success: true,
                message: 'Room updated successfully',
                data: { room }
            });
        } catch (error) {
            console.error('Update room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update room',
                error: error.message
            });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const room = await Room.findById(req.params.id);

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }

            await Room.deleteOne({ _id: req.params.id });

            res.json({
                success: true,
                message: 'Room deleted successfully'
            });
        } catch (error) {
            console.error('Delete room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete room',
                error: error.message
            });
        }
    },

    getAvailableRooms: async (req, res) => {
        try {
            const { checkIn, checkOut, type, capacity } = req.query;
            
            let query = { status: 'available' };

            if (type) {
                query.type = type.toLowerCase();
            }

            if (capacity) {
                query.capacity = { $gte: parseInt(capacity) };
            }

            const rooms = await Room.find(query).sort({ price: 1 });

            res.json({
                success: true,
                count: rooms.length,
                data: { rooms }
            });
        } catch (error) {
            console.error('Get available rooms error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch available rooms',
                error: error.message
            });
        }
    }
};

module.exports = roomController;
