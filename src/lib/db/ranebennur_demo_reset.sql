-- Destructive demo reset: keeps the existing public.users row for user-platform-admin,
-- then replaces application data with the bilingual Ranebennur demo dataset.
-- auth.users is intentionally untouched. Close the app and clear its browser storage
-- after running this script so stale IndexedDB data cannot be uploaded again.
-- Requires schema.sql and bilingual_school_content_migration.sql to have been applied.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-platform-admin' AND role = 'PLATFORM_ADMIN') THEN
        RAISE EXCEPTION 'Expected user-platform-admin was not found; refusing to delete application data.';
    END IF;
END
$$;

DELETE FROM school_access_history;
DELETE FROM student_audit_logs;
DELETE FROM student_promotions;
DELETE FROM assessment_records;
DELETE FROM co_curricular_grades;
DELETE FROM faculty_assignments;
DELETE FROM former_students;
DELETE FROM transfer_certificates;
DELETE FROM study_certificates;
DELETE FROM academic_calendar_events;
DELETE FROM school_achievements;
DELETE FROM construction_works;
DELETE FROM sdmc_meetings;
DELETE FROM school_gallery;
DELETE FROM students;
DELETE FROM users
WHERE id <> 'user-platform-admin';
DELETE FROM schools;

INSERT INTO schools (
    id, udise, name, name_kannada, hm_name, hm_name_kannada, hm_phone, email,
    taluk, taluk_kannada, district, district_kannada, state, description,
    description_kannada, status, current_academic_year, registration_date, created_at, updated_at
) VALUES (
    'school-demo-ranebennur', '99999999999',
    'Government School, Ranebennur (DEMO)', 'ಸರ್ಕಾರಿ ಶಾಲೆ, ರಾಣೆಬೆನ್ನೂರು (ಡೆಮೊ)',
    'Demo Headmaster', 'ಡೆಮೊ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು', '0000000001', 'school@ranebennur-demo.invalid',
    'Ranebennur', 'ರಾಣೆಬೆನ್ನೂರು', 'Haveri', 'ಹಾವೇರಿ', 'Karnataka',
    'Demo school for testing bilingual records, CCE marks, annual reports, and school information.',
    'ದ್ವಿಭಾಷಾ ದಾಖಲೆಗಳು, ಸಿಸಿಇ ಅಂಕಗಳು, ವಾರ್ಷಿಕ ವರದಿಗಳು ಮತ್ತು ಶಾಲಾ ಮಾಹಿತಿಯನ್ನು ಪರೀಕ್ಷಿಸಲು ಡೆಮೊ ಶಾಲೆ.',
    'ACTIVE', '2026-27', NOW(), NOW(), NOW()
);

INSERT INTO users (
    id, school_id, role, name, name_kannada, phone, email, designation,
    designation_kannada, status, created_at, updated_at
)
SELECT
    'user-demo-hm-ranebennur', 'school-demo-ranebennur', 'SCHOOL_ADMIN',
    'Demo Headmaster', 'ಡೆಮೊ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು', '0000000001',
    'headmaster@ranebennur-demo.invalid', 'Headmaster', 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
    'ACTIVE', NOW(), NOW()
UNION ALL
SELECT
    'user-demo-faculty-' || lpad(n::text, 2, '0'), 'school-demo-ranebennur',
    'FACULTY', 'Demo Teacher ' || lpad(n::text, 2, '0'),
    'ಡೆಮೊ ಶಿಕ್ಷಕರು ' || lpad(n::text, 2, '0'),
    '000000000' || (n + 1)::text,
    'teacher' || lpad(n::text, 2, '0') || '@ranebennur-demo.invalid',
    'Teacher', 'ಶಿಕ್ಷಕರು', 'ACTIVE', NOW(), NOW()
FROM generate_series(1, 5) AS n;

INSERT INTO faculty_assignments (
    id, faculty_id, school_id, academic_year, class_number, section, subject_name, is_class_teacher
)
SELECT
    'demo-assignment-' || left(y.academic_year, 4) || '-' || c.class_number || '-' || s.subject_number,
    'user-demo-faculty-' || lpad(least(s.subject_number, 5)::text, 2, '0'),
    'school-demo-ranebennur', y.academic_year, c.class_number, 'A', s.subject_name,
    s.subject_number = 1
FROM (VALUES ('2024-25'), ('2025-26'), ('2026-27')) AS y(academic_year)
CROSS JOIN LATERAL generate_series(
    CASE y.academic_year WHEN '2024-25' THEN 7 WHEN '2025-26' THEN 8 ELSE 9 END,
    CASE y.academic_year WHEN '2024-25' THEN 8 WHEN '2025-26' THEN 9 ELSE 10 END
) AS c(class_number)
CROSS JOIN (VALUES
    (1, 'First Language (Kannada)'),
    (2, 'Second Language (English)'),
    (3, 'Third Language (Hindi)'),
    (4, 'Mathematics'),
    (5, 'Science'),
    (6, 'Social Science')
) AS s(subject_number, subject_name);

