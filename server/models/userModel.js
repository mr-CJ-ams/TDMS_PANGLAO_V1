const pool = require("../db");

exports.createUser = async (user) => {
  const {
    email, hashedPassword, phone_number, registered_owner, tin,
    company_name, company_address, accommodation_type, accommodation_code,
    number_of_rooms, region, province, municipality, barangay, dateEstablished,
    is_approved = false
  } = user;

  // Check if user already exists (from email verification)
  const existingUser = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
  
  if (existingUser.rows.length > 0) {
    // Update existing user with full registration data
    const res = await pool.query(
      `UPDATE users SET 
        password = $1, phone_number = $2, registered_owner = $3, 
        tin = $4, company_name = $5, company_address = $6, accommodation_type = $7, 
        accommodation_code = $8, number_of_rooms = $9, region = $10, province = $11, 
        municipality = $12, barangay = $13, date_established = $14, is_approved = $15,
        email_verification_token = NULL, email_verification_expires = NULL
       WHERE email = $16 RETURNING *`,
      [hashedPassword, phone_number, registered_owner, tin, company_name, 
       company_address, accommodation_type, accommodation_code, number_of_rooms, 
       region, province, municipality, barangay, dateEstablished, is_approved, email]
    );
    return res.rows[0];
  } else {
    // Create new user
    const res = await pool.query(
      "INSERT INTO users (email, password, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms, region, province, municipality, barangay, date_established, is_approved) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *",
      [email, hashedPassword, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms, region, province, municipality, barangay, dateEstablished, is_approved]
    );
    return res.rows[0];
  }
};

exports.findUserByEmail = async (email) => {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};

exports.findUserById = async (user_id) => {
  const res = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
  return res.rows[0];
};

exports.updateProfilePicture = async (user_id, profilePictureUrl) => {
  await pool.query("UPDATE users SET profile_picture = $1 WHERE user_id = $2", [profilePictureUrl, user_id]);
};

exports.updateNumberOfRooms = async (user_id, number_of_rooms) => {
  await pool.query("UPDATE users SET number_of_rooms = $1 WHERE user_id = $2", [number_of_rooms, user_id]);
};

exports.updateResetToken = async (email, resetToken, expiry) => {
  await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
    [resetToken, expiry, email]
  );
};

exports.findUserByResetToken = async (token) => {
  const res = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2", [token, Date.now()]);
  return res.rows[0];
};

exports.updatePasswordAndClearReset = async (email, hashedPassword) => {
  await pool.query(
    "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2",
    [hashedPassword, email]
  );
};

// Add email verification functions
exports.createEmailVerification = async (email, token, expiresAt) => {
  // First check if user exists
  const existingUser = await pool.query("SELECT email FROM users WHERE email = $1", [email]);
  
  if (existingUser.rows.length > 0) {
    // Update existing user with verification token
    const res = await pool.query(
      "UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3 RETURNING email",
      [token, expiresAt, email]
    );
    return res.rows[0];
  } else {
    // Create a temporary user record with just email and verification data
    const res = await pool.query(
      "INSERT INTO users (email, email_verification_token, email_verification_expires, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING email",
      [email, token, expiresAt, 'temp_password', 'user']
    );
    return res.rows[0];
  }
};

exports.verifyEmailToken = async (email, token) => {
  const res = await pool.query(
    "SELECT email FROM users WHERE email = $1 AND email_verification_token = $2 AND email_verification_expires > NOW()",
    [email, token]
  );
  return res.rows[0];
};

exports.markEmailAsVerified = async (email) => {
  await pool.query(
    "UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE email = $1",
    [email]
  );
};

exports.isEmailVerified = async (email) => {
  const res = await pool.query(
    "SELECT email_verified FROM users WHERE email = $1",
    [email]
  );
  return res.rows[0]?.email_verified || false;
};

exports.cleanupExpiredTokens = async () => {
  await pool.query(
    "UPDATE users SET email_verification_token = NULL, email_verification_expires = NULL WHERE email_verification_expires < NOW()"
  );
};