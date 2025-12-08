const express = require("express");
const router = express.Router();
const bookingController = require("../../controller/user/bookslot");

// Book a slot (creates booking and initiates payment)
router.post("/", bookingController.bookSlot);

// Get user bookings
router.get("/user/:user_id", bookingController.getUserBookings);

// Get mentor bookings
router.get("/mentor/:mentor_id", bookingController.getMentorBookings);

module.exports = router;
