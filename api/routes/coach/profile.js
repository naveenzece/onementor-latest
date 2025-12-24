const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createMentorProfile, getMentorProfile } = require("../../controller/coach/profile");
const { generateCustomerId } = require("../../util/generators");
const db = require("../../config/mysql");

// Add env flag (case-insensitive support for both useJuspay and USE_JUSPAY)
const useJuspay = String(process.env.useJuspay || process.env.USE_JUSPAY || '').toLowerCase() === 'true';

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
// Handle both FormData (with file) and JSON (without file)
router.post("/", (req, res, next) => {
  // Check if request has multipart/form-data content type
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    // Use multer for file upload
    upload.single("resume")(req, res, next);
  } else {
    // For JSON requests, skip multer but ensure body is parsed
    // Express body-parser should have already parsed JSON
    next();
  }
}, createMentorProfile);

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

/**
 * @swagger
 * /api/mentor/profile/vpa:
 *   post:
 *     summary: Validate and add VPA (UPI ID) for mentor
 *     tags: [Mentor Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentor_id
 *               - vpa
 *             properties:
 *               mentor_id:
 *                 type: integer
 *                 description: Mentor user ID
 *               vpa:
 *                 type: string
 *                 description: UPI VPA ID (e.g., name@upi)
 *               name:
 *                 type: string
 *                 description: Account holder name (optional, will use email prefix if not provided)
 *     responses:
 *       200:
 *         description: VPA validated and saved successfully
 *       400:
 *         description: Invalid request or VPA validation failed
 *       404:
 *         description: Mentor profile not found
 *       500:
 *         description: Server error
 */
