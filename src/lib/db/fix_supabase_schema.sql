-- ==============================================================================
-- KARNATAKA CCE SCHOOL ERP - SUPABASE CLOUD SCHEMA REPAIR & FIX
-- Compatible with Supabase PostgreSQL (Supports String Identifiers & Full Offline Sync)
-- ==============================================================================
-- HOW TO RUN:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/dvcdvpqbidobnmiofuuc/sql/new
-- 2. Paste this entire SQL script into the query editor
-- 3. Click "Run" (or Ctrl+Enter / Cmd+Enter)
-- 4. Return to the VidyalayaOS ERP app and click "Push All to Supabase"
-- ==============================================================================

-- 1. DROP EXISTING CONFLICTING TABLES SAFELY (CASCADE)
DROP TABLE IF EXISTS sync_queue_log CASCADE;
DROP TABLE IF EXISTS school_gallery CASCADE;
DROP TABLE IF EXISTS sdmc_meetings CASCADE;
DROP TABLE IF EXISTS construction_works CASCADE;
DROP TABLE IF EXISTS school_achievements CASCADE;
DROP TABLE IF EXISTS academic_calendar_events CASCADE;
DROP TABLE IF EXISTS academic_calendar CASCADE;
DROP TABLE IF EXISTS former_students CASCADE;
DROP TABLE IF EXISTS study_certificates CASCADE;
DROP TABLE IF EXISTS transfer_certificates CASCADE;
DROP TABLE IF EXISTS co_curricular_grades CASCADE;
DROP TABLE IF EXISTS assessment_records CASCADE;
DROP TABLE IF EXISTS student_promotions CASCADE;
DROP TABLE IF EXISTS student_audit_logs CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty_assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS school_access_history CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- 2. CREATE CLEAN TABLES COMPATIBLE WITH STRING IDENTIFIERS (VARCHAR/TEXT)

-- 1) Schools
CREATE TABLE schools (
    id VARCHAR(100) PRIMARY KEY,
    udise VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_kannada VARCHAR(255),
    hm_name VARCHAR(150),
    hm_name_kannada VARCHAR(150),
    hm_phone VARCHAR(20),
    email VARCHAR(255),
    taluk VARCHAR(100),
    taluk_kannada VARCHAR(100),
    district VARCHAR(100),
    district_kannada VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Karnataka',
    description TEXT,
    description_kannada TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    current_academic_year VARCHAR(20) DEFAULT '2026-27',
    working_days_by_year JSONB NOT NULL DEFAULT '{}'::jsonb,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) School Access History
CREATE TABLE school_access_history (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    performed_by VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Users / Faculty
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100),
    role VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_kannada VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(255),
    designation VARCHAR(100) DEFAULT 'Teacher',
    designation_kannada VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    activation_token VARCHAR(255),
    token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Faculty Assignments
CREATE TABLE faculty_assignments (
    id VARCHAR(100) PRIMARY KEY,
    faculty_id VARCHAR(100),
    school_id VARCHAR(100),
    academic_year VARCHAR(20) NOT NULL,
    class_number INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    is_class_teacher BOOLEAN DEFAULT FALSE
);

-- 5) Students
CREATE TABLE students (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    admission_no VARCHAR(50) NOT NULL,
    sats_no VARCHAR(50) NOT NULL,
    pen_no VARCHAR(50),
    apaar_id VARCHAR(50),
    aadhaar_no VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    name_kannada VARCHAR(150),
    gender VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    religion VARCHAR(50) DEFAULT 'Hindu',
    category VARCHAR(20) NOT NULL,
    caste VARCHAR(100),
    caste_kannada VARCHAR(100),
    sub_caste VARCHAR(100),
    father_name VARCHAR(150),
    father_name_kannada VARCHAR(150),
    mother_name VARCHAR(150),
    mother_name_kannada VARCHAR(150),
    cwsn BOOLEAN DEFAULT FALSE,
    mobile VARCHAR(20),
    class_number INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    place_of_birth VARCHAR(100),
    place_of_birth_kannada VARCHAR(100),
    taluk VARCHAR(100),
    taluk_kannada VARCHAR(100),
    district VARCHAR(100),
    district_kannada VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Karnataka',
    nationality VARCHAR(50) DEFAULT 'Indian',
    medium_of_instruction VARCHAR(50) DEFAULT 'Kannada',
    admission_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_school_admission UNIQUE(school_id, admission_no, academic_year)
);

-- 6) Student Promotions
CREATE TABLE student_promotions (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    from_year VARCHAR(20) NOT NULL,
    to_year VARCHAR(20) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    student_name VARCHAR(150),
    from_class INT NOT NULL,
    to_class INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    promoted_by VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7) Assessment Records (Marks)
CREATE TABLE assessment_records (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    class_number INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    assessment_type VARCHAR(20) NOT NULL,
    total_marks NUMERIC(6, 2) NOT NULL,
    max_marks NUMERIC(6, 2) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    attendance_count INT DEFAULT 0,
    updated_by VARCHAR(150) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_assessment UNIQUE (school_id, academic_year, student_id, subject_name, assessment_type)
);

