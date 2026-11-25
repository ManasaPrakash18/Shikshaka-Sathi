-- Karnataka CCE School ERP Database Schema
-- Compatible with Supabase PostgreSQL (Supports String Identifiers & Full Offline Sync)

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(100) PRIMARY KEY,
    udise VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_kannada VARCHAR(255),
    hm_name VARCHAR(150) NOT NULL,
    hm_name_kannada VARCHAR(150),
    hm_phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    taluk VARCHAR(100) NOT NULL,
    taluk_kannada VARCHAR(100),
    district VARCHAR(100) NOT NULL,
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

-- 2. SCHOOL ACCESS HISTORY
CREATE TABLE IF NOT EXISTS school_access_history (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    performed_by VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100),
    role VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_kannada VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    designation VARCHAR(100) DEFAULT 'Teacher',
    designation_kannada VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    activation_token VARCHAR(255),
    token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FACULTY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS faculty_assignments (
    id VARCHAR(100) PRIMARY KEY,
    faculty_id VARCHAR(100),
    school_id VARCHAR(100),
    academic_year VARCHAR(20) NOT NULL,
    class_number INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    is_class_teacher BOOLEAN DEFAULT FALSE
);

-- 5. STUDENTS
CREATE TABLE IF NOT EXISTS students (
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
    CONSTRAINT unique_school_admission_schema UNIQUE(school_id, admission_no, academic_year)
);

-- 6. STUDENT PROMOTIONS
CREATE TABLE IF NOT EXISTS student_promotions (
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

-- 7. ASSESSMENT RECORDS
CREATE TABLE IF NOT EXISTS assessment_records (
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
    CONSTRAINT unique_student_assessment_schema UNIQUE (school_id, academic_year, student_id, subject_name, assessment_type)
);

-- 8. CO-CURRICULAR GRADES
CREATE TABLE IF NOT EXISTS co_curricular_grades (
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
    CONSTRAINT unique_student_cocurricular_schema UNIQUE (school_id, academic_year, student_id)
);

-- 9. STUDENT AUDIT LOGS
CREATE TABLE IF NOT EXISTS student_audit_logs (
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

-- 10. FORMER STUDENTS
CREATE TABLE IF NOT EXISTS former_students (
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

-- 11. ACADEMIC CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS academic_calendar_events (
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

-- 12. SCHOOL ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS school_achievements (
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

-- 13. TRANSFER CERTIFICATES
CREATE TABLE IF NOT EXISTS transfer_certificates (
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

-- 14. STUDY CERTIFICATES
CREATE TABLE IF NOT EXISTS study_certificates (
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

-- 15. CONSTRUCTION WORKS
CREATE TABLE IF NOT EXISTS construction_works (
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

-- 16. SDMC MEETINGS
CREATE TABLE IF NOT EXISTS sdmc_meetings (
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

-- 17. SCHOOL GALLERY
CREATE TABLE IF NOT EXISTS school_gallery (
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

-- DISABLE ROW LEVEL SECURITY (RLS) FOR FULL OFFLINE-SYNC OPERATION
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
