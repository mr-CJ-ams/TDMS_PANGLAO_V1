-- Create all tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
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
    date_established DATE
);

CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    penalty_paid BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMPTZ,  -- Changed from TIMESTAMP WITH TIME ZONE
    is_late BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    penalty_amount DECIMAL(10,2) DEFAULT 0.0,
    average_guest_nights DECIMAL(10,2),
    average_room_occupancy_rate DECIMAL(10,2),
    average_guests_per_room DECIMAL(10,2),
    penalty BOOLEAN DEFAULT FALSE,
    number_of_rooms INTEGER
);

CREATE TABLE daily_metrics (
    metric_id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(submission_id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    check_ins INTEGER NOT NULL,
    overnight INTEGER NOT NULL,
    occupied INTEGER NOT NULL
);

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

CREATE TABLE draft_submissions (
    draft_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    data JSONB NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, month, year)
);

-- Create indexes
CREATE INDEX idx_submissions_month_year ON submissions (month, year);
CREATE INDEX idx_submissions_user ON submissions (user_id);
CREATE INDEX idx_submissions_user_month_year ON submissions (user_id, month, year);
CREATE INDEX idx_guests_metric ON guests (metric_id);
CREATE INDEX idx_guests_metric_id ON guests (metric_id);
CREATE INDEX idx_draft_submissions_user ON draft_submissions (user_id);
CREATE INDEX idx_draft_submissions_month_year ON draft_submissions (month, year);

-- Optional tables
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(255)
);