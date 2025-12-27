const express = require('express');
const router = express.Router();
const { createAndSendOtp, verifyOtp } = require('../services/otpservice');
const { findUserByEmail, verifyPassword, updateUserVerification, createUser } = require('../models/user');
const { saveCalendarTokens } = require('../services/calendarService');
const { google } = require('googleapis');
const crypto = require('crypto');
const pool = require('../config/mysql');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email required
 *       404:
 *         description: Email not registered
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated or not verified
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/google/url:
 *   get:
 *     summary: Get Google Auth URL for Login/Signup
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Role (user/mentor) - required for new signups
 *     responses:
 *       200:
 *         description: Auth URL
 */
router.get('/google/url', (req, res) => {
  const { role, intent } = req.query; // Added intent
  const targetRole = role === 'coach' ? 'mentor' : (role || 'user');
  const targetIntent = intent || 'signup';

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_BASE_URL || 'http://localhost:8001'}/api/auth/google/callback`
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to ensure we get refresh token
    state: JSON.stringify({ role: targetRole, intent: targetIntent })
  });

  res.json({ url });
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google Auth Callback
 *     tags: [Authentication]
 */
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8001';
  const redirectUri = `${apiBaseUrl}/api/auth/google/callback`;


  if (!code) {
    console.error('No code provided in callback');
    return res.redirect(`${frontendUrl}/login?error=Google+Auth+Failed`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const { email, name, picture } = userInfo.data;

    if (!email) {
      console.error('No email in user info');
      return res.redirect(`${frontendUrl}/login?error=No+Email+Provided`);
    }

    // Parse state
    let role = 'user';
    let intent = 'signup'; // Default intent
    try {
      if (state) {
        const parsedState = JSON.parse(state);
        if (parsedState && parsedState.role) role = parsedState.role;
        if (parsedState && parsedState.intent) intent = parsedState.intent;
      }
    } catch (e) {
      console.warn('Failed to parse state', state);
    }

    // Check if user exists
    let user = await findUserByEmail(email);

    if (!user) {
      // If intent is explicit login, do NOT create user. Redirect to signup.
      if (intent === 'login') {
        return res.redirect(`${frontendUrl}/signup?error=${encodeURIComponent("Account not found. Please sign up first.")}`);
      }

      // User does not exist -> Signup
      const password = crypto.randomBytes(16).toString('hex'); // Random password

      // Sanitizing inputs to match schema limits
      const safeName = (name || email.split('@')[0]).substring(0, 100);
      const safeEmail = email.substring(0, 150);

      const insertResult = await createUser({
        name: safeName,
        email: safeEmail,
        password, // Hashed by createUser
        role,
        phone: null
      });

      // Fetch the created user
      user = await findUserByEmail(safeEmail);

      // Auto-verify user created via Google
      if (user) {
        await updateUserVerification(safeEmail, true);
        user.is_verified = 1;
      }
    } else {
      // User exists
      // Optimistically update verification if not verified?
      if (!user.is_verified) {
        await updateUserVerification(email, true);
        user.is_verified = 1;
      }
    }

    if (!user) {
      console.error('Failed to create or find user');
      return res.redirect(`${frontendUrl}/login?error=User+Creation+Failed`);
    }

    // Store/Update Calendar Tokens
    // Only if we got a refresh token
    if (tokens.refresh_token) {
      try {
        await saveCalendarTokens(user.id, tokens.refresh_token, tokens.access_token, email, user.role);
      } catch (err) {
        console.error('Failed to save calendar tokens:', err.message);
        // Non-fatal, continue login
      }
    } else {
      // No refresh token received.
    }

    // Create Session/Token
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Redirect to Frontend
    // We pass the token in URL or set a cookie.
    // Usually passing in URL is riskier but standard for OAuth callbacks to SPAs without backend-session-only.
    // Better: Redirect to a transparent page that saves token to localStorage?
    // Or redirect to dashboard with token query param.

    // Determine dashboard URL
    // const dashboard = user.role === 'mentor' ? '/dashboard/coach' : '/dashboard/user';

    // We encode token and user info
    const queryParams = new URLSearchParams({
      token: jwtToken,
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      calendar_connected: !!tokens.refresh_token
    });

    console.log('Redirecting to frontend...');
    res.redirect(`${frontendUrl}/google-callback?${queryParams.toString()}`);

  } catch (error) {
    console.error('Google Auth Error Details:', error);
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
});

module.exports = router;
