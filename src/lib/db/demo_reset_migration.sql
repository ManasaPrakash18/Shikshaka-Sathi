-- DESTRUCTIVE: removes all application data except the four 1-Click Demo users
-- and their two schools. Run only against the intended Supabase project.
--
-- Supabase Auth users are not modified.
--
-- IMPORTANT: this app also stores data offline in each browser's IndexedDB and
-- localStorage, and automatically uploads local data. Stop all app sessions
-- before running this script. SQL cannot clear browser storage; stale local app
-- state or built-in demo seeds may repopulate deleted rows when clients
-- reconnect. The current app has no server reset-marker flow, so this SQL-only
-- operation is not a persistent reset while client sync is enabled. A client-
-- side state reset/seed change is required before app sessions resume.
--
-- Kannada descriptions are intentionally NULL where no verified text exists.
-- Enter official Kannada wording in the app rather than machine-translating it.

BEGIN;

DELETE FROM school_access_history;
DELETE FROM faculty_assignments;
DELETE FROM students;
DELETE FROM student_promotions;
DELETE FROM assessment_records;
DELETE FROM co_curricular_grades;
DELETE FROM student_audit_logs;
DELETE FROM former_students;
DELETE FROM academic_calendar_events;
DELETE FROM school_achievements;
DELETE FROM transfer_certificates;
DELETE FROM study_certificates;
DELETE FROM construction_works;
DELETE FROM sdmc_meetings;
DELETE FROM school_gallery;

DELETE FROM users;
DELETE FROM schools;