CREATE TEMP TABLE demo_students_seed ON COMMIT DROP AS
SELECT
    'demo-student-' || left(y.academic_year, 4) || '-' || lpad(n::text, 2, '0') AS id,
    'school-demo-ranebennur'::varchar AS school_id,
    y.academic_year,
    'DEMO-' || left(y.academic_year, 4) || '-' || lpad(n::text, 3, '0') AS admission_no,
    'DEMO-SATS-' || left(y.academic_year, 4) || '-' || lpad(n::text, 3, '0') AS sats_no,
    'DEMO-PEN-' || left(y.academic_year, 4) || '-' || lpad(n::text, 3, '0') AS pen_no,
    'Demo Student ' || lpad(n::text, 2, '0') AS name,
    'ಡೆಮೊ ವಿದ್ಯಾರ್ಥಿ ' || lpad(n::text, 2, '0') AS name_kannada,
    CASE WHEN n % 2 = 0 THEN 'GIRL' ELSE 'BOY' END AS gender,
    make_date(2010, ((n - 1) % 12) + 1, 15) AS dob,
    CASE
        WHEN y.year_index = 0 THEN CASE WHEN n <= 12 THEN 7 ELSE 8 END
        WHEN y.year_index = 1 THEN CASE WHEN n <= 12 THEN 8 ELSE 9 END
        ELSE CASE WHEN n <= 12 THEN 9 ELSE 10 END
    END AS class_number,
    n AS student_number
FROM (VALUES ('2024-25', 0), ('2025-26', 1), ('2026-27', 2)) AS y(academic_year, year_index)
CROSS JOIN generate_series(1, 25) AS n;

INSERT INTO students (
    id, school_id, academic_year, admission_no, sats_no, pen_no, aadhaar_no,
    name, name_kannada, gender, dob, religion, category, caste, caste_kannada, father_name,
    father_name_kannada, mother_name, mother_name_kannada, cwsn, mobile,
    class_number, section, place_of_birth, place_of_birth_kannada, taluk, taluk_kannada,
    district, district_kannada, state, nationality,
    medium_of_instruction, admission_date, status, created_at, updated_at
)
SELECT
    id, school_id, academic_year, admission_no, sats_no, pen_no, NULL,
    name, name_kannada, gender, dob, 'Not specified (demo)', 'GM', 'Demo', 'ಡೆಮೊ',
    'Demo Parent ' || lpad(student_number::text, 2, '0'),
    'ಡೆಮೊ ಪೋಷಕರು ' || lpad(student_number::text, 2, '0'),
    'Demo Parent ' || lpad(student_number::text, 2, '0') || ' B',
    'ಡೆಮೊ ಪೋಷಕರು ' || lpad(student_number::text, 2, '0') || ' ಬಿ',
    FALSE, NULL, class_number, 'A', 'Ranebennur (demo)', 'ರಾಣೆಬೆನ್ನೂರು (ಡೆಮೊ)',
    'Ranebennur', 'ರಾಣೆಬೆನ್ನೂರು', 'Haveri', 'ಹಾವೇರಿ',
    'Karnataka', 'Indian', 'Kannada and English',
    make_date(left(academic_year, 4)::integer, 6, 10), 'ACTIVE', NOW(), NOW()
FROM demo_students_seed;

INSERT INTO assessment_records (
    id, school_id, academic_year, student_id, class_number, section, subject_name,
    assessment_type, total_marks, max_marks, grade, attendance_count, updated_by, updated_at
)
SELECT
    'demo-mark-' || left(st.academic_year, 4) || '-' || lpad(st.student_number::text, 2, '0')
        || '-' || s.subject_number || '-' || a.assessment_type,
    st.school_id, st.academic_year, st.id, st.class_number, 'A', s.subject_name,
    a.assessment_type,
    CASE
        WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
        WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
        WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
        WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
        ELSE 20 + x.mark_offset * 2
    END AS total_marks,
    CASE
        WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
        WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
        WHEN st.class_number >= 9 THEN 80
        WHEN a.assessment_type LIKE 'FA%' THEN 10
        ELSE 30
    END AS max_marks,
    CASE
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.90 THEN 'A+'
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.80 THEN 'A'
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.70 THEN 'B+'
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.60 THEN 'B'
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.50 THEN 'C+'
        WHEN st.class_number = 10 AND
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.35 THEN 'C'
        WHEN st.class_number = 10 THEN 'NC'
        WHEN
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.90 THEN 'A+'
        WHEN
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.70 THEN 'A'
        WHEN
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.50 THEN 'B+'
        WHEN
            ((CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 35 + x.mark_offset * 3
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 76 + x.mark_offset * 4
                WHEN st.class_number >= 9 THEN 60 + x.mark_offset * 4
                WHEN a.assessment_type LIKE 'FA%' THEN 6 + (x.mark_offset % 4)
                ELSE 20 + x.mark_offset * 2
            END)::numeric /
            (CASE
                WHEN st.class_number >= 9 AND a.assessment_type LIKE 'FA%' THEN 50
                WHEN st.class_number >= 9 AND s.subject_number = 1 THEN 100
                WHEN st.class_number >= 9 THEN 80
                WHEN a.assessment_type LIKE 'FA%' THEN 10
                ELSE 30
            END)) >= 0.30 THEN 'B'
        ELSE 'C'
    END,
    0, 'Demo Headmaster', NOW()
