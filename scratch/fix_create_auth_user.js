const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const sql = `
    CREATE OR REPLACE FUNCTION public.create_auth_user(
        p_email text,
        p_password text,
        p_full_name text
    )
    RETURNS uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
        DECLARE
          v_user_id UUID;
          v_identity_id UUID;
        BEGIN
          -- 1. Check if user already exists
          SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
          IF FOUND THEN
            -- If user already exists but is not confirmed, confirm them and update password
            UPDATE auth.users 
            SET email_confirmed_at = NOW(), 
                encrypted_password = crypt(p_password, gen_salt('bf', 10)),
                updated_at = NOW()
            WHERE id = v_user_id;
            
            RETURN v_user_id;
          END IF;

          v_user_id := gen_random_uuid();
          v_identity_id := gen_random_uuid();

          -- 2. Insert into auth.users (omitted confirmed_at generated column)
          INSERT INTO auth.users (
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            is_sso_user,
            is_anonymous
          ) VALUES (
            v_user_id,
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf', 10)),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            json_build_object('sub', v_user_id::text, 'email', p_email, 'full_name', p_full_name, 'email_verified', true, 'phone_verified', false)::jsonb,
            FALSE,
            NOW(),
            NOW(),
            FALSE,
            FALSE
          );

          -- 3. Insert into auth.identities (omitted generated "email" column)
          INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            created_at,
            updated_at
          ) VALUES (
            v_identity_id,
            v_user_id,
            json_build_object('sub', v_user_id::text, 'email', p_email, 'full_name', p_full_name, 'email_verified', true, 'phone_verified', false)::jsonb,
            'email',
            v_user_id::text,
            NOW(),
            NOW()
          );

          RETURN v_user_id;
        END;
    $$;
  `;

  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("SUCCESS: create_auth_user function updated in the database!");
  } catch (error) {
    console.error("ERROR updating function:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
