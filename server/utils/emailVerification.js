const jwt = require("jsonwebtoken");

const EMAIL_VERIFICATION_SECRET = process.env.JWT_SECRET || "tourismSecretKey";

// Generate a token (valid for 24h)
exports.generateVerificationToken = (email) => {
  return jwt.sign({ email }, EMAIL_VERIFICATION_SECRET, { expiresIn: "24h" });
};

// Validate token and match email
exports.validateVerificationToken = (token, email) => {
  try {
    const decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET);
    return decoded.email === email;
  } catch {
    return false;
  }
};