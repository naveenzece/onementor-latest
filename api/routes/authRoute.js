const express = require('express');
const router = express.Router();
const { createAndSendOtp, verifyOtp } = require('../services/otpservice');
const { findUserByEmail, verifyPassword, updateUserVerification } = require('../models/user');
const pool = require('../config/mysql');
const jwt = require('jsonwebtoken');

// Send OTP for login or verification
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Check if email exists in users table
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Email not registered. Please signup first.' });
    }

    // Email exists → send OTP
    await createAndSendOtp(email);
    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error send-otp:', err);
    return res.status(500).json({ error: 'Unable to send OTP' });
  }
});

// Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check if user is verified
    if (!user.is_verified || user.is_verified === 0) {
      return res.status(403).json({ 
        error: 'Email not verified. Please verify your email first.',
        requiresVerification: true,
        email: user.email,
        role: user.role
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user info in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    console.error('Error login:', err);
    return res.status(500).json({ error: 'Unable to login' });
  }
});

// Verify OTP (for email verification or password reset)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'email and otp required' });

    const result = await verifyOtp(email, otp);
    if (result.error) return res.status(400).json({ error: result.error });

    // Get user from DB
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update verification status if not already verified
    if (!user.is_verified) {
      await updateUserVerification(email, true);
    }

    // Store user info in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: true
      }
    });
  } catch (err) {
    console.error('Error verify-otp:', err);
    return res.status(500).json({ error: 'Unable to verify OTP' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  if (!req.session) return res.status(400).json({ error: 'No active session' });

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
