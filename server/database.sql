CREATE DATABASE rbac;

-- Drop the table if it exists
IF OBJECT_ID('users', 'U') IS NOT NULL
    DROP TABLE users;

-- Create the table
CREATE TABLE users
(
    user_id INT NOT NULL IDENTITY(1,1),
    username NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) DEFAULT 'user',
    is_approved BIT DEFAULT 0,
    phone_number NVARCHAR(15),
    registered_owner NVARCHAR(255),
    tin NVARCHAR(20),
    company_address NVARCHAR(255),
    accommodation_type NVARCHAR(50),
    number_of_rooms INT,
    company_name NVARCHAR(255),
    accommodation_code NVARCHAR(3),
    reset_token_expiry BIGINT,
    profile_picture NVARCHAR(MAX),
    region NVARCHAR(255),
    province NVARCHAR(255),
    municipality NVARCHAR(255),
    barangay NVARCHAR(255),
    reset_token NVARCHAR(255),
    is_active BIT DEFAULT 1,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);


-- Drop the table if it exists
IF OBJECT_ID('submissions', 'U') IS NOT NULL
    DROP TABLE submissions;

-- Create the table
CREATE TABLE submissions
(
    submission_id INT NOT NULL IDENTITY(1,1),
    user_id INT,
    month INT NOT NULL,
    year INT NOT NULL,
    penalty_paid BIT DEFAULT 0,
    deadline DATETIMEOFFSET,
    is_late BIT DEFAULT 0,
    submitted_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    penalty_amount DECIMAL(10,2) DEFAULT 0.0,
    average_guest_nights DECIMAL(10,2),
    average_room_occupancy_rate DECIMAL(10,2),
    average_guests_per_room DECIMAL(10,2),
    penalty BIT DEFAULT 0,
    CONSTRAINT submissions_pkey PRIMARY KEY (submission_id),
    CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Drop indexes if they exist
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_submissions_month_year' AND object_id = OBJECT_ID('submissions'))
    DROP INDEX idx_submissions_month_year ON submissions;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_submissions_user' AND object_id = OBJECT_ID('submissions'))
    DROP INDEX idx_submissions_user ON submissions;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_submissions_user_month_year' AND object_id = OBJECT_ID('submissions'))
    DROP INDEX idx_submissions_user_month_year ON submissions;

-- Create indexes
CREATE INDEX idx_submissions_month_year
    ON submissions (month ASC, year ASC);

CREATE INDEX idx_submissions_user
    ON submissions (user_id ASC);

CREATE INDEX idx_submissions_user_month_year
    ON submissions (user_id ASC, month ASC, year ASC);


-- Drop the table if it exists
IF OBJECT_ID('daily_metrics', 'U') IS NOT NULL
    DROP TABLE daily_metrics;

-- Create the table
CREATE TABLE daily_metrics
(
    metric_id INT NOT NULL IDENTITY(1,1), -- Use IDENTITY for auto-increment in SQL Server
    submission_id INT,
    day INT NOT NULL,
    check_ins INT NOT NULL,
    overnight INT NOT NULL,
    occupied INT NOT NULL,
    CONSTRAINT daily_metrics_pkey PRIMARY KEY (metric_id),
    CONSTRAINT daily_metrics_submission_id_fkey FOREIGN KEY (submission_id)
        REFERENCES submissions (submission_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Drop the table if it exists
IF OBJECT_ID('guests', 'U') IS NOT NULL
    DROP TABLE guests;

-- Create the table
CREATE TABLE guests
(
    guest_id INT NOT NULL IDENTITY(1,1),
    metric_id INT,
    room_number INT NOT NULL,
    gender NVARCHAR(50) NOT NULL,
    age INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    nationality NVARCHAR(100) NOT NULL,
    is_check_in BIT DEFAULT 1,
    CONSTRAINT guests_pkey PRIMARY KEY (guest_id),
    CONSTRAINT guests_metric_id_fkey FOREIGN KEY (metric_id)
        REFERENCES daily_metrics (metric_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Drop indexes if they exist
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_guests_metric' AND object_id = OBJECT_ID('guests'))
    DROP INDEX idx_guests_metric ON guests;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_guests_metric_id' AND object_id = OBJECT_ID('guests'))
    DROP INDEX idx_guests_metric_id ON guests;

-- Create indexes
CREATE INDEX idx_guests_metric
    ON guests (metric_id ASC);

CREATE INDEX idx_guests_metric_id
    ON guests (metric_id ASC);


-- Predefined Admin
INSERT INTO users (username, email, password, role, is_approved)
VALUES ('TDMS Admin', 'statisticstourismpanglao@gmail.com', 
        '$2b$10$MjoygsGSlw.3JSrEqA300.X/Sv.Tv1OZPEdC8pmrAniGrQpPbONia', 
        'admin', true);
