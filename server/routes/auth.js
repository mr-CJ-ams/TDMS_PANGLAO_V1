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
      "INSERT INTO users (username, email, password, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
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

    if (!user.rows[0].is_approved) return res.status(400).json("Waiting for admin approval");

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

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ email }, "tourismSecretKey", { expiresIn: "1h" });

    // Save the reset token and expiry in the database
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [resetToken, Date.now() + 3600000, email] // 1 hour expiry
    );

    // Generate the reset link
    const resetLink = `http://localhost:5000/reset-password/${resetToken}`; // Frontend reset password page

    // Send the reset link via email
    const emailSubject = "Password Reset Request";
    const emailMessage = `Click the link to reset your password: ${resetLink}`;
    sendEmailNotification(email, emailSubject, emailMessage);

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset link" });
  }
});


module.exports = router;
