const express = require("express");
const router = express.Router();
const sessionsController = require("../../controller/coach/sessions");

router.get("/upcoming/:mentor_id", sessionsController.getMentorUpcomingSessions);

module.exports = router;
