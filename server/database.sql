--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: daily_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_metrics (
    metric_id integer NOT NULL,
    submission_id integer,
    day integer NOT NULL,
    check_ins integer NOT NULL,
    overnight integer NOT NULL,
    occupied integer NOT NULL
);


ALTER TABLE public.daily_metrics OWNER TO postgres;

--
-- Name: daily_metrics_metric_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_metrics_metric_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_metrics_metric_id_seq OWNER TO postgres;

--
-- Name: daily_metrics_metric_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_metrics_metric_id_seq OWNED BY public.daily_metrics.metric_id;


--
-- Name: draft_stays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.draft_stays (
    id integer NOT NULL,
    user_id integer NOT NULL,
    day integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    room_number integer NOT NULL,
    stay_id character varying(255) NOT NULL,
    is_check_in boolean DEFAULT false,
    length_of_stay integer DEFAULT 1,
    start_day integer NOT NULL,
    start_month integer NOT NULL,
    start_year integer NOT NULL,
    guests jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.draft_stays OWNER TO postgres;

--
-- Name: draft_stays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.draft_stays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.draft_stays_id_seq OWNER TO postgres;

--
-- Name: draft_stays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.draft_stays_id_seq OWNED BY public.draft_stays.id;


--
-- Name: draft_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.draft_submissions (
    draft_id integer NOT NULL,
    user_id integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    data jsonb,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.draft_submissions OWNER TO postgres;

--
-- Name: draft_submissions_draft_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.draft_submissions_draft_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.draft_submissions_draft_id_seq OWNER TO postgres;

--
-- Name: draft_submissions_draft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.draft_submissions_draft_id_seq OWNED BY public.draft_submissions.draft_id;


--
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    guest_id integer NOT NULL,
    metric_id integer,
    room_number integer NOT NULL,
    gender character varying(50) NOT NULL,
    age integer NOT NULL,
    status character varying(50) NOT NULL,
    nationality character varying(100) NOT NULL,
    is_check_in boolean DEFAULT true
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- Name: guests_guest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guests_guest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guests_guest_id_seq OWNER TO postgres;

--
-- Name: guests_guest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guests_guest_id_seq OWNED BY public.guests.guest_id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    submission_id integer NOT NULL,
    user_id integer,
    month integer NOT NULL,
    year integer NOT NULL,
    penalty_paid boolean DEFAULT false,
    deadline timestamp with time zone,
    is_late boolean DEFAULT false,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    penalty_amount numeric(10,2) DEFAULT 0.0,
    average_guest_nights numeric(10,2),
    average_room_occupancy_rate numeric(10,2),
    average_guests_per_room numeric(10,2),
    penalty boolean DEFAULT false,
    number_of_rooms integer,
    receipt_number character varying(255)
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissions_submission_id_seq OWNER TO postgres;

--
-- Name: submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_submission_id_seq OWNED BY public.submissions.submission_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    is_approved boolean DEFAULT false,
    phone_number character varying(15),
    registered_owner character varying(255),
    tin character varying(20),
    company_address text,
    accommodation_type character varying(50),
    number_of_rooms integer,
    company_name character varying(255),
    accommodation_code character varying(3),
    reset_token character varying(255),
    reset_token_expiry bigint,
    profile_picture text,
    region character varying(255),
    province character varying(255),
    municipality character varying(255),
    barangay character varying(255),
    is_active boolean DEFAULT true,
    date_established date,
    email_verification_token character varying(255),
    email_verification_expires timestamp without time zone,
    email_verified boolean DEFAULT false,
    room_names jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: daily_metrics metric_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_metrics ALTER COLUMN metric_id SET DEFAULT nextval('public.daily_metrics_metric_id_seq'::regclass);


--
-- Name: draft_stays id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_stays ALTER COLUMN id SET DEFAULT nextval('public.draft_stays_id_seq'::regclass);


--
-- Name: draft_submissions draft_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_submissions ALTER COLUMN draft_id SET DEFAULT nextval('public.draft_submissions_draft_id_seq'::regclass);


--
-- Name: guests guest_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests ALTER COLUMN guest_id SET DEFAULT nextval('public.guests_guest_id_seq'::regclass);


--
-- Name: submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.submissions_submission_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: daily_metrics daily_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_metrics
    ADD CONSTRAINT daily_metrics_pkey PRIMARY KEY (metric_id);


--
-- Name: draft_stays draft_stays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_stays
    ADD CONSTRAINT draft_stays_pkey PRIMARY KEY (id);


--
-- Name: draft_stays draft_stays_user_id_day_month_year_room_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_stays
    ADD CONSTRAINT draft_stays_user_id_day_month_year_room_number_key UNIQUE (user_id, day, month, year, room_number);


--
-- Name: draft_submissions draft_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_submissions
    ADD CONSTRAINT draft_submissions_pkey PRIMARY KEY (draft_id);


--
-- Name: draft_submissions draft_submissions_user_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_submissions
    ADD CONSTRAINT draft_submissions_user_id_month_year_key UNIQUE (user_id, month, year);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (guest_id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_draft_stays_day_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_stays_day_room ON public.draft_stays USING btree (day, room_number);


--
-- Name: idx_draft_stays_stay_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_stays_stay_id ON public.draft_stays USING btree (stay_id);


--
-- Name: idx_draft_stays_stay_info; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_stays_stay_info ON public.draft_stays USING btree (start_day, start_month, start_year, length_of_stay);


--
-- Name: idx_draft_stays_user_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_stays_user_month_year ON public.draft_stays USING btree (user_id, month, year);


--
-- Name: idx_draft_submissions_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_submissions_month_year ON public.draft_submissions USING btree (month, year);


--
-- Name: idx_draft_submissions_stayid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_submissions_stayid ON public.draft_submissions USING btree (((data ->> 'stayId'::text)));


--
-- Name: idx_draft_submissions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_draft_submissions_user ON public.draft_submissions USING btree (user_id);


--
-- Name: idx_guests_metric; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_metric ON public.guests USING btree (metric_id);


--
-- Name: idx_guests_metric_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_metric_id ON public.guests USING btree (metric_id);


--
-- Name: idx_submissions_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_month_year ON public.submissions USING btree (month, year);


--
-- Name: idx_submissions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_user ON public.submissions USING btree (user_id);


--
-- Name: idx_submissions_user_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_user_month_year ON public.submissions USING btree (user_id, month, year);


--
-- Name: idx_users_verification_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_verification_token ON public.users USING btree (email_verification_token);


--
-- Name: daily_metrics daily_metrics_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_metrics
    ADD CONSTRAINT daily_metrics_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(submission_id) ON DELETE CASCADE;


--
-- Name: draft_stays draft_stays_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_stays
    ADD CONSTRAINT draft_stays_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: draft_submissions draft_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.draft_submissions
    ADD CONSTRAINT draft_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: guests guests_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.daily_metrics(metric_id) ON DELETE CASCADE;


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

-- Add any missing columns to draft_stays if needed
ALTER TABLE draft_stays 
ADD COLUMN IF NOT EXISTS is_start_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guests JSONB;

INSERT INTO users (
    user_id,
    email,
    password,
    role,
    is_approved,
    phone_number,
    registered_owner,
    tin,
    company_address,
    accommodation_type,
    number_of_rooms,
    company_name,
    accommodation_code,
    reset_token,
    reset_token_expiry,
    profile_picture,
    region,
    province,
    municipality,
    barangay,
    is_active,
    date_established,
    email_verification_token,
    email_verification_expires,
    email_verified
)
VALUES (
    22,
    'statistics.panglaotourism@gmail.com',
    '$2b$10$1QoXEk23DUhhDKfEE2AsuOyHjSTljAStnkFgzmEBSF/CrfwbCDzQ2',
    'admin',
    TRUE,
    'N/A',
    'Panglao LGU',
    NULL,
    '',
    '',
    NULL,
    'Panglao Municipal Tourism Office',
    '',
    '',
    NULL,
    '',
    '07',
    'BOHOL',
    'PANGLAO',
    '',
    TRUE,
    NULL,
    '',
    NULL,
    FALSE
);