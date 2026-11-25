-- ====================================================================
-- VIDYALAYAOS — SUPABASE PRODUCTION ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Run this script in your Supabase SQL Editor once you have configured Supabase Auth.
-- It locks down public access and ensures strict multi-tenant school isolation:
-- 1. Unauthenticated (anon) users CANNOT read or write school records.
-- 2. Authenticated school staff (HMs, Teachers) can ONLY read/write their own school's data.
-- 3. Platform Admins (State Education Dept) have statewide read/write access.
-- ====================================================================

-- 1. Helper function: Get current user's school_id from JWT metadata or public.users
CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS VARCHAR(100) AS $$
DECLARE
    _meta_school VARCHAR(100);
    _db_school VARCHAR(100);
BEGIN
    -- Check JWT metadata first (fastest)
    _meta_school := auth.jwt() -> 'user_metadata' ->> 'school_id';
    IF _meta_school IS NOT NULL AND _meta_school != '' THEN
        RETURN _meta_school;
    END IF;

    -- Fallback to database query on public.users
    SELECT school_id INTO _db_school
    FROM public.users
    WHERE id = auth.uid()::text
    LIMIT 1;

    RETURN _db_school;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Helper function: Check if current user is PLATFORM_ADMIN
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
DECLARE
    _meta_role VARCHAR(50);
    _db_role VARCHAR(50);
BEGIN
    _meta_role := auth.jwt() -> 'user_metadata' ->> 'role';
    IF _meta_role = 'PLATFORM_ADMIN' THEN
        RETURN TRUE;
    END IF;

    SELECT role INTO _db_role
    FROM public.users
    WHERE id = auth.uid()::text
    LIMIT 1;

    RETURN (_db_role = 'PLATFORM_ADMIN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Enable RLS on all 17 tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_access_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_curricular_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE former_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdmc_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_gallery ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DO $$
DECLARE
    tbl text;
    pol record;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        FOR pol IN
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
        END LOOP;
    END LOOP;
END $$;

-- ====================================================================
-- 5. DEFINE TENANT-ISOLATED POLICIES FOR AUTHENTICATED USERS
-- ====================================================================

-- 5.1 SCHOOLS TABLE
-- Staff can view all active schools (needed for school directory / transfers)
CREATE POLICY "Authenticated users can read schools"
    ON schools FOR SELECT
    TO authenticated
    USING (true);

-- Only Platform Admins or HM of that school can update school metadata
CREATE POLICY "School admins can update own school"
    ON schools FOR UPDATE
    TO authenticated
    USING (id = public.current_user_school_id() OR public.is_platform_admin())
    WITH CHECK (id = public.current_user_school_id() OR public.is_platform_admin());

CREATE POLICY "Platform admins can insert schools"
    ON schools FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_admin());

-- 5.2 USERS TABLE
CREATE POLICY "Users can read members of own school or all if admin"
    ON users FOR SELECT
    TO authenticated
    USING (school_id = public.current_user_school_id() OR public.is_platform_admin() OR id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid()::text OR public.is_platform_admin())
    WITH CHECK (id = auth.uid()::text OR public.is_platform_admin());

CREATE POLICY "Admins or self can insert user records"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid()::text OR school_id = public.current_user_school_id() OR public.is_platform_admin());

-- 5.3 MACRO FOR SCHOOL-SCOPED TABLES:
-- (students, faculty_assignments, student_promotions, assessment_records, co_curricular_grades,
--  student_audit_logs, former_students, academic_calendar_events, school_achievements,
--  transfer_certificates, study_certificates, construction_works, sdmc_meetings, school_gallery)

DO $$
DECLARE
    tbl text;
    scoped_tables text[] := ARRAY[
        'students',
        'faculty_assignments',
        'student_promotions',
        'assessment_records',
        'co_curricular_grades',
        'student_audit_logs',
        'former_students',
        'academic_calendar_events',
        'school_achievements',
        'transfer_certificates',
        'study_certificates',
        'construction_works',
        'sdmc_meetings',
        'school_gallery',
        'school_access_history'
    ];
BEGIN
    FOREACH tbl IN ARRAY scoped_tables
    LOOP
        -- SELECT policy
        EXECUTE format('
            CREATE POLICY "School staff can select %I"
            ON %I FOR SELECT
            TO authenticated
            USING (school_id = public.current_user_school_id() OR public.is_platform_admin());
        ', tbl, tbl);

        -- INSERT policy
        EXECUTE format('
            CREATE POLICY "School staff can insert %I"
            ON %I FOR INSERT
            TO authenticated
            WITH CHECK (school_id = public.current_user_school_id() OR public.is_platform_admin());
        ', tbl, tbl);

        -- UPDATE policy
        EXECUTE format('
            CREATE POLICY "School staff can update %I"
            ON %I FOR UPDATE
            TO authenticated
            USING (school_id = public.current_user_school_id() OR public.is_platform_admin())
            WITH CHECK (school_id = public.current_user_school_id() OR public.is_platform_admin());
        ', tbl, tbl);

        -- DELETE policy
        EXECUTE format('
            CREATE POLICY "School staff can delete %I"
            ON %I FOR DELETE
            TO authenticated
            USING (school_id = public.current_user_school_id() OR public.is_platform_admin());
        ', tbl, tbl);
    END LOOP;
END $$;
