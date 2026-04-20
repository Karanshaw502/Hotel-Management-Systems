const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, phone } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide name, email, and password'
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            const user = await User.create({
                name,
                email,
                password,
                phone: phone || ''
            });

            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                error: error.message
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { name, phone } = req.body;
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (name) user.name = name;
            if (phone !== undefined) user.phone = phone;

            await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message
            });
        }
    }
};

module.exports = authController;