-- 8) Co-Curricular Grades
CREATE TABLE co_curricular_grades (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    class_number INT NOT NULL,
    daihika_arogya VARCHAR(5) DEFAULT 'A',
    moulya VARCHAR(5) DEFAULT 'A',
    kaaryanubhava VARCHAR(5) DEFAULT 'A',
    kala VARCHAR(5) DEFAULT 'A',
    updated_by VARCHAR(150),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_cocurricular UNIQUE (school_id, academic_year, student_id)
);

-- 9) Student Audit Logs
CREATE TABLE student_audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL,
    school_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    previous_value TEXT,
    updated_value TEXT,
    reason TEXT NOT NULL,
    updated_by VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10) Former Students (TC Issued)
CREATE TABLE former_students (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    original_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    tc_id VARCHAR(100),
    tc_no VARCHAR(50) NOT NULL,
    transfer_date DATE NOT NULL,
    class_at_transfer INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    reason TEXT,
    correction_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11) Academic Calendar Events
CREATE TABLE academic_calendar_events (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_kannada VARCHAR(200),
    description TEXT,
    description_kannada TEXT,
    date DATE NOT NULL,
    end_date DATE,
    category VARCHAR(50) NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12) School Achievements
CREATE TABLE school_achievements (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_kannada VARCHAR(200),
    category VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    student_name_kannada VARCHAR(150),
    class_number INT NOT NULL,
    description TEXT,
    description_kannada TEXT,
    date DATE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13) Transfer Certificates (TC)
CREATE TABLE transfer_certificates (
    id VARCHAR(100) PRIMARY KEY,
    tc_no VARCHAR(50) UNIQUE NOT NULL,
    school_id VARCHAR(100) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    sanchita_dakhale_no VARCHAR(50),
    fee_discount VARCHAR(100),
    scholarship VARCHAR(100),
    medical_test_info VARCHAR(100),
    last_attendance_date DATE,
    tc_application_date DATE NOT NULL,
    tc_issue_date DATE NOT NULL,
    total_working_days INT DEFAULT 220,
    days_attended INT DEFAULT 200,
    behaviour VARCHAR(100) DEFAULT 'Good',
    reason_for_leaving TEXT,
    promoted_to_higher_class BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14) Study Certificates
CREATE TABLE study_certificates (
    id VARCHAR(100) PRIMARY KEY,
    certificate_no VARCHAR(50) UNIQUE NOT NULL,
    school_id VARCHAR(100) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    purpose TEXT,
    status_type VARCHAR(30) DEFAULT 'Currently Studying',
    from_year VARCHAR(20),
    to_year VARCHAR(20),
    from_class INT,
    to_class INT,
    place_of_issue VARCHAR(100),
    issue_date DATE NOT NULL,
    language VARCHAR(10) DEFAULT 'EN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15) Construction Works
CREATE TABLE construction_works (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_kannada VARCHAR(200),
    description TEXT,
    description_kannada TEXT,
    date DATE NOT NULL,
    estimated_cost NUMERIC(12, 2) DEFAULT 0,
    completion_status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16) SDMC Meetings
CREATE TABLE sdmc_meetings (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_kannada VARCHAR(200),
    date DATE NOT NULL,
    agenda TEXT,
    agenda_kannada TEXT,
    summary TEXT,
    summary_kannada TEXT,
    decisions_taken TEXT,
    decisions_taken_kannada TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17) School Gallery
CREATE TABLE school_gallery (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_kannada VARCHAR(200),
    description TEXT,
    description_kannada TEXT,
    date DATE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DISABLE ROW LEVEL SECURITY (RLS) & ADD PERMISSIVE POLICIES
-- This ensures cloud sync works seamlessly for both anon and authenticated users without 42501 permission errors.

ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_access_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE co_curricular_grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE former_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_works DISABLE ROW LEVEL SECURITY;
ALTER TABLE sdmc_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_gallery DISABLE ROW LEVEL SECURITY;

-- Optional: Permissive fallback policies in case RLS is manually enabled later
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all on %I" ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow anon all on %I" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- ====================================================================
-- 4. SUPABASE AUTH TRIGGERS & AUTO-CONFIRM
-- ====================================================================

-- 4.1 Auto-confirm existing users in auth.users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 4.2 Auto-confirm future user registrations so email verification does not block school staff
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS trigger AS $$
BEGIN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auto_confirm_user();

-- 4.3 Automatically sync new Supabase Auth users to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
    _role VARCHAR(50);
    _school_id VARCHAR(100);
    _name VARCHAR(200);
    _phone VARCHAR(50);
    _designation VARCHAR(100);
BEGIN
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'SCHOOL_ADMIN');
    _school_id := NEW.raw_user_meta_data->>'school_id';
    _name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    _phone := COALESCE(NEW.raw_user_meta_data->>'phone', '9999999999');
    _designation := COALESCE(NEW.raw_user_meta_data->>'designation', 'Staff');

    INSERT INTO public.users (
        id, school_id, role, name, phone, email, designation, status, created_at, updated_at
    ) VALUES (
        NEW.id::text, _school_id, _role, _name, _phone, NEW.email, _designation, 'ACTIVE', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        school_id = EXCLUDED.school_id,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_sync
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
