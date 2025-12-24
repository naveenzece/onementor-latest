const nodemailer = require('nodemailer');
require('dotenv').config();

async function createTransporter() {
  // Option A: Use App Password (simpler if you have 2FA enabled)
  if (process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_USER) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Option B: OAuth2 (advanced) - if you filled CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.GMAIL_USER
  ) {
    const { google } = require('googleapis');
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground' // redirect URI if used
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
  }

  throw new Error('No mailer auth configured. Set GMAIL_APP_PASSWORD or OAuth2 env vars.');
}

async function sendOtpEmail(to, otp) {
  const transporter = await createTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your OTP code',
    text: `Your One Time Password (OTP) is: ${otp}. It will expire in ${process.env.OTP_EXPIRES_MIN || 10} minutes.`,
    html: `<p>Your One Time Password (OTP) is: <b>${otp}</b></p><p>It will expire in ${process.env.OTP_EXPIRES_MIN || 10} minutes.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = await createTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: text || '',
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendOtpEmail, sendEmail };
