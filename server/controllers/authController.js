const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmailNotification } = require("../utils/email");
const userModel = require("../models/userModel");
const { getAutoApproval } = require("../utils/autoApproval");

const accommodationCodes = {
  Hotel: "HTL", Condotel: "CON", "Serviced Residence": "SER", Resort: "RES",
  Apartelle: "APA", Motel: "MOT", "Pension House": "PEN", "Home Stay Site": "HSS",
  "Tourist Inn": "TIN", Other: "OTH"
};

exports.signup = async (req, res) => {
  try {
    const {
      username, email, password, phone_number, registered_owner, tin,
      company_name, company_address, accommodation_type, number_of_rooms,
      region, province, municipality, barangay, dateEstablished
    } = req.body;
    const accommodation_code = accommodationCodes[accommodation_type] || "OTH";
    const hashedPassword = await bcrypt.hash(password, 10);
    // Determine approval state
    const is_approved = getAutoApproval();
    const user = await userModel.createUser({
      username, email, hashedPassword, phone_number, registered_owner, tin,
      company_name, company_address, accommodation_type, accommodation_code,
      number_of_rooms, region, province, municipality, barangay, dateEstablished,
      is_approved
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findUserByUsername(username);
    if (!user) return res.status(400).json("Invalid credentials");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json("Invalid credentials");
    if (!user.is_approved) return res.status(400).json("Waiting for admin approval");
    if (!user.is_active) return res.status(400).json("Account is deactivated");
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.getUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findUserById(decoded.user_id);
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    await userModel.updateProfilePicture(decoded.user_id, profilePictureUrl);
    res.json({ profile_picture: profilePictureUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateRooms = async (req, res) => {
  try {
    const { number_of_rooms } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userModel.updateNumberOfRooms(decoded.user_id, number_of_rooms);
    res.json({ message: "Number of rooms updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Email not found" });
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await userModel.updateResetToken(email, resetToken, Date.now() + 3600000);
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
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findUserByResetToken(token);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updatePasswordAndClearReset(decoded.email, hashedPassword);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again later." });
  }
};