// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();



// Routes
const userRouter = require('./routes/usersRoute');
const authRoutes = require("./routes/authRoute");
const profileRoutes = require('./routes/user/profileRoutes');
const mentorRoutes = require("./routes/user/coachdiscover"); // Mentor discovery
const bookingRoutes = require("./routes/user/bookslot");
const reportRoutes = require("./routes/user/report");
const progressRoutes = require("./routes/user/progress");
const interactRoutes = require("./routes/user/userai");

// Mentor routes
const mentorProfileRoutes = require("./routes/coach/profile");
const slotManagementRoutes = require("./routes/coach/manageschedule");

// Payment routes
const paymentRoutes = require("./routes/payment");

// Swagger
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// CORS setup for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Body parsers
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Request logging middleware (optional, for debugging)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
// Authentication
app.use("/api/auth", authRoutes);

// User management
app.use('/api/users', userRouter);

// User profile
app.use('/api/profile', profileRoutes);

// Mentor discovery (for users to find mentors)
app.use("/api/mentors", mentorRoutes);

// Bookings
app.use("/api/bookings", bookingRoutes);

// Session reports/feedback
app.use("/api/reports", reportRoutes);

// User progress
app.use("/api/progress", progressRoutes);

// AI interactions
app.use("/api/interact", interactRoutes);

// Mentor profile management
app.use("/api/mentor/profile", mentorProfileRoutes);

// Slot management (for mentors)
app.use("/api/mentor/slots", slotManagementRoutes);

// Mentor booking requests
const requestRoutes = require("./routes/coach/request");
app.use("/api/mentor/requests", requestRoutes);

// Mentor calendar integration
const mentorCalendarRoutes = require("./routes/coach/calendar");
app.use("/api/mentor/calendar", mentorCalendarRoutes);

// User calendar integration
const userCalendarRoutes = require("./routes/user/calendar");
app.use("/api/user/calendar", userCalendarRoutes);

// User sessions
const userSessionRoutes = require("./routes/user/sessions");
app.use("/api/user/sessions", userSessionRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'OneMentor API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      mentors: '/api/mentors',
      bookings: '/api/bookings',
      payments: '/api/payment',
      docs: '/api-docs'
    }
  });
});

// Check session route
app.get('/api/auth/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      authenticated: false,
      message: "No active session" 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
