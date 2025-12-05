const express = require('express');
const router = express.Router();
const { createUser } = require('../services/userservices');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate role
    if (role && !['user', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "mentor"' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const result = await createUser({ name, email, phone, password, role: role || 'user' });
    
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
