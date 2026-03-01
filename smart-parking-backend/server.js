const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const cookieParser  = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path       = require('path');
const connectDB  = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight (OPTIONS) requests for ALL routes — Express 5 wildcard syntax
app.options('/{*path}', cors(corsOptions));

// Apply CORS to all other requests
app.use(cors(corsOptions));

// ─── Middleware ──────────────────────────────────────────────
// JSON body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File upload — temp files stored in /tmp/
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

// ─── Static Files ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const ownerRoutes        = require('./routes/ownerRoutes');
const driverRoutes       = require('./routes/driverRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth',          authRoutes);
app.use('/api/booking',       bookingRoutes);
app.use('/api/owner',         ownerRoutes);
app.use('/api/driver',        driverRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/payment',       paymentRoutes);
// app.use('/api/notifications', notificationRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚗 Smart Parking API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be last) ─────────────────────
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