FROM demo_students_seed st
CROSS JOIN (VALUES
    (1, 'First Language (Kannada)'),
    (2, 'Second Language (English)'),
    (3, 'Third Language (Hindi)'),
    (4, 'Mathematics'),
    (5, 'Science'),
    (6, 'Social Science')
) AS s(subject_number, subject_name)
CROSS JOIN (VALUES
    (0, 'FA1'), (1, 'FA2'), (2, 'SA1'), (3, 'FA3'), (4, 'FA4'), (5, 'SA2')
) AS a(assessment_index, assessment_type)
CROSS JOIN LATERAL (
    SELECT (st.student_number + (s.subject_number - 1) * 2 + a.assessment_index) % 5 AS mark_offset
) AS x;

INSERT INTO co_curricular_grades (
    id, school_id, student_id, academic_year, class_number, daihika_arogya,
    moulya, kaaryanubhava, kala, updated_by, updated_at
)
SELECT
    'demo-cocurricular-' || left(st.academic_year, 4) || '-' || lpad(st.student_number::text, 2, '0'),
    st.school_id, st.id, st.academic_year, st.class_number,
    CASE (st.student_number + (CASE st.academic_year WHEN '2024-25' THEN 0 WHEN '2025-26' THEN 25 ELSE 50 END) - 1) % 3
        WHEN 0 THEN 'A+' WHEN 1 THEN 'A' ELSE 'B+' END,
    CASE (st.student_number + (CASE st.academic_year WHEN '2024-25' THEN 0 WHEN '2025-26' THEN 25 ELSE 50 END) - 1) % 3
        WHEN 0 THEN 'A+' WHEN 1 THEN 'A' ELSE 'B+' END,
    CASE (st.student_number + (CASE st.academic_year WHEN '2024-25' THEN 0 WHEN '2025-26' THEN 25 ELSE 50 END) - 1) % 3
        WHEN 0 THEN 'A+' WHEN 1 THEN 'A' ELSE 'B+' END,
    CASE (st.student_number + (CASE st.academic_year WHEN '2024-25' THEN 0 WHEN '2025-26' THEN 25 ELSE 50 END) - 1) % 3
        WHEN 0 THEN 'A+' WHEN 1 THEN 'A' ELSE 'B+' END,
    'Demo Headmaster', NOW()
FROM demo_students_seed st;

INSERT INTO academic_calendar_events (
    id, school_id, academic_year, title, title_kannada, description,
    description_kannada, date, category, is_official, created_by
)
SELECT
    'demo-calendar-' || left(y.academic_year, 4), 'school-demo-ranebennur', y.academic_year,
    'Annual School Exhibition', 'ವಾರ್ಷಿಕ ಶಾಲಾ ಪ್ರದರ್ಶನ',
    'Demo event for bilingual school calendar testing.',
    'ದ್ವಿಭಾಷಾ ಶಾಲಾ ಕ್ಯಾಲೆಂಡರ್ ಪರೀಕ್ಷೆಗಾಗಿ ಡೆಮೊ ಕಾರ್ಯಕ್ರಮ.',
    make_date(left(y.academic_year, 4)::integer, 12, 10), 'SCHOOL_EVENT', FALSE, 'user-demo-hm-ranebennur'
FROM (VALUES ('2024-25'), ('2025-26'), ('2026-27')) AS y(academic_year);

