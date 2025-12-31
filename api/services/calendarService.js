const { google } = require('googleapis');
const db = require('../config/mysql');
require('dotenv').config();

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.API_BASE_URL || 'http://localhost:8001'}/api/mentor/calendar/callback`;

// Required scopes for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Get OAuth2 authorization URL
 * @param {string} userId - User ID to associate with the OAuth flow
 * @param {string} role - User role ('mentor' or 'user')
 * @returns {string} Authorization URL
 */
function getAuthUrl(userId, role = 'mentor', extraState = null) {
  // Use appropriate redirect URI based on role
  const redirectUri = role === 'mentor'
    ? (process.env.GOOGLE_REDIRECT_URI || `${process.env.API_BASE_URL || 'http://localhost:8001'}/api/mentor/calendar/callback`)
    : `${process.env.API_BASE_URL || 'http://localhost:8001'}/api/user/calendar/callback`;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // Build state: if extraState provided, include it along with userId
  let stateValue;
  if (extraState && typeof extraState === 'object') {
    try {
      const payload = { userId: userId, ...extraState };
      // URI encode JSON to be safe in query string
      stateValue = encodeURIComponent(JSON.stringify(payload));
    } catch (e) {
      stateValue = userId.toString();
    }
  } else {
    stateValue = userId.toString();
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
    state: stateValue // Pass state
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - Redirect URI that was used in the authorization URL (must match exactly)
 * @returns {Promise<Object>} Tokens object
 */
async function getTokensFromCode(code, redirectUri = null) {
  // Use the provided redirect URI or fall back to default
  const finalRedirectUri = redirectUri || GOOGLE_REDIRECT_URI;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    finalRedirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      redirectUri: finalRedirectUri
    });
    throw new Error(`Failed to exchange authorization code for tokens: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get OAuth2 client with stored refresh token
 * @param {string} refreshToken - Stored refresh token
 * @returns {Object} OAuth2 client
 */
function getAuthenticatedClient(refreshToken) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  return oauth2Client;
}

/**
 * Save Google Calendar tokens to database
 * @param {number} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @param {string} accessToken - Access token (optional)
 * @param {string} email - Google account email
 * @param {string} role - User role ('mentor' or 'user') - used for validation only
 * @returns {Promise<void>}
 */
async function saveCalendarTokens(userId, refreshToken, accessToken = null, email = null, role = 'mentor') {
  try {
    // Verify user exists and has the correct role
    const [user] = await db.query(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [userId, role]
    );

    if (user.length === 0) {
      throw new Error(`User not found or role mismatch. Expected role: ${role}`);
    }

    // Store tokens in users table for both roles
    await db.query(
      `UPDATE users 
       SET google_calendar_refresh_token = ?,
           google_calendar_email = ?,
           google_calendar_connected_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [refreshToken, email, userId]
    );
  } catch (error) {
    console.error('Error saving calendar tokens:', error);
    throw error;
  }
}

/**
 * Get stored calendar tokens for a user
 * @param {number} userId - User ID
 * @param {string} role - User role ('mentor' or 'user') - not used for query, just for reference
 * @returns {Promise<Object|null>} Tokens object or null
 */
async function getCalendarTokens(userId, role = 'mentor') {
  try {
    // Always get tokens from users table
    const [result] = await db.query(
      `SELECT google_calendar_refresh_token, google_calendar_email, google_calendar_connected_at
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (result.length === 0 || !result[0].google_calendar_refresh_token) {
      return null;
    }

    return {
      refreshToken: result[0].google_calendar_refresh_token,
      email: result[0].google_calendar_email,
      connectedAt: result[0].google_calendar_connected_at
    };
  } catch (error) {
    console.error('Error getting calendar tokens:', error);
    return null;
  }
}


/**
 * Create a calendar event with Google Meet link
 * @param {number} userId - User ID
 * @param {Object} eventData - Event data
 * @param {string} eventData.summary - Event title
 * @param {string} eventData.description - Event description
 * @param {Date} eventData.start - Start date/time
 * @param {Date} eventData.end - End date/time
 * @param {Array<string>} eventData.attendees - Array of attendee emails
 * @returns {Promise<Object>} Created event with Meet link
 */
async function createCalendarEvent(userId, eventData, role = 'mentor') {
  try {
    const tokens = await getCalendarTokens(userId, role);

    if (!tokens || !tokens.refreshToken) {
      throw new Error('Calendar not connected');
    }

    const oauth2Client = getAuthenticatedClient(tokens.refreshToken);

    // Get a fresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventData.summary,
      description: eventData.description || '',
      start: {
        dateTime: eventData.start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.end.toISOString(),
        timeZone: 'UTC',
      },
      attendees: eventData.attendees?.map(email => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 } // 15 minutes before
        ]
      }
    };

    // If existing conference data is provided, use it. Otherwise create new Meet link.
    if (eventData.conferenceData) {
      event.conferenceData = eventData.conferenceData;
    } else {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      };
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event
    });

    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri;

    return {
      success: true,
      eventId: response.data.id,
      meetLink: meetLink,
      htmlLink: response.data.htmlLink,
      event: response.data
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Disconnect Google Calendar
 * @param {number} userId - User ID
 * @param {string} role - User role ('mentor' or 'user') - not used, just for reference
 * @returns {Promise<void>}
 */
async function disconnectCalendar(userId, role = 'mentor') {
  try {
    // Always update users table for both roles
    await db.query(
      `UPDATE users 
       SET google_calendar_refresh_token = NULL,
           google_calendar_email = NULL,
           google_calendar_connected_at = NULL,
           updated_at = NOW()
       WHERE id = ?`,
      [userId]
    );
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    throw error;
  }
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  saveCalendarTokens,
  getCalendarTokens,
  createCalendarEvent,
  disconnectCalendar
};

