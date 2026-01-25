# Admin Authentication System Setup

This document provides instructions for setting up the secure admin authentication system.

## Overview

The admin authentication system has been implemented with the following security features:

- ✅ Removed hard-coded credentials from frontend
- ✅ MySQL database integration with `admins` table
- ✅ Password hashing using bcrypt
- ✅ JWT token-based authentication
- ✅ Session management
- ✅ Secure API endpoints
- ✅ Environment variable configuration
- ✅ Proper error handling

## Database Setup

### 1. Create Admin Table

Run the following command to create the admin table and insert a default admin:

```bash
cd onementor/api
npm run create-admin-table
```

This will:
- Create the `admins` table in your MySQL database
- Insert a default admin user with email: `prwebinfo@gmail.com` and password: `admin123`

### 2. Manual SQL Setup (Alternative)

If you prefer to run the SQL manually, execute the contents of `onementor/api/db/admins.sql` in your MySQL database.

## Environment Variables

Ensure your `.env` file in `onementor/api/` contains:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=onementor

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_SECRET=your-session-secret-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Admin Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/login` | Admin login | No |
| POST | `/api/admin/logout` | Admin logout | No |
| GET | `/api/admin/profile` | Get admin profile | Yes (Token) |
| GET | `/api/admin/check-session` | Check session status | No |
| POST | `/api/admin/create` | Create new admin | Yes (Admin) |

### Request/Response Examples

#### Login Request
```json
POST /api/admin/login
{
  "email": "prwebinfo@gmail.com",
  "password": "admin123"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin User",
      "email": "prwebinfo@gmail.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Frontend Integration

The frontend admin login page (`onementor/ui/src/app/admin/page.js`) has been updated to:

- ✅ Remove hard-coded credentials
- ✅ Make API calls to the backend
- ✅ Handle authentication tokens
- ✅ Store admin session data
- ✅ Display proper error messages
- ✅ Show loading states

### Frontend Utilities

Use the `adminAuth` utility (`onementor/ui/src/utils/adminAuth.js`) for:

```javascript
import { adminAuth } from '@/utils/adminAuth';

// Check if admin is logged in
const isLoggedIn = adminAuth.isAuthenticated();

// Get admin data
const adminData = adminAuth.getAdminData();

// Make authenticated requests
const response = await adminAuth.makeAuthenticatedRequest('/api/admin/profile');
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- No passwords are stored in plain text
- No passwords are sent to the frontend

### Token Security
- JWT tokens expire after 24 hours (configurable)
- Tokens include admin ID, email, role, and type
- Invalid/expired tokens are properly handled

### Session Security
- Server-side session management
- Session data is stored securely
- Sessions can be invalidated on logout

### API Security
- CORS configuration for frontend access
- Proper error handling without exposing sensitive data
- Input validation on all endpoints
- Authentication middleware for protected routes

## Testing the System

### 1. Start the Backend
```bash
cd onementor/api
npm run dev
```

### 2. Start the Frontend
```bash
cd onementor/ui
npm run dev
```

### 3. Test Admin Login
1. Navigate to `http://localhost:3000/admin`
2. Use credentials:
   - Email: `prwebinfo@gmail.com`
   - Password: `admin123`
3. Should redirect to admin dashboard on success

### 4. Test API Endpoints
Use tools like Postman or curl to test the API endpoints:

```bash
# Test login
curl -X POST http://localhost:8001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prwebinfo@gmail.com","password":"admin123"}'

# Test protected endpoint (use token from login response)
curl -X GET http://localhost:8001/api/admin/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Creating Additional Admins

### Method 1: Using API (Recommended)
```bash
curl -X POST http://localhost:8001/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "securepassword123",
    "role": "admin"
  }'
```

### Method 2: Direct Database Insert
1. Hash the password using the utility:
```javascript
const { hashPassword } = require('./utils/hashPassword');
hashPassword('yourpassword');
```

2. Insert into database:
```sql
INSERT INTO admins (name, email, password, role) 
VALUES ('Admin Name', 'admin@example.com', 'HASHED_PASSWORD_HERE', 'admin');
```

## Important Security Notes

1. **Change Default Password**: Immediately change the default admin password after first login
2. **Use Strong JWT Secret**: Update `JWT_SECRET` in production with a strong, random string
3. **Use HTTPS**: Always use HTTPS in production
4. **Regular Password Updates**: Implement password change functionality
5. **Monitor Access**: Log admin access attempts for security monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Token Expired Error**
   - Check JWT_EXPIRES_IN setting
   - Clear localStorage and login again

3. **CORS Error**
   - Verify FRONTEND_URL in `.env`
   - Check CORS configuration in index.js

4. **Session Issues**
   - Check SESSION_SECRET in `.env`
   - Verify session middleware configuration

### Logs
Check console logs in both frontend and backend for detailed error information.

## Next Steps

Consider implementing these additional security features:

1. Password change functionality
2. Account lockout after failed attempts
3. Two-factor authentication (2FA)
4. Admin activity logging
5. Password strength requirements
6. Session timeout warnings
7. Admin role-based permissions