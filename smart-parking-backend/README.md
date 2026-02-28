# 🚗 Smart Parking Backend API

A comprehensive event-driven parking platform backend built with Node.js, Express, MongoDB, and Cloudinary.

## 🚀 Features

- ✅ JWT-based authentication with role management (Driver, Owner, Admin)
- ✅ Pre-booking system with QR code generation
- ✅ Dynamic pricing based on demand
- ✅ Real-time spot search with geolocation
- ✅ Image upload via Cloudinary
- ✅ Overstay auto-charge calculation
- ✅ Email notifications (Brevo/Nodemailer)
- ✅ Owner earnings dashboard
- ✅ Admin verification panel
- ✅ Rating and review system
- ✅ Find My Car GPS feature
- ✅ In-app notification system

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Brevo/SMTP email account

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   cd smart-parking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your actual credentials:
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
smart-parking-backend/
├── config/
│   ├── cloudinary.js       # Cloudinary configuration
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── adminController.js        # Admin panel actions
│   ├── authController.js         # Authentication logic
│   ├── bookingController.js      # Booking management
│   ├── driverController.js       # Driver-specific features
│   ├── notificationController.js # Notification system
│   └── ownerController.js        # Owner dashboard
├── middleware/
│   ├── authMiddleware.js   # JWT verification & role checks
│   ├── errorMiddleware.js  # Global error handler
│   └── upload.js           # File upload handlers
├── models/
│   ├── Booking.js          # Booking schema
│   ├── Notification.js     # Notification schema
│   ├── ParkingSpot.js      # Parking spot schema
│   └── User.js             # User schema
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── driverRoutes.js
│   ├── notificationRoutes.js
│   ├── ownerRoutes.js
│   └── spotRoutes.js
├── utils/
│   ├── dynamicPricing.js   # Demand-based pricing calculation
│   ├── fileUpload.js       # Cloudinary upload helper
│   ├── generateQR.js       # QR code generation
│   ├── generateToken.js    # JWT token generator
│   └── sendEmail.js        # Email utility (Nodemailer)
├── .env.example            # Environment variables template
├── package.json
└── server.js               # Main application entry point
```

## 🔑 Environment Variables

Create a `.env` file with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/smart-parking

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_smtp_key
EMAIL_FROM="Smart Parking <no-reply@smartparking.com>"

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint                  | Description              | Access |
|--------|---------------------------|--------------------------|--------|
| POST   | `/register`               | Register new user        | Public |
| POST   | `/login`                  | Login user               | Public |
| POST   | `/logout`                 | Logout user              | Public |
| POST   | `/forgot-password`        | Request password reset   | Public |
| PUT    | `/reset-password/:token`  | Reset password           | Public |

### **Owner Routes** (`/api/owner`)

| Method | Endpoint                | Description                  | Access |
|--------|-------------------------|------------------------------|--------|
| POST   | `/add-spot`             | Create new parking spot      | Owner  |
| GET    | `/my-spots`             | Get all owned spots          | Owner  |
| PUT    | `/edit-spot/:id`        | Update spot details          | Owner  |
| DELETE | `/delete-spot/:id`      | Delete a spot                | Owner  |
| GET    | `/earnings`             | View total earnings          | Owner  |
| GET    | `/spot-status/:id`      | Check spot occupancy status  | Owner  |

### **Driver Routes** (`/api/driver`)

| Method | Endpoint  | Description          | Access |
|--------|-----------|----------------------|--------|
| GET    | `/search` | Search parking spots | Driver |

**Query Parameters:**
- `lat` - Latitude
- `lng` - Longitude
- `maxPrice` - Maximum price per hour
- `type` - Spot type (open/covered)
- `size` - Spot size (small/medium/large)

### **Booking Routes** (`/api/booking`)

| Method | Endpoint                      | Description                  | Access  |
|--------|-------------------------------|------------------------------|---------|
| POST   | `/create`                     | Create new booking           | Private |
| POST   | `/scan-qr`                    | Verify QR code               | Private |
| POST   | `/end-session`                | End parking session          | Private |
| GET    | `/my-bookings`                | Get user booking history     | Private |
| POST   | `/extend`                     | Extend booking time          | Private |
| POST   | `/rate`                       | Rate a parking spot          | Private |
| GET    | `/find-my-car/:bookingId`     | Get saved car location       | Private |

### **Notification Routes** (`/api/notifications`)

| Method | Endpoint            | Description                        | Access  |
|--------|---------------------|------------------------------------|---------|
| GET    | `/`                 | Get all user notifications         | Private |
| POST   | `/create`           | Create notification (admin/system) | Private |
| PUT    | `/mark-read/:id`    | Mark notification as read          | Private |
| PUT    | `/mark-all-read`    | Mark all as read                   | Private |
| DELETE | `/:id`              | Delete single notification         | Private |
| DELETE | `/`                 | Delete all notifications           | Private |

### **Admin Routes** (`/api/admin`)

| Method | Endpoint                | Description                  | Access |
|--------|-------------------------|------------------------------|--------|
| GET    | `/pending-spots`        | Get unapproved spots         | Admin  |
| PUT    | `/approve-spot/:id`     | Approve a parking spot       | Admin  |
| DELETE | `/remove-spot/:id`      | Remove a spot                | Admin  |
| GET    | `/users`                | Get all registered users     | Admin  |
| GET    | `/heatmap`              | Get spot coordinates for map | Admin  |
| GET    | `/stats`                | Dashboard statistics         | Admin  |

## 🔐 Authentication

All protected routes require a JWT token. Send it in one of two ways:

1. **HTTP-only Cookie** (recommended)
   - Automatically set on login
   - Cookie name: `token`

2. **Authorization Header**
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 📦 Dependencies

```json
{
  "bcryptjs": "^3.0.3",           // Password hashing
  "cloudinary": "^2.9.0",         // Image storage
  "cookie-parser": "^1.4.7",      // Cookie parsing
  "cors": "^2.8.6",               // Cross-origin requests
  "dotenv": "^17.3.1",            // Environment variables
  "express": "^5.2.1",            // Web framework
  "express-fileupload": "^1.5.2", // File upload handling
  "jsonwebtoken": "^9.0.3",       // JWT authentication
  "mongoose": "^9.2.3",           // MongoDB ODM
  "nodemailer": "^8.0.1",         // Email sending
  "qrcode": "^1.5.4"              // QR code generation
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name smart-parking

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
# Dockerfile (create this file)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t smart-parking-backend .
docker run -p 5000:5000 --env-file .env smart-parking-backend
```

## 🛠️ Development

```bash
# Install nodemon for auto-reload
npm install -g nodemon

# Run in development mode
npm run dev
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Stack trace (dev only)"
}
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in `.env`
- Verify network connectivity

### Cloudinary Upload Fails
- Verify credentials in `.env`
- Check file size limits (5MB default)
- Ensure temp directory is writable

### Email Not Sending
- Verify Brevo SMTP credentials
- Check EMAIL_HOST and EMAIL_PORT
- Test with a different SMTP provider

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

Smart Parking Team

## 🙏 Acknowledgments

- Express.js for the robust framework
- MongoDB for flexible data storage
- Cloudinary for seamless image management
- Brevo for reliable email delivery

---

**Version:** 1.0.0  
**Last Updated:** February 28, 2026  
**Support:** support@smartparking.com
