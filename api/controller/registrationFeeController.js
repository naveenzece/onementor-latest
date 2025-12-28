const db = require("../config/mysql");

const getRegistrationFee = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT amount FROM registration_fees WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Registration fee not found" });
        }

        res.json({ amount: rows[0].amount });
    } catch (error) {
        console.error("Error fetching registration fee:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getRegistrationFee,
};
