const pool = require("../db");

exports.createUser = async (user) => {
  const {
    username, email, hashedPassword, phone_number, registered_owner, tin,
    company_name, company_address, accommodation_type, accommodation_code,
    number_of_rooms, region, province, municipality, barangay, dateEstablished,
    is_approved = false
  } = user;
  const res = await pool.query(
    "INSERT INTO users (username, email, password, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms, region, province, municipality, barangay, date_established, is_approved) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *",
    [username, email, hashedPassword, phone_number, registered_owner, tin, company_name, company_address, accommodation_type, accommodation_code, number_of_rooms, region, province, municipality, barangay, dateEstablished, is_approved]
  );
  return res.rows[0];
};

exports.findUserByUsername = async (username) => {
  const res = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  return res.rows[0];
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