INSERT INTO school_achievements (
    id, school_id, academic_year, title, title_kannada, category, student_name,
    student_name_kannada, class_number, description, description_kannada, date
)
SELECT
    'demo-achievement-' || left(y.academic_year, 4), 'school-demo-ranebennur', y.academic_year,
    'Demo Student Science Exhibition Participation', 'ಡೆಮೊ ವಿದ್ಯಾರ್ಥಿಗಳ ವಿಜ್ಞಾನ ಪ್ರದರ್ಶನದ ಭಾಗವಹಿಸುವಿಕೆ',
    'Other', 'Demo Student ' || lpad((y.year_index + 1)::text, 2, '0'),
    'ಡೆಮೊ ವಿದ್ಯಾರ್ಥಿ ' || lpad((y.year_index + 1)::text, 2, '0'), 9,
    'Sample bilingual achievement record for demonstration only.',
    'ಪ್ರಾತ್ಯಕ್ಷಿಕೆಗಾಗಿ ಮಾತ್ರ ಮಾದರಿ ದ್ವಿಭಾಷಾ ಸಾಧನೆ ದಾಖಲೆ.',
    make_date(left(y.academic_year, 4)::integer + 1, 1, 20)
FROM (VALUES ('2024-25', 0), ('2025-26', 1), ('2026-27', 2)) AS y(academic_year, year_index);

INSERT INTO construction_works (
    id, school_id, academic_year, title, title_kannada, description,
    description_kannada, date, estimated_cost, completion_status
)
SELECT
    'demo-construction-' || left(y.academic_year, 4), 'school-demo-ranebennur', y.academic_year,
    'Demo Classroom Maintenance', 'ಡೆಮೊ ತರಗತಿ ಕೊಠಡಿ ನಿರ್ವಹಣೆ',
    'Sample maintenance entry. No real construction project or expenditure is represented.',
    'ಮಾದರಿ ನಿರ್ವಹಣೆ ದಾಖಲೆ. ನೈಜ ನಿರ್ಮಾಣ ಕಾಮಗಾರಿ ಅಥವಾ ವೆಚ್ಚವನ್ನು ಸೂಚಿಸುವುದಿಲ್ಲ.',
    make_date(left(y.academic_year, 4)::integer, 11, 15), 0, 'COMPLETED'
FROM (VALUES ('2024-25'), ('2025-26'), ('2026-27')) AS y(academic_year);

INSERT INTO sdmc_meetings (
    id, school_id, academic_year, title, title_kannada, date, agenda, agenda_kannada,
    summary, summary_kannada, decisions_taken, decisions_taken_kannada
)
SELECT
    'demo-sdmc-' || left(y.academic_year, 4), 'school-demo-ranebennur', y.academic_year,
    'Demo SDMC Annual Review', 'ಡೆಮೊ ಎಸ್‌ಡಿಎಂಸಿ ವಾರ್ಷಿಕ ಪರಿಶೀಲನಾ ಸಭೆ',
    make_date(left(y.academic_year, 4)::integer, 9, 15),
    'Review academic progress and school facilities (demo record).',
    'ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ ಮತ್ತು ಶಾಲಾ ಸೌಲಭ್ಯಗಳ ಪರಿಶೀಲನೆ (ಡೆಮೊ ದಾಖಲೆ).',
    'Sample bilingual meeting record for testing only.',
    'ಪರೀಕ್ಷೆಗಾಗಿ ಮಾತ್ರ ಮಾದರಿ ದ್ವಿಭಾಷಾ ಸಭಾ ದಾಖಲೆ.',
    'No official decision; this is a demonstration record.',
    'ಯಾವುದೇ ಅಧಿಕೃತ ನಿರ್ಧಾರವಿಲ್ಲ; ಇದು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ದಾಖಲೆ.'
FROM (VALUES ('2024-25'), ('2025-26'), ('2026-27')) AS y(academic_year);

INSERT INTO school_gallery (
    id, school_id, academic_year, title, title_kannada, description,
    description_kannada, date, photo_url
)
SELECT
    'demo-gallery-' || left(y.academic_year, 4), 'school-demo-ranebennur', y.academic_year,
    'Demo School Activity', 'ಡೆಮೊ ಶಾಲಾ ಚಟುವಟಿಕೆ',
    'Placeholder entry for gallery layout testing; no photograph is attached.',
    'ಗ್ಯಾಲರಿ ವಿನ್ಯಾಸ ಪರೀಕ್ಷೆಗಾಗಿ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್ ದಾಖಲೆ; ಯಾವುದೇ ಛಾಯಾಚಿತ್ರವನ್ನು ಸೇರಿಸಿಲ್ಲ.',
    make_date(left(y.academic_year, 4)::integer, 10, 10), NULL
FROM (VALUES ('2024-25'), ('2025-26'), ('2026-27')) AS y(academic_year);

COMMIT;

-- Expected post-run demo counts (platform-admin row is not counted here):
-- schools=1, school users=6, students=75, assessment_records=2700,
-- co_curricular_grades=75, faculty_assignments=36, and 3 rows in each
-- academic calendar / achievement / construction / SDMC / gallery table.
