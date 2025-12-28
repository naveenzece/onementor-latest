const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { saveProfile, getProfile } = require('../../models/user/Profile');

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = 'uploads/';
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Profile submission route
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    // Get user_id from body or session
    let user_id = req.body.user_id;

    // If not in body, try to get from session
    if (!user_id && req.session && req.session.user) {
      user_id = req.session.user.id;
    }

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required. Please provide user_id in request body or ensure you are logged in.' });
    }

    const { skills, interests } = req.body;
    const file = req.file;

    // Make resume optional for updates
    if (!file && !skills && !interests) {
      return res.status(400).json({ error: 'At least one field (skills, interests, or resume) is required.' });
    }

    if (!skills || !interests) {
      return res.status(400).json({ error: 'Skills and interests are required.' });
    }

    let skillsArray, interestsArray;
    try {
      skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
      interestsArray = typeof interests === 'string' ? JSON.parse(interests) : interests;
    } catch (err) {
      return res.status(400).json({ error: 'Skills and interests must be valid JSON arrays.' });
    }

    const resumePath = file ? file.path : null;

    const result = await saveProfile(user_id, skillsArray, interestsArray, resumePath);
    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get user profile
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const profile = await getProfile(user_id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
