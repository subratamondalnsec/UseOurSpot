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

// ─── Middleware ──────────────────────────────────────────────
// 1. JSON body parser
app.use(express.json());

// 2. Cookie parser
app.use(cookieParser());

// 3. CORS — allow only listed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// 4. File upload — temp files stored in /tmp/
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
// const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth',          authRoutes);
app.use('/api/booking',       bookingRoutes);
app.use('/api/owner',         ownerRoutes);
app.use('/api/driver',        driverRoutes);
app.use('/api/admin',         adminRoutes);
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
