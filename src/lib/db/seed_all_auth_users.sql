-- ==============================================================================
-- KARNATAKA CCE SCHOOL ERP — SEED ALL AUTH USERS (HM, TEACHERS, PLATFORM ADMIN)
-- ==============================================================================
-- PURPOSE:
-- Provision all standard roles in Supabase Auth (auth.users) and public.users
-- so everyone can log in with a clean, standard password.
--
-- DEFAULT PASSWORDS SET HERE:
-- 1. Master Platform Admin (H Prakash): 'Admin@Karnataka2026'
-- 2. School Admins / Headmasters:       'School@Karnataka2026'
-- 3. Faculty / Teachers:               'Teacher@Karnataka2026'
--
-- RUN IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/dvcdvpqbidobnmiofuuc/sql/new
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    rec RECORD;
    v_enc_pw TEXT;
    v_user_id UUID;
BEGIN
    -- Define temporary table of all system users
    CREATE TEMP TABLE IF NOT EXISTS temp_seed_users (
        id VARCHAR(100),
        auth_uuid UUID,
        school_id VARCHAR(100),
        role VARCHAR(30),
        name VARCHAR(150),
        name_kannada VARCHAR(150),
        phone VARCHAR(20),
        email VARCHAR(255),
        designation VARCHAR(100),
        plain_password TEXT
    ) ON COMMIT DROP;

    DELETE FROM temp_seed_users;

    INSERT INTO temp_seed_users VALUES
    -- 1. Master Admin
    ('user-platform-admin', 'a0000000-0000-0000-0000-000000000001', NULL, 'PLATFORM_ADMIN', 'H Prakash', 'ಎಚ್. ಪ್ರಕಾಶ್', '9900011122', 'admin@karnataka.gov.in', 'State Platform Director', 'Admin@Karnataka2026'),

    -- 2. Headmaster - Vidyaranyapuram, Mysuru
    ('user-hm-mysuru', 'a0000000-0000-0000-0000-000000000002', 'school-1', 'SCHOOL_ADMIN', 'Ramesh Gowda', 'ರಮೇಶ್ ಗೌಡ', '9845123456', 'ramesh.gowda@ghs-mysuru.in', 'Headmaster', 'School@Karnataka2026'),

    -- 3. Teachers - Mysuru
    ('user-faculty-1', 'a0000000-0000-0000-0000-000000000003', 'school-1', 'FACULTY', 'Smt. Anasuya M', 'ಶ್ರೀಮತಿ ಅನಸೂಯ ಎಂ', '9845223344', 'anasuya.m@ghs-mysuru.in', 'Senior Teacher', 'Teacher@Karnataka2026'),
    ('user-faculty-2', 'a0000000-0000-0000-0000-000000000004', 'school-1', 'FACULTY', 'Sri Shivakumar B', 'ಶ್ರೀ ಶಿವಕುಮಾರ್ ಬಿ', '9845334455', 'shivakumar.b@ghs-mysuru.in', 'Teacher', 'Teacher@Karnataka2026'),

    -- 4. Headmaster - Hassan Model School
    ('user-hm-hassan', 'a0000000-0000-0000-0000-000000000005', 'school-2', 'SCHOOL_ADMIN', 'Savitha K', 'ಸವಿತಾ ಕೆ', '9845789123', 'savitha.k@gmhps-hassan.in', 'Headmaster', 'School@Karnataka2026'),

    -- 5. Teacher - Hassan Model School
    ('user-faculty-hassan', 'a0000000-0000-0000-0000-000000000006', 'school-2', 'FACULTY', 'Sri Manjunath H', 'ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಚ್', '9845889900', 'manjunath.h@gmhps-hassan.in', 'Teacher', 'Teacher@Karnataka2026');

    FOR rec IN SELECT * FROM temp_seed_users LOOP
        v_enc_pw := crypt(rec.plain_password, gen_salt('bf'));
        
        -- Check if exists in auth.users
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
            UPDATE auth.users
            SET 
                encrypted_password = v_enc_pw,
                raw_user_meta_data = jsonb_build_object(
                    'name', rec.name,
                    'name_kannada', rec.name_kannada,
                    'role', rec.role,
                    'school_id', rec.school_id,
                    'phone', rec.phone,
                    'designation', rec.designation
                ),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                updated_at = NOW()
            WHERE email = rec.email;
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
                rec.auth_uuid,
                'authenticated',
                'authenticated',
                rec.email,
                v_enc_pw,
                NOW(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object(
                    'name', rec.name,
                    'name_kannada', rec.name_kannada,
                    'role', rec.role,
                    'school_id', rec.school_id,
                    'phone', rec.phone,
                    'designation', rec.designation
                ),
                NOW(),
                NOW()
            );
        END IF;

        -- Upsert into public.users
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
            rec.id,
            rec.school_id,
            rec.role,
            rec.name,
            rec.name_kannada,
            rec.phone,
            rec.email,
            rec.designation,
            'ACTIVE',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            name_kannada = EXCLUDED.name_kannada,
            school_id = EXCLUDED.school_id,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            designation = EXCLUDED.designation,
            status = 'ACTIVE',
            updated_at = NOW();

    END LOOP;

    RAISE NOTICE 'All system users successfully seeded in Supabase Auth & public.users!';
END $$;

-- Verify
SELECT id, school_id, role, name, email, designation, status FROM public.users;
