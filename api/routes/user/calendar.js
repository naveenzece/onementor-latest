const express = require('express');
const router = express.Router();
const db = require('../../config/mysql');
const {
  getAuthUrl,
  getTokensFromCode,
  saveCalendarTokens,
  getCalendarTokens,
  disconnectCalendar
} = require('../../services/calendarService');

/**
 * @swagger
 * /api/user/calendar/auth-url:
 *   get:
 *     summary: Get Google Calendar OAuth authorization URL for users
 *     tags: [User Calendar]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Authorization URL generated successfully
 *       400:
 *         description: Invalid request
 */
router.get('/auth-url', async (req, res) => {
  try {
    const { user_id } = req.query;
    // Optional booking draft params: coachId, selectedDate, selectedSlotId, sessionType
    const { coachId, selectedDate, selectedSlotId, sessionType, return_to } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Verify user exists and is a regular user (not mentor)
    const [userCheck] = await db.query(
      'SELECT id, role FROM users WHERE id = ? AND role = ?',
      [user_id, 'user']
    );

    if (userCheck.length === 0) {
      return res.status(403).json({ error: 'User not found or is not a regular user' });
    }

    // Build extra state if booking draft information was provided
    let extraState = null;
    if (return_to || coachId || selectedDate || selectedSlotId || sessionType) {
      extraState = {};
      if (return_to) extraState.returnTo = return_to;
      if (coachId) extraState.coachId = coachId;
      if (selectedDate) extraState.selectedDate = selectedDate;
      if (selectedSlotId) extraState.selectedSlotId = selectedSlotId;
      if (sessionType) extraState.sessionType = sessionType;
    }

    const authUrl = getAuthUrl(user_id, 'user', extraState);
    
    res.json({
      authUrl: authUrl,
      message: 'Use this URL to authorize Google Calendar access'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * @swagger
 * /api/user/calendar/callback:
 *   get:
 *     summary: Handle Google OAuth callback for users
 *     tags: [User Calendar]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID passed in state
 *     responses:
 *       200:
 *         description: Calendar connected successfully
 *       400:
 *         description: Invalid request or authorization failed
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Authorization code and state are required' });
    }

    // State may be a plain userId (legacy) or an encoded JSON payload
    let userId = null;
    let parsedState = null;
    try {
      if (state) {
        // Try to decode and parse JSON state first
        try {
          const decoded = decodeURIComponent(state);
          parsedState = JSON.parse(decoded);
          if (parsedState && parsedState.userId) {
            userId = parseInt(parsedState.userId, 10);
          }
        } catch (inner) {
          // Not JSON state; try numeric
          const maybeId = parseInt(state, 10);
          if (!isNaN(maybeId)) userId = maybeId;
        }
      }
    } catch (e) {
      console.error('Failed to parse state:', e);
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID in state' });
    }

    // Verify user is a regular user
    const [userCheck] = await db.query(
      'SELECT id, role, email FROM users WHERE id = ? AND role = ?',
      [userId, 'user']
    );

    if (userCheck.length === 0) {
      return res.status(403).json({ error: 'User not found or is not a regular user' });
    }

    // Verify OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/dashboard/userdashboard/profile?calendar_error=${encodeURIComponent('Google OAuth credentials not configured on server')}`);
    }

    // Exchange code for tokens (must use same redirect URI as authorization URL)
    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:8001'}/api/user/calendar/callback`;
    const tokens = await getTokensFromCode(code, redirectUri);

    if (!tokens.refresh_token) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/dashboard/userdashboard/profile?calendar_error=${encodeURIComponent('No refresh token received. Please try connecting again.')}`);
    }

    // Get user's email from Google
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    oauth2Client.setCredentials(tokens);
    
    let googleEmail = null;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      googleEmail = userInfo.data.email;
    } catch (emailError) {
      console.error('Error getting user email:', emailError);
      // Continue even if we can't get email, we'll use the refresh token
    }

    // Save tokens to database (for user role)
    await saveCalendarTokens(userId, tokens.refresh_token, tokens.access_token, googleEmail, 'user');

    // Redirect to frontend with success message.
    // If state contained returnTo=booking (or equivalent draft data), redirect user to booking page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      if (parsedState && parsedState.returnTo === 'booking') {
        // Build booking URL with coachId and optional draft params
        const params = new URLSearchParams();
        params.set('calendar_connected', 'true');
        if (parsedState.coachId) params.set('coachId', parsedState.coachId);
        if (parsedState.selectedDate) params.set('selectedDate', parsedState.selectedDate);
        if (parsedState.selectedSlotId) params.set('selectedSlotId', parsedState.selectedSlotId);
        if (parsedState.sessionType) params.set('sessionType', parsedState.sessionType);

        return res.redirect(`${frontendUrl}/dashboard/userdashboard/booksession?${params.toString()}`);
      }
    } catch (e) {
      console.error('Error building booking redirect URL:', e);
    }

    // Default redirect to profile page
    res.redirect(`${frontendUrl}/dashboard/userdashboard/profile?calendar_connected=true`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard/userdashboard/profile?calendar_error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * @swagger
 * /api/user/calendar/status:
 *   get:
 *     summary: Get Google Calendar connection status for users
 *     tags: [User Calendar]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *       400:
 *         description: Invalid request
 */
router.get('/status', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const tokens = await getCalendarTokens(parseInt(user_id, 10), 'user');

    if (!tokens) {
      return res.json({
        connected: false,
        message: 'Calendar not connected'
      });
    }

    res.json({
      connected: true,
      email: tokens.email,
      connectedAt: tokens.connectedAt
    });
  } catch (error) {
    console.error('Error getting calendar status:', error);
    res.status(500).json({ error: 'Failed to get calendar status' });
  }
});

/**
 * @swagger
 * /api/user/calendar/disconnect:
 *   post:
 *     summary: Disconnect Google Calendar for users
 *     tags: [User Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *     responses:
 *       200:
 *         description: Calendar disconnected successfully
 *       400:
 *         description: Invalid request
 */
router.post('/disconnect', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    await disconnectCalendar(parseInt(user_id, 10), 'user');

    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
});

module.exports = router;

