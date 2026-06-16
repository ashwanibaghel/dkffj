-- Postgres function to create authenticated users with auto-confirmed email to bypass SMTP rate limits
CREATE OR REPLACE FUNCTION public.create_auth_user(
  p_email VARCHAR(255),
  p_password TEXT,
  p_full_name VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_identity_id UUID;
BEGIN
  -- 1. Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF FOUND THEN
    -- If user already exists but is not confirmed, confirm them and update password
    -- Omit confirmed_at since it is a generated column
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

  -- 3. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    email,
    created_at,
    updated_at
  ) VALUES (
    v_identity_id,
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', p_email, 'full_name', p_full_name, 'email_verified', true, 'phone_verified', false)::jsonb,
    'email',
    v_user_id::text,
    p_email,
    NOW(),
    NOW()
  );

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
