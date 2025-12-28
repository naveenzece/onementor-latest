const db = require("../config/mysql");
const { validateFields, validateEmail, validateMobileNumber, validateName } = require('../util/userValidation');

const fetchUser = (req, res) => {
  const fetchQuery = "SELECT * FROM coach";
  db.query(fetchQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "user not found" });
    }

    return res.status(200).json({ message: "User data fetched successfully", data: result });
  });
};

const createUser = (req, res) => {
  const { name, emailId, phone } = req.body;

  const validations = [
    validateName(name, 3, 50),
    validateEmail(emailId),
    validateMobileNumber(phone),
  ];

  const validationError = validateFields(validations);

  if (validationError !== true) {
    return res.status(400).json({ error: validationError });
  }

  const checkUserQuery = "SELECT * FROM coach WHERE emailId = ?";
  db.query(checkUserQuery, [emailId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const currentTime = Date.now();
    console.log(currentTime);

    const insertUserQuery = "INSERT INTO coach (name, emailId, phone) VALUES (?, ?, ?)";
    db.query(insertUserQuery, [name, emailId, phone], (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      return res.status(201).json({ message: "User created successfully" });
    });
  });
};

const editUser = (req, res) => {
  const { name, emailId, phone } = req.body;
  const { id } = req.params;

  const validations = [
    name ? validateName(name) : true,
    emailId ? validateEmail(emailId) : true,
    phone ? validateMobileNumber(phone) : true
  ];

  const validationError = validateFields(validations);

  if (validationError !== true) {
    return res.status(400).json({ error: validationError });
  }

  const fetchQuery = "SELECT * FROM coach WHERE id=?";
  db.query(fetchQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "User not found with this ID" });
    }

    const updateQuery = "UPDATE coach SET name=?, emailId=?, phone=? WHERE id=?";
    db.query(updateQuery, [name || result[0].name, emailId || result[0].emailId, phone || result[0].phone, id], (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      return res.status(200).json({ message: "User updated successfully" });
    });
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM coach WHERE id=?";
  const fetchQuery = "SELECT * FROM coach WHERE id=?";
  db.query(fetchQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "User not found with this ID" });
    }

    db.query(deleteQuery, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      return res.status(200).json({ message: "User deleted successfully" });
    });
  });
};

const createRegistrationPayment = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 1. Get mentor details
    // Assuming db.query returns a promise and can be destructured like mysql2/promise
    const [mentorRows] = await db.query(
      "SELECT id, name, email, phone FROM users WHERE id = ? AND role = 'mentor'",
      [user_id]
    );

    if (mentorRows.length === 0) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    const mentor = mentorRows[0];

    // 1.1 Check if already paid
    const [profileRows] = await db.query(
      "SELECT registered FROM mentor_profiles WHERE user_id = ?",
      [user_id]
    );

    if (profileRows.length > 0 && profileRows[0].registered === 1) {
      return res.status(400).json({
        error: "Registration fee already paid",
        alreadyPaid: true
      });
    }

    // 2. Get registration fee amount
    const [feeRows] = await db.query(
      "SELECT amount FROM registration_fees WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
    );

    if (feeRows.length === 0) {
      return res.status(404).json({ error: "Registration fee not found" });
    }
    const amount = feeRows[0].amount;

    // 3. Create Juspay session
    const { createRegistrationFeeSession } = require("../services/paymentService");
    const orderId = `REG_${user_id}_${Date.now()}`;

    const sessionResult = await createRegistrationFeeSession({
      order_id: orderId,
      amount: amount,
      customer_id: `mentor_${user_id}`,
      customer_email: mentor.email,
      customer_phone: mentor.phone,
      first_name: mentor.name.split(' ')[0],
      last_name: mentor.name.split(' ').slice(1).join(' ') || '',
      description: "Mentor Registration Fee",
      metadata: {
        user_id: user_id.toString(),
        type: 'registration_fee'
      }
    });

    if (!sessionResult.success) {
      return res.status(400).json({
        error: sessionResult.error || "Failed to create payment session",
        details: sessionResult.responseData
      });
    }

    // 4. Record the payment in registration_payments
    await db.query(
      "INSERT INTO registration_payments (mentor_id, amount, status, order_id) VALUES (?, ?, 'pending', ?)",
      [user_id, amount, orderId]
    );

    return res.status(200).json({
      message: "Registration fee session created",
      session: sessionResult,
      payment_url: sessionResult.paymentLinks?.web
    });

  } catch (error) {
    console.error("Error in createRegistrationPayment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { fetchUser, createUser, editUser, deleteUser, createRegistrationPayment };