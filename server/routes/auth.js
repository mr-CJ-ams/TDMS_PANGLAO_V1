const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { sendEmailNotification } = require("../utils/email");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files to the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// User Signup
router.post("/signup", async (req, res) => {
  const {
    username,
    email,
    password,
    phone_number,
    registered_owner,
    tin,
    company_name,
    company_address,
    accommodation_type,
    number_of_rooms,
    region,
    province,
    municipality,
    barangay,
  } = req.body;

  // Map accommodation type to code
  const accommodationCodes = {
    Hotel: "HTL",
    Condotel: "CON",
    "Serviced Residence": "SER",
    Resort: "RES",
    Apartelle: "APA",
    Motel: "MOT",
    "Pension House": "PEN",
    "Home Stay Site": "HSS",
    "Tourist Inn": "TIN",
    Other: "OTH",
  };

  const accommodation_code = accommodationCodes[accommodation_type] || "OTH";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms, region, province, municipality, barangay) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
      [
        username,
        email,
        hashedPassword,
        phone_number,
        registered_owner,
        tin,
        company_name,
        company_address,
        accommodation_type,
        accommodation_code,
        number_of_rooms,
        region,
        province,
        municipality,
        barangay,
      ]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) return res.status(400).json("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json("Invalid credentials");

    // Check if the user is approved
    if (!user.rows[0].is_approved) return res.status(400).json("Waiting for admin approval");

    // Check if the user is active
    if (!user.rows[0].is_active) return res.status(400).json("Account is deactivated");

    const token = jwt.sign({ user_id: user.rows[0].user_id, role: user.rows[0].role }, "tourismSecretKey");

    res.json({ token, user: user.rows[0] }); // Include user details in the response
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) return res.status(400).json("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json("Invalid credentials");

    if (user.rows[0].role !== "admin") return res.status(400).json("Unauthorized access");

    const token = jwt.sign({ user_id: user.rows[0].user_id, role: user.rows[0].role }, "tourismSecretKey");

    res.json({ token, user: user.rows[0] }); // Include user details in the response
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get User Details
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "tourismSecretKey");

    // Fetch user details
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [decoded.user_id]);

    if (user.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Upload Profile Picture
router.post("/upload-profile-picture", upload.single("profile_picture"), async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "tourismSecretKey");

  try {
    const profilePictureUrl = `/uploads/${req.file.filename}`; // URL to access the uploaded file
    await pool.query("UPDATE users SET profile_picture = $1 WHERE user_id = $2", [
      profilePictureUrl,
      decoded.user_id,
    ]);
    res.json({ profile_picture: profilePictureUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update Number of Rooms
router.put("/update-rooms", async (req, res) => {
  const { number_of_rooms } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "tourismSecretKey");

  try {
    await pool.query("UPDATE users SET number_of_rooms = $1 WHERE user_id = $2", [
      number_of_rooms,
      decoded.user_id,
    ]);
    res.json({ message: "Number of rooms updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});



// server/routes/auth.js
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [resetToken, Date.now() + 3600000, email]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailSubject = "Password Reset Request";
    const emailMessage = `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
    `;
    sendEmailNotification(email, emailSubject, emailMessage);

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset link. Please try again later." });
  }
});

// server/routes/auth.js
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token is expired
    const user = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2", [token, Date.now()]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2",
      [hashedPassword, decoded.email]
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again later." });
  }
});


module.exports = router;
