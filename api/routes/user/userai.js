const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const db = require("../../config/mysql");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Submit user question and save to DB
router.post("/ask", async (req, res) => {
  try {
    const { user_id, question, interaction_type } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    let aiFeedback = "";

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful mentor AI assistant. Provide clear, concise, and encouraging guidance." },
          { role: "user", content: question },
        ],
      });

      aiFeedback = response.choices[0].message.content;
    } catch (err) {
      console.error("❌ OpenAI API error:", err);
      aiFeedback = "⚠️ AI service is temporarily unavailable. Please try again later or contact a mentor for assistance.";
    }

    // Save interaction to database
    try {
      await db.query(
        `INSERT INTO interactions (user_id, question, response, interaction_type)
         VALUES (?, ?, ?, ?)`,
        [user_id, question, aiFeedback, interaction_type || 'ai_chat']
      );
    } catch (dbErr) {
      console.error("Error saving interaction:", dbErr);
      // Continue even if DB save fails
    }

    res.json({ 
      response: aiFeedback,
      message: "Question processed successfully"
    });
  } catch (err) {
    console.error("Error in AI interaction:", err);
    res.status(500).json({ 
      error: "Internal server error",
      response: "⚠️ Service is temporarily unavailable. Please try again later."
    });
  }
});

// Get user interaction history
router.get("/history/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50 } = req.query;

    const [rows] = await db.query(
      `SELECT * FROM interactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [user_id, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching interactions:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
