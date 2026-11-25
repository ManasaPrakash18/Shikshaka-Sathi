-- ==============================================================================
-- KARNATAKA CCE SCHOOL ERP — CREATE / CONFIGURE PLATFORM ADMIN ACCOUNT
-- ==============================================================================
-- PURPOSE:
-- Securely provision a single Statewide Platform Administrator for the Karnataka
-- CCE Management Platform. Platform Admins have exclusive authority to onboard,
-- review, approve, or revoke school access across all Karnataka districts.
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/dvcdvpqbidobnmiofuuc/sql/new
-- 2. Customize the administrative details below (Email, Name, Phone).
-- 3. Run this script in the SQL editor.
-- 4. Sign in at http://localhost:3000/login using your customized email address.
-- ==============================================================================

-- STEP 1: CONFIGURE YOUR PLATFORM ADMIN CREDENTIALS
-- (Edit the values below to match your official administrative credentials)
DO $$
DECLARE
    -- >>> EDIT THESE VALUES <<<
    admin_id        VARCHAR(100) := 'user-platform-admin-root';
    admin_name      VARCHAR(150) := 'State Platform Administrator';
    admin_email     VARCHAR(255) := 'admin@karnataka.education.gov.in'; -- your custom email
    admin_phone     VARCHAR(20)  := '9845012345';                       -- your contact number
    admin_role      VARCHAR(30)  := 'PLATFORM_ADMIN';
    admin_designation VARCHAR(100) := 'Principal Secretary / Commissioner (IAS)';
BEGIN
    -- STEP 2: UPSERT INTO PUBLIC.USERS
    INSERT INTO public.users (
        id,
        school_id,
        role,
        name,
        phone,
        email,
        designation,
        status,
        activation_token,
        token_expiry,
        created_at,
        updated_at
    )
    VALUES (
        admin_id,
        NULL,                       -- Platform Admins are not restricted to any single school
        admin_role,
        admin_name,
        admin_phone,
        LOWER(TRIM(admin_email)),
        admin_designation,
        'ACTIVE',                   -- Active status
        NULL,
        NULL,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        designation = EXCLUDED.designation,
        status = 'ACTIVE',
        updated_at = NOW();

    RAISE NOTICE 'Platform Admin successfully configured: % (%)', admin_name, admin_email;
END $$;

-- ==============================================================================
-- STEP 3: VERIFY PLATFORM ADMIN PROVISIONING
-- ==============================================================================
SELECT 
    id, 
    role, 
    name, 
    email, 
    phone, 
    designation, 
    status, 
    updated_at
FROM public.users
WHERE role = 'PLATFORM_ADMIN';

-- ==============================================================================
-- SECURITY NOTES:
-- 1. Row Level Security (RLS) is enabled across all tables.
-- 2. Only users with role = 'PLATFORM_ADMIN' can access the /platform-admin route.
-- 3. Public registration on the login page ONLY registers schools with 'PENDING_APPROVAL'
--    status. No intruder can create an active school or elevate their privileges.
-- 4. 1-Click Demo personas remain active for current testing until requested to be removed.
-- ==============================================================================
