const express = require("express");
const router = express.Router();
const { getRegistrationFee, updateRegistrationFee } = require("../controller/registrationFeeController");

// Public or protected? 
// For now, let's keep it simple. Usually admins update this, and users/mentors view it.
router.get("/", getRegistrationFee);

module.exports = router;
