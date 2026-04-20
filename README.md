# Hotel Management System

A full-stack hotel management system built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- **User Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Room Management**: Admin can add, edit, and delete rooms
- **Room Booking**: Users can browse and book available rooms
- **Admin Dashboard**: Complete management interface for rooms, bookings, and users
- **Double Booking Prevention**: System prevents overlapping bookings for the same room

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt

## Project Structure

```
hotel-management-system/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── roomController.js  # Room management
│   │   ├── bookingController.js # Booking operations
│   │   └── adminController.js # Admin dashboard
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Room.js            # Room schema
│   │   └── Booking.js         # Booking schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth API routes
│   │   ├── roomRoutes.js      # Room API routes
│   │   ├── bookingRoutes.js   # Booking API routes
│   │   └── adminRoutes.js     # Admin API routes
│   ├── server.js              # Main server file
│   └── seed.js                # Database seeder
├── public/
│   ├── css/
│   │   ├── style.css          # Main styles
│   │   └── admin.css          # Admin dashboard styles
│   ├── js/
│   │   ├── auth.js            # Authentication helpers
│   │   ├── main.js             # Homepage logic
│   │   ├── rooms.js            # Rooms page logic
│   │   ├── booking.js          # Booking page logic
│   │   └── admin.js            # Admin dashboard logic
│   ├── index.html             # Homepage
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── rooms.html             # Rooms listing
│   ├── booking.html           # Booking page
│   └── admin.html             # Admin dashboard
├── .env                       # Environment variables
├── .env.example               # Example environment file
├── package.json               # Dependencies
└── README.md                  # Documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd hotel-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Or create a `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hotel_db
   JWT_SECRET=your_super_secret_jwt_key_hotel_management_2024
   JWT_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=10
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For Windows (if installed as service)
   net start MongoDB
   
   # For macOS with Homebrew
   brew services start mongodb-community
   
   # For Linux
   sudo systemctl start mongod
   ```

5. **Seed the database (optional but recommended)**
   ```bash
   npm run seed
   ```
   
   This will create:
   - Admin user: `admin@hotel.com` / `admin123`
   - Regular user: `john@example.com` / `user123`
   - Sample rooms
   - Sample booking

6. **Start the server**
   ```bash
   npm start
   ```

7. **Access the application**
   
   Open your browser and navigate to:
   - Homepage: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)

### Rooms (`/api/rooms`)
- `GET /` - Get all rooms (with optional filters)
- `GET /available` - Get available rooms
- `GET /:id` - Get room by ID
- `POST /` - Create room (admin only)
- `PUT /:id` - Update room (admin only)
- `DELETE /:id` - Delete room (admin only)

### Bookings (`/api/bookings`)
- `POST /` - Create booking (protected)
- `GET /my-bookings` - Get user's bookings (protected)
- `GET /:id` - Get booking by ID (protected)
- `PATCH /:id/cancel` - Cancel booking (protected)

### Admin (`/api/admin`)
- `GET /stats` - Get dashboard statistics (admin only)
- `GET /users` - Get all users (admin only)
- `GET /bookings` - Get all bookings (admin only)
- `PATCH /bookings/:id` - Update booking status (admin only)
- `PATCH /users/:id/toggle-status` - Toggle user status (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## Usage

### For Regular Users
1. Register a new account or login
2. Browse available rooms on the Rooms page
3. Book a room with your preferred dates
4. View your bookings on the Booking page
5. Cancel bookings if needed

### For Administrators
1. Login with admin credentials (admin@hotel.com / admin123)
2. Access the Admin Dashboard
3. Manage rooms (add, edit, delete)
4. View and manage all bookings
5. Manage users (activate/deactivate)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Role-based access control (admin/user)
- Input validation

## Running in VS Code

1. Open the project folder in VS Code
2. Install the "MongoDB for VS Code" extension (optional)
3. Ensure MongoDB is running
4. Open a terminal (`Ctrl+``)
5. Run `npm install`
6. Run `npm run seed` to seed the database
7. Run `npm start` to start the server
8. Click on the local URL in the terminal to open in browser

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is installed and running
- Check the MONGODB_URI in `.env`
- For remote MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change the PORT in `.env` to a different number (e.g., 3001)
- Or stop the process using port 3000

### JWT Token Issues
- Clear browser localStorage
- Login again to get a new token

## License

MIT License
