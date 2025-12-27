const express = require("express");
const router = express.Router();
const sessionsController = require("../../controller/user/sessions");

/**
 * @swagger
 * /api/user/sessions/test/{user_id}:
 *   get:
 *     summary: Test endpoint to check database connection and data
 *     tags: [User Sessions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Test results
 */
router.get("/test/:user_id", sessionsController.testUserSessions);

/**
 * @swagger
 * /api/user/sessions/upcoming/{user_id}:
 *   get:
 *     summary: Get upcoming sessions for a user
 *     tags: [User Sessions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of upcoming sessions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/upcoming/:user_id", sessionsController.getUpcomingSessions);

/**
 * @swagger
 * /api/user/sessions/history/{user_id}:
 *   get:
 *     summary: Get session history for a user
 *     tags: [User Sessions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of sessions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of sessions to skip
 *     responses:
 *       200:
 *         description: List of completed/cancelled sessions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/history/:user_id", sessionsController.getSessionHistory);

module.exports = router;