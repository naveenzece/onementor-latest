# UI Updates - New API Integration

## Overview
All UI pages and components have been updated to work with the new backend API structure that includes:
- Password-based authentication
- Unified user/mentor roles
- New booking system with payment integration
- Updated mentor slot management

## Key Changes Made

### 1. Services Updated
- ✅ `services/apiendpoints.js` - Updated all endpoint paths
- ✅ `services/auth/auth.js` - Added password login, updated OTP flow
- ✅ `services/user/user.js` - Updated signup with password
- ✅ `services/mentor/mentor.js` - New service for mentor operations
- ✅ `services/booking/booking.js` - New service for booking operations
- ✅ `services/payment/payment.js` - New service for payment operations
- ✅ `services/discovery/discovery.js` - New service for mentor discovery

### 2. Authentication Pages
- ✅ `app/login/page.js` - Updated with password login + OTP option
- ✅ `app/signup/page.js` - Added password and confirm password fields

### 3. Pages That Need Updates

#### User Dashboard Pages:
- `app/dashboard/userdashboard/coachdiscovery/page.js` - Update to use `/api/mentors`
- `app/dashboard/userdashboard/booksession/page.js` - Update booking flow with payment
- `app/dashboard/userdashboard/profile/page.js` - Update to use new profile API
- `app/dashboard/userdashboard/userpayment/page.js` - Update payment handling
- `app/dashboard/userdashboard/sessionfeedback/page.js` - Update feedback API
- `app/dashboard/userdashboard/userAi/page.js` - Update AI interaction API

#### Mentor Dashboard Pages:
- `app/dashboard/coachdashboard/manageschedule/page.js` - Update to use `/api/mentor/slots`
- `app/dashboard/coachdashboard/profile/page.js` - Update to use `/api/mentor/profile`
- `app/dashboard/coachdashboard/request/page.js` - Update to use `/api/mentor/requests`

### 4. Components That Need Updates
- `components/userdiscovery/CoachCard.js` - Update to use mentor data structure
- `components/userbooksession/booksession.js` - Update booking flow
- `components/userpayment/PaymentForm.js` - Update payment integration
- `components/coach/manageschedule/*` - Update slot management

## API Endpoint Mapping

### Old → New
- `/api/coaches` → `/api/mentors`
- `/api/manageschedules` → `/api/mentor/slots`
- `/api/coachprofile` → `/api/mentor/profile`
- `/api/bookings` → `/api/bookings` (updated structure)
- `/api/users/signup` → `/api/users/signup` (now requires password)

## Role Mapping
- `coach` → `mentor` (in database)
- `user` → `user` (unchanged)

## Next Steps for Full Implementation

1. Update all dashboard pages to use new services
2. Update components to match new data structures
3. Add payment flow integration
4. Update routing based on role ('mentor' instead of 'coach')
5. Test all flows end-to-end

## Environment Variables Needed

Add to `.env.local`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8001/api/
```

