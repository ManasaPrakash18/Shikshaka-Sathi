-- ==============================================================================
-- KARNATAKA CCE SCHOOL ERP — CREATE / CONFIGURE PLATFORM ADMIN (H PRAKASH)
-- ==============================================================================
-- PURPOSE:
-- 1. Create or reset the Master Admin user in Supabase GoTrue Auth (auth.users)
--    with email: admin@karnataka.gov.in and a secure password of your choice.
-- 2. Upsert the public.users record for H Prakash (role: PLATFORM_ADMIN).
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/dvcdvpqbidobnmiofuuc/sql/new
-- 2. Change 'YourNewPassword123!' below to your desired password.
-- 3. Click Run.
-- ==============================================================================

DO $$
DECLARE
    new_admin_id    UUID := 'a0000000-0000-0000-0000-000000000001';
    admin_email     TEXT := 'admin@karnataka.gov.in';
    admin_password  TEXT := 'Admin@Karnataka2026'; -- <<< CHANGE YOUR PASSWORD HERE
    admin_name      TEXT := 'H Prakash';
    admin_name_kn   TEXT := 'ಎಚ್. ಪ್ರಕಾಶ್';
    admin_phone     TEXT := '9900011122';
    admin_role      TEXT := 'PLATFORM_ADMIN';
    admin_desig     TEXT := 'State Platform Director / ರಾಜ್ಯ ನಿರ್ದೇಶಕರು';
    encrypted_pw    TEXT;
BEGIN
    -- Generate encrypted password using pgcrypto extension
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    encrypted_pw := crypt(admin_password, gen_salt('bf'));

    -- 1. Create or update in auth.users (Supabase GoTrue Auth)
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        UPDATE auth.users
        SET 
            encrypted_password = encrypted_pw,
            raw_user_meta_data = jsonb_build_object(
                'name', admin_name,
                'name_kannada', admin_name_kn,
                'role', admin_role,
                'designation', admin_desig,
                'phone', admin_phone
            ),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE email = admin_email;
        RAISE NOTICE 'Updated existing auth.users record and password for: %', admin_email;
    ELSE
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_admin_id,
            'authenticated',
            'authenticated',
            admin_email,
            encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object(
                'name', admin_name,
                'name_kannada', admin_name_kn,
                'role', admin_role,
                'designation', admin_desig,
                'phone', admin_phone
            ),
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created new auth.users record with password for: %', admin_email;
    END IF;

    -- 2. Upsert into public.users
    INSERT INTO public.users (
        id,
        school_id,
        role,
        name,
        name_kannada,
        phone,
        email,
        designation,
        status,
        created_at,
        updated_at
    )
    VALUES (
        'user-platform-admin',
        NULL,
        admin_role,
        admin_name,
        admin_name_kn,
        admin_phone,
        admin_email,
        admin_desig,
        'ACTIVE',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_kannada = EXCLUDED.name_kannada,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        designation = EXCLUDED.designation,
        status = 'ACTIVE',
        updated_at = NOW();

    RAISE NOTICE 'Platform Admin (H Prakash) configured in public.users!';
END $$;

-- Verify
SELECT id, role, name, email, designation, status FROM public.users WHERE role = 'PLATFORM_ADMIN';