INSERT INTO schools (
    id, udise, name, name_kannada, hm_name, hm_name_kannada, hm_phone,
    email, taluk, taluk_kannada, district, district_kannada, state,
    description, description_kannada, status, current_academic_year,
    registration_date, expiry_date, created_at, updated_at
) VALUES
(
    'school-1', '29260100102',
    'Government High School Vidyaranyapuram', 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ವಿದ್ಯಾರಣ್ಯಪುರಂ',
    'Ramesh Gowda', 'ರಮೇಶ್ ಗೌಡ', '9845123456',
    'ghs.vidyaranyapuram@karnataka.gov.in',
    'Mysuru South', 'ಮೈಸೂರು ದಕ್ಷಿಣ', 'Mysuru', 'ಮೈಸೂರು', 'Karnataka',
    'A premier government secondary school established in 1968, committed to holistic CCE education, smart classrooms, and state-level science & sports achievements.',
    NULL, 'ACTIVE', '2026-27',
    '2023-05-10T00:00:00Z', '2026-05-31T00:00:00Z',
    '2023-05-10T09:00:00Z', '2024-06-01T10:00:00Z'
),
(
    'school-2', '29200401201',
    'Government Model Higher Primary School Hassan', 'ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಹಾಸನ',
    'Savitha K', 'ಸವಿತಾ ಕೆ', '9845789123',
    'gmhps.hassan@karnataka.gov.in',
    'Hassan Urban', 'ಹಾಸನ ನಗರ', 'Hassan', 'ಹಾಸನ', 'Karnataka',
    'Model primary school providing joyful child-centric Nali-Kali and CCE education from Classes 1 to 7 with modern computer labs and mid-day meal nutrition.',
    NULL, 'ACTIVE', '2026-27',
    '2023-06-15T00:00:00Z', '2026-05-31T00:00:00Z',
    '2023-06-15T09:00:00Z', '2024-06-01T10:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    udise = EXCLUDED.udise,
    name = EXCLUDED.name,
    name_kannada = EXCLUDED.name_kannada,
    hm_name = EXCLUDED.hm_name,
    hm_name_kannada = EXCLUDED.hm_name_kannada,
    hm_phone = EXCLUDED.hm_phone,
    email = EXCLUDED.email,
    taluk = EXCLUDED.taluk,
    taluk_kannada = EXCLUDED.taluk_kannada,
    district = EXCLUDED.district,
    district_kannada = EXCLUDED.district_kannada,
    state = EXCLUDED.state,
    description = EXCLUDED.description,
    description_kannada = EXCLUDED.description_kannada,
    status = EXCLUDED.status,
    current_academic_year = EXCLUDED.current_academic_year,
    registration_date = EXCLUDED.registration_date,
    expiry_date = EXCLUDED.expiry_date,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO users (
    id, school_id, role, name, name_kannada, phone, email,
    designation, status, created_at, updated_at
) VALUES
(
    'user-platform-admin', NULL, 'PLATFORM_ADMIN',
    'H Prakash', 'ಎಚ್. ಪ್ರಕಾಶ್', '9900011122',
    'admin@karnataka.gov.in', 'Headmaster', 'ACTIVE',
    '2023-01-01T00:00:00Z', '2023-01-01T00:00:00Z'
),
(
    'user-hm-mysuru', 'school-1', 'SCHOOL_ADMIN',
    'Ramesh Gowda', 'ರಮೇಶ್ ಗೌಡ', '9845123456',
    'ramesh.gowda@ghs-mysuru.in', 'Headmaster', 'ACTIVE',
    '2023-05-10T09:00:00Z', '2024-06-01T10:00:00Z'
),
(
    'user-hm-hassan', 'school-2', 'SCHOOL_ADMIN',
    'Savitha K', 'ಸವಿತಾ ಕೆ', '9845789123',
    'savitha.k@gmhps-hassan.in', 'Headmaster', 'ACTIVE',
    '2023-06-15T09:00:00Z', '2024-06-01T10:00:00Z'
),
(
    'user-faculty-1', 'school-1', 'FACULTY',
    'Smt. Anasuya M', 'ಶ್ರೀಮತಿ ಅನಸೂಯ ಎಂ', '9845223344',
    'anasuya.m@ghs-mysuru.in', 'Senior Teacher', 'ACTIVE',
    '2023-06-01T09:00:00Z', '2024-06-01T10:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    school_id = EXCLUDED.school_id,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    name_kannada = EXCLUDED.name_kannada,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    designation = EXCLUDED.designation,
    status = EXCLUDED.status,
    activation_token = NULL,
    token_expiry = NULL,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

COMMIT;

-- Verification: expect four users, two schools, and zero remaining application
-- records in the other tables.
SELECT id, role, name, school_id
FROM users
ORDER BY id;

SELECT id, udise, name, status
FROM schools
ORDER BY id;

SELECT
    (SELECT COUNT(*) FROM users) AS user_count,
    (SELECT COUNT(*) FROM schools) AS school_count,
    (SELECT COUNT(*) FROM school_access_history) AS access_history_count,
    (SELECT COUNT(*) FROM faculty_assignments) AS faculty_assignment_count,
    (SELECT COUNT(*) FROM students) AS student_count,
    (SELECT COUNT(*) FROM student_promotions) AS promotion_count,
    (SELECT COUNT(*) FROM assessment_records) AS assessment_count,
    (SELECT COUNT(*) FROM co_curricular_grades) AS co_curricular_grade_count,
    (SELECT COUNT(*) FROM student_audit_logs) AS student_audit_log_count,
    (SELECT COUNT(*) FROM former_students) AS former_student_count,
    (SELECT COUNT(*) FROM academic_calendar_events) AS calendar_event_count,
    (SELECT COUNT(*) FROM school_achievements) AS achievement_count,
    (SELECT COUNT(*) FROM transfer_certificates) AS transfer_certificate_count,
    (SELECT COUNT(*) FROM study_certificates) AS study_certificate_count,
    (SELECT COUNT(*) FROM construction_works) AS construction_work_count,
    (SELECT COUNT(*) FROM sdmc_meetings) AS sdmc_meeting_count,
    (SELECT COUNT(*) FROM school_gallery) AS gallery_item_count;
