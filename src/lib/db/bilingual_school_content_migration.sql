-- Add bilingual fields without dropping or rewriting existing school data.
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS name_kannada VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hm_name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS taluk_kannada VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district_kannada VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description_kannada TEXT;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS designation_kannada VARCHAR(100);

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS father_name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS mother_name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS caste_kannada VARCHAR(100),
    ADD COLUMN IF NOT EXISTS place_of_birth_kannada VARCHAR(100),
    ADD COLUMN IF NOT EXISTS taluk_kannada VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district_kannada VARCHAR(100);

ALTER TABLE academic_calendar_events
    ADD COLUMN IF NOT EXISTS title_kannada VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description_kannada TEXT;

ALTER TABLE school_achievements
    ADD COLUMN IF NOT EXISTS title_kannada VARCHAR(200),
    ADD COLUMN IF NOT EXISTS student_name_kannada VARCHAR(150),
    ADD COLUMN IF NOT EXISTS description_kannada TEXT;

ALTER TABLE construction_works
    ADD COLUMN IF NOT EXISTS title_kannada VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description_kannada TEXT;

ALTER TABLE sdmc_meetings
    ADD COLUMN IF NOT EXISTS title_kannada VARCHAR(200),
    ADD COLUMN IF NOT EXISTS agenda_kannada TEXT,
    ADD COLUMN IF NOT EXISTS summary_kannada TEXT,
    ADD COLUMN IF NOT EXISTS decisions_taken_kannada TEXT;

ALTER TABLE school_gallery
    ADD COLUMN IF NOT EXISTS title_kannada VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description_kannada TEXT;
