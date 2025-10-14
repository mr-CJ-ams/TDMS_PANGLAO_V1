-- Create all tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_approved BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(15),
    registered_owner VARCHAR(255),
    tin VARCHAR(20),
    company_address TEXT,
    accommodation_type VARCHAR(50),
    number_of_rooms INTEGER,
    company_name VARCHAR(255),
    accommodation_code VARCHAR(3),
    reset_token VARCHAR(255),
    reset_token_expiry BIGINT,
    profile_picture TEXT,
    region VARCHAR(255),
    province VARCHAR(255),
    municipality VARCHAR(255),
    barangay VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    date_established DATE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE INDEX idx_users_verification_token ON users(email_verification_token);

-- Foreign key references
ALTER TABLE draft_stays
  ADD CONSTRAINT draft_stays_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE draft_submissions
  ADD CONSTRAINT draft_submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE submissions
  ADD CONSTRAINT submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

------------------------------------------------------------------------------------------------------------


CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    penalty_paid BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMPTZ,
    is_late BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    penalty_amount NUMERIC(10,2) DEFAULT 0.0,
    average_guest_nights NUMERIC(10,2),
    average_room_occupancy_rate NUMERIC(10,2),
    average_guests_per_room NUMERIC(10,2),
    penalty BOOLEAN DEFAULT FALSE,
    number_of_rooms INTEGER,
    receipt_number VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_submissions_month_year ON submissions(month, year);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_user_month_year ON submissions(user_id, month, year);

-- Foreign key reference already handled inline:
-- user_id → users(user_id) ON DELETE CASCADE

-- Referenced by daily_metrics (so you'd need):
-- In daily_metrics:
--   submission_id INTEGER REFERENCES submissions(submission_id) ON DELETE CASCADE

-- ------------------------------------------------------------------------------------------------------

CREATE TABLE daily_metrics (
    metric_id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(submission_id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    check_ins INTEGER NOT NULL,
    overnight INTEGER NOT NULL,
    occupied INTEGER NOT NULL
);

---------------------------------------------------------------------------------------------------------

CREATE TABLE guests (
    guest_id SERIAL PRIMARY KEY,
    metric_id INTEGER REFERENCES daily_metrics(metric_id) ON DELETE CASCADE,
    room_number INTEGER NOT NULL,
    gender VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    is_check_in BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_guests_metric ON guests(metric_id);
-- Note: idx_guests_metric_id is a duplicate of idx_guests_metric. 
-- You can keep just one of them unless they serve different purposes.

-----------------------------------------------------------------------------------------------------

CREATE TABLE draft_submissions (
    draft_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    "data" JSONB,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT draft_submissions_user_id_month_year_key UNIQUE (user_id, month, year)
);

CREATE INDEX idx_draft_submissions_month_year ON draft_submissions(month, year);
CREATE INDEX idx_draft_submissions_stayid ON draft_submissions(("data" ->> 'stayId'));
CREATE INDEX idx_draft_submissions_user ON draft_submissions(user_id);