router.post("/vpa", async (req, res) => {
  try {
    const { mentor_id, vpa, name } = req.body;

    if (!mentor_id || !vpa) {
      return res.status(400).json({ 
        error: "mentor_id and vpa are required" 
      });
    }

    // Validate VPA format (basic check)
    if (!vpa.includes('@') || vpa.split('@').length !== 2) {
      return res.status(400).json({ 
        error: "Invalid VPA format. VPA should be in format: name@upi" 
      });
    }

    // Check if user is a mentor
    const [userCheck] = await db.query(
      "SELECT id, email, phone, name FROM users WHERE id = ? AND role = 'mentor'",
      [mentor_id]
    );

    if (userCheck.length === 0) {
      return res.status(403).json({ error: "User is not a mentor" });
    }

    const user = userCheck[0];

    // Check if mentor profile exists
    const [profileCheck] = await db.query(
      "SELECT id, beneficiary_id FROM mentor_profiles WHERE user_id = ?",
      [mentor_id]
    );

    if (profileCheck.length === 0) {
      return res.status(404).json({ error: "Mentor profile not found. Please create profile first." });
    }

    const profile = profileCheck[0];

    // Generate consistent customerId using utility function
    const customerId = generateCustomerId(mentor_id, user.email);

    // Validate VPA using JUSPAY payout API or mock based on env
    let validationResult;
    if (useJuspay) {
      const { validateVPA } = require("../../services/paymentService");
      validationResult = await validateVPA({
        vpa: vpa,
        name: name || user.name || user.email.split('@')[0],
        email: user.email,
        phone: user.phone || '',
        customerId: customerId,
        beneId: profile.beneficiary_id || undefined
      });
    } else {
      // Mock successful validation for local/testing environments
      validationResult = {
        success: true,
        status: 'valid',
        uniqueId: `MOCK-BENE-${mentor_id}`,
        beneId: `MOCK-BENE-${mentor_id}`,
        nameAtBank: name || user.name || user.email.split('@')[0],
        responseCode: 'MOCK_200',
        responseMessage: 'Mock validation successful',
        responseData: null
      };
    }

    if (!validationResult.success) {
      // Update status to failed
      await db.query(
        `UPDATE mentor_profiles 
         SET vpa_id = ?,
             vpa_status = 'failed',
             vpa_validated_at = NOW(),
             updated_at = NOW()
         WHERE user_id = ?`,
        [vpa, mentor_id]
      );

      return res.status(400).json({ 
        error: validationResult.error || "VPA validation failed",
        details: validationResult.responseData
      });
    }

    // VPA is valid, save to database
    const vpaStatus = validationResult.status === 'valid' ? 'valid' : 'verified';
    
    await db.query(
      `UPDATE mentor_profiles 
       SET vpa_id = ?,
           beneficiary_id = ?,
           vpa_status = ?,
           vpa_validated_at = NOW(),
           vpa_name_at_bank = ?,
           updated_at = NOW()
       WHERE user_id = ?`,
      [
        vpa,
        validationResult.uniqueId || validationResult.beneId,
        vpaStatus,
        validationResult.nameAtBank || null,
        mentor_id
      ]
    );

    res.json({
      message: "VPA validated and saved successfully",
      vpa: vpa,
      beneficiary_id: validationResult.uniqueId || validationResult.beneId,
      nameAtBank: validationResult.nameAtBank,
      status: vpaStatus,
      responseCode: validationResult.responseCode,
      responseMessage: validationResult.responseMessage
    });
  } catch (err) {
    console.error("VPA validation error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

/**
 * @swagger
 * /api/mentor/profile/beneficiary/{mentor_id}/status:
 *   get:
 *     summary: Get beneficiary status for a mentor
 *     tags: [Mentor Profile]
 *     parameters:
 *       - in: path
 *         name: mentor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mentor user ID
 *     responses:
 *       200:
 *         description: Beneficiary status retrieved successfully
 *       400:
 *         description: Invalid request or beneficiary not found
 *       404:
 *         description: Mentor profile not found
 *       500:
 *         description: Server error
 */
router.get("/beneficiary/:mentor_id/status", async (req, res) => {
  try {
    const { mentor_id } = req.params;

    if (!mentor_id) {
      return res.status(400).json({ 
        error: "mentor_id is required" 
      });
    }

    // Get mentor profile with beneficiary_id
    const [profileCheck] = await db.query(
      `SELECT mp.id, mp.user_id, mp.beneficiary_id, mp.vpa_id, mp.vpa_status,
              u.email, u.phone
       FROM mentor_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = ?`,
      [mentor_id]
    );

    if (profileCheck.length === 0) {
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    const profile = profileCheck[0];

    if (!profile.beneficiary_id) {
      return res.status(400).json({ 
        error: "Beneficiary ID not found. Please validate VPA first." 
      });
    }

    // Generate customerId using utility function
    const customerId = generateCustomerId(profile.user_id, profile.email);

    // Get beneficiary status from JUSPAY or return mock when useJuspay is false
    let statusResult;
    if (useJuspay) {
      const { getBeneficiaryStatus } = require("../../services/paymentService");
      statusResult = await getBeneficiaryStatus(customerId, profile.beneficiary_id);
    } else {
      // Mock a valid status for testing local flows
      statusResult = {
        success: true,
        status: profile.vpa_status ? profile.vpa_status.toUpperCase() : 'VALID',
        uniqueId: profile.beneficiary_id,
        nameAtBank: profile.vpa_name_at_bank || null,
        responseCode: 'MOCK_200',
        responseMessage: 'Mock beneficiary status',
        validationType: 'mock',
        beneDetails: null,
        updatedAt: new Date(),
        transactions: []
      };
    }

    if (!statusResult.success) {
      return res.status(400).json({ 
        error: statusResult.error || "Failed to get beneficiary status",
        details: statusResult.responseData
      });
    }

    // Update VPA status in database based on JUSPAY response
    let vpaStatus = 'pending';
    if (statusResult.status === 'VALID') {
      vpaStatus = 'valid';
    } else if (statusResult.status === 'INVALID') {
      vpaStatus = 'invalid';
    }

    // Update the profile with latest status
    await db.query(
      `UPDATE mentor_profiles 
       SET vpa_status = ?,
           vpa_name_at_bank = ?,
           vpa_validated_at = NOW(),
           updated_at = NOW()
       WHERE user_id = ?`,
      [
        vpaStatus,
        statusResult.nameAtBank || null,
        mentor_id
      ]
    );

    res.json({
      message: "Beneficiary status retrieved successfully",
      beneficiary_id: statusResult.uniqueId,
      status: statusResult.status,
      vpa_status: vpaStatus,
      nameAtBank: statusResult.nameAtBank,
      responseCode: statusResult.responseCode,
      responseMessage: statusResult.responseMessage,
      validationType: statusResult.validationType,
      beneDetails: statusResult.beneDetails,
      updatedAt: statusResult.updatedAt,
      transactions: statusResult.transactions
    });
  } catch (err) {
    console.error("Get beneficiary status error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
