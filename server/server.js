require('dotenv').config();
console.log("MONGO_URI =", process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB()
  .then(() => {
      console.log("Database connected successfully 🚀");
  })
  .catch((err) => {
      console.log("DB Connection Error ❌", err);
  });
console.log("Initializing server...");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get("/rooms", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/rooms.html"));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/booking.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});

module.exports = app;
