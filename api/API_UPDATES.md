# API Updates - New Schema & JUSPAY Integration

## Overview
All APIs, queries, and functionality have been updated to work with the new database schema that supports:
- Unified `users` table with roles (user/mentor)
- Password-based authentication
- Mentor slot management
- Booking system with payment integration
- JUSPAY payment gateway

## Key Changes

### 1. Database Schema
- **Users Table**: Unified table with `role` enum ('user', 'mentor'), `password_hash`, `is_verified`, `is_active`
- **Mentor Profiles**: `mentor_profiles` table linked to users
- **User Profiles**: `user_profiles` table linked to users
- **Mentor Slots**: `mentor_slots` table for available time slots
- **Bookings**: Enhanced with payment status, session details, and status tracking
- **Payments**: New `payments` table for payment records

### 2. Authentication
- **Signup**: `POST /api/users/signup` - Requires name, email, password, optional role
- **Login**: `POST /api/auth/login` - Email and password authentication
- **OTP Verification**: `POST /api/auth/verify-otp` - For email verification
- **Send OTP**: `POST /api/auth/send-otp` - Send OTP to email
- **Logout**: `POST /api/auth/logout` - Destroy session
- **Check Session**: `GET /api/auth/check-session` - Check if user is authenticated

### 3. User Management
- **Signup**: `POST /api/users/signup`
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "user" // or "mentor"
  }
  ```

### 4. User Profile
- **Create/Update Profile**: `POST /api/profile`
  - Requires: `user_id`, `skills`, `interests`, `resume` (file)
- **Get Profile**: `GET /api/profile/:user_id`

### 5. Mentor Profile
- **Create/Update Profile**: `POST /api/mentor/profile`
  - Requires: `user_id`, optional: `username`, `category`, `bio`, `skills`, `hourly_rate`, `resume`
- **Get Profile**: `GET /api/mentor/profile/:user_id`
- **List All Mentors**: `GET /api/mentor/profile`

### 6. Mentor Slot Management
- **Create Slot**: `POST /api/mentor/slots`
  ```json
  {
    "mentor_id": 1,
    "date": "2025-01-15",
    "start_time": "10:00:00",
    "end_time": "11:00:00"
  }
  ```
- **Get Slots by Mentor**: `GET /api/mentor/slots/mentor/:mentorId`
- **Get All Slots**: `GET /api/mentor/slots?mentor_id=1&date=2025-01-15`
- **Update Slot**: `PUT /api/mentor/slots/:id`
- **Delete Slot**: `DELETE /api/mentor/slots/:id`

### 7. Mentor Discovery
- **Get Mentors**: `GET /api/mentors`
  - Query params: `category`, `skill`, `date`, `min_rating`, `max_price`
  - Returns mentors with available slots, ratings, and pricing

### 8. Booking System
- **Book Slot**: `POST /api/bookings`
  ```json
  {
    "user_id": 1,
    "mentor_id": 2,
    "slot_id": 5,
    "notes": "Optional notes"
  }
  ```
  - Creates booking and initiates JUSPAY payment
  - Returns `payment_url` for user to complete payment
  
- **Get User Bookings**: `GET /api/bookings/user/:user_id?status=confirmed`
- **Get Mentor Bookings**: `GET /api/bookings/mentor/:mentor_id?status=pending`

### 9. Payment Integration (JUSPAY)
- **Payment Webhook**: `POST /api/payment/webhook` - Handles JUSPAY callbacks
- **Verify Payment**: `GET /api/payment/verify/:transaction_id`
- **Payment Callback**: `GET /api/payment/callback?transaction_id=xxx` - Redirects after payment
- **Get Payment by Booking**: `GET /api/payment/booking/:booking_id`

### 10. Session Reports (Feedback)
- **Submit Feedback**: `POST /api/reports`
  ```json
  {
    "booking_id": 1,
    "user_id": 1,
    "mentor_id": 2,
    "rating": 5,
    "comments": "Great session!"
  }
  ```
- **Get Mentor Feedback**: `GET /api/reports/mentor/:mentor_id`
- **Get Booking Feedback**: `GET /api/reports/booking/:booking_id`

### 11. Progress Tracking
- **Add Progress**: `POST /api/progress`
  ```json
  {
    "user_id": 1,
    "booking_id": 1,
    "notes": "Learned about React hooks"
  }
  ```
- **Get User Progress**: `GET /api/progress/:user_id`

### 12. AI Interactions
- **Ask Question**: `POST /api/interact/ask`
  ```json
  {
    "user_id": 1,
    "question": "What is React?",
    "interaction_type": "ai_chat"
  }
  ```
- **Get History**: `GET /api/interact/history/:user_id?limit=50`

### 13. Mentor Requests
- **Get Booking Requests**: `GET /api/mentor/requests/:mentor_id?status=pending`
- **Update Booking Status**: `PATCH /api/mentor/requests/:booking_id?mentor_id=1`
  ```json
  {
    "status": "confirmed", // or "rejected", "cancelled"
    "meeting_link": "https://zoom.us/j/123456"
  }
  ```

## Environment Variables Required

Create a `.env` file with:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=onementor

# Server
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your-secret-key-change-in-production

# JUSPAY (get credentials from https://dashboard.juspay.in)
JUSPAY_MERCHANT_ID=your_merchant_id
JUSPAY_API_KEY=your_api_key
JUSPAY_BASE_URL=https://api.juspay.in
JUSPAY_RETURN_URL=http://localhost:3000/payment/callback

# OpenAI (for AI interactions)
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET=your_jwt_secret_key
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run database migrations (execute the SQL file):
```bash
mysql -u root -p onementor < api/db/onementor.sql
```

3. Set up environment variables in `.env` file

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Payment Flow

1. User books a slot → Booking created with `payment_status: 'pending'`
2. JUSPAY payment order created → Returns `payment_url`
3. User redirected to `payment_url` to complete payment
4. JUSPAY sends webhook → Payment status updated
5. Booking status updated to `confirmed` when payment is `paid`

## Important Notes

- All user IDs now refer to the unified `users` table
- Role-based access: Check `role` field ('user' or 'mentor')
- Password authentication is required (no more OTP-only login)
- All bookings require payment before confirmation
- Mentor slots must be created before users can book
- Hourly rate in mentor profile determines booking amount

## API Base URL
- Development: `http://localhost:8001/api`
- Production: Set `FRONTEND_URL` and `NODE_ENV=production`

## Swagger Documentation
Access API documentation at: `http://localhost:8001/api-docs`

