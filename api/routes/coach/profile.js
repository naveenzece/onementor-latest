const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createMentorProfile, getMentorProfile } = require("../../controller/coach/profile");
const db = require("../../config/mysql");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST mentor profile (create or update)
router.post("/", upload.single("resume"), createMentorProfile);

// GET mentor profile by user_id
router.get("/:user_id", getMentorProfile);

// GET all mentors with profiles
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        u.id as user_id,
        u.name,
        u.email,
        mp.username,
        mp.category,
        mp.bio,
        mp.skills,
        mp.other_skills,
        mp.resume,
        mp.rating,
        mp.total_sessions,
        mp.hourly_rate
       FROM users u
       INNER JOIN mentor_profiles mp ON u.id = mp.user_id
       WHERE u.role = 'mentor' AND u.is_active = 1
       ORDER BY mp.rating DESC, mp.total_sessions DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
