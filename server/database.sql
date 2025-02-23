CREATE DATABASE rbac;

-- Create the users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_approved BOOLEAN DEFAULT false,
    phone_number VARCHAR(15),
    registered_owner VARCHAR(255),
    tin VARCHAR(20),
    company_name VARCHAR(255),
    company_address VARCHAR(255),
    accommodation_type VARCHAR(50),
    accommodation_code VARCHAR(3),
    number_of_rooms INT,
    reset_token VARCHAR(255),
    reset_token_expiry BIGINT,
    profile_picture TEXT,
    region VARCHAR(255),
    province VARCHAR(255),
    municipality VARCHAR(255),
    barangay VARCHAR(255)
);

-- Create the submissions table
CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    penalty BOOLEAN DEFAULT FALSE,
    penalty_paid BOOLEAN DEFAULT false,
    penalty_amount NUMERIC DEFAULT 0.0,
    average_guest_nights NUMERIC(10,2),
    average_room_occupancy_rate NUMERIC(10,2),
    average_guests_per_room NUMERIC(10,2)
);

-- Create indexes for performance optimization
CREATE INDEX idx_submissions_month_year ON submissions (month, year);
CREATE INDEX idx_submissions_user ON submissions (user_id);

-- Create the daily_metrics table
CREATE TABLE daily_metrics (
    metric_id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(submission_id) ON DELETE CASCADE,
    day INT NOT NULL,
    check_ins INT NOT NULL,
    overnight INT NOT NULL,
    occupied INT NOT NULL
);

-- Create the guests table
CREATE TABLE guests (
    guest_id SERIAL PRIMARY KEY,
    metric_id INT REFERENCES daily_metrics(metric_id) ON DELETE CASCADE,
    room_number INT NOT NULL,
    gender VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    is_check_in BOOLEAN DEFAULT TRUE
);

-- Create indexes for optimization
CREATE INDEX idx_guests_metric ON guests (metric_id);

CREATE INDEX idx_submissions_user_month_year ON submissions (user_id, month, year);
CREATE INDEX idx_guests_metric_id ON guests (metric_id);



-- Predefined Admin
INSERT INTO users (username, email, password, role, is_approved)
VALUES ('TDMS Admin', 'statisticstourismpanglao@gmail.com', 
        '$2b$10$MjoygsGSlw.3JSrEqA300.X/Sv.Tv1OZPEdC8pmrAniGrQpPbONia', 
        'admin', true);
