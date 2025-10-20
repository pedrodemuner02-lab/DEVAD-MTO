-- ============================================================
-- CREAR USUARIOS ADMINISTRADORES ADICIONALES
-- ============================================================
-- Estos usuarios corresponden a los emails que usamos en el código
-- ============================================================

-- Usuario Administrador Principal
DO $$
DECLARE
  user_id uuid := gen_random_uuid();
BEGIN
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
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'admin@devad-mto.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador Sistema"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    user_id::text,
    format('{"sub": "%s", "email": "%s"}', user_id, 'admin@devad-mto.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
END $$;

-- Usuario Jefe/Supervisor
DO $$
DECLARE
  user_id uuid := gen_random_uuid();
BEGIN
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
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'jefe@devad-mto.com',
    crypt('jefe123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Jefe de Mantenimiento"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    user_id::text,
    format('{"sub": "%s", "email": "%s"}', user_id, 'jefe@devad-mto.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
END $$;

-- Verificar usuarios creados
SELECT 
  email,
  email_confirmed_at,
  raw_user_meta_data->>'full_name' as nombre,
  created_at
FROM auth.users
WHERE email IN ('admin@devad-mto.com', 'jefe@devad-mto.com', 'jperez@plantmaster.com', 'mrodriguez@plantmaster.com', 'rsanchez@plantmaster.com')
ORDER BY created_at DESC;

-- ============================================================
-- CREDENCIALES FINALES:
-- ============================================================
-- admin@devad-mto.com / admin123 (Administrador)
-- jefe@devad-mto.com / jefe123 (Supervisor)
-- jperez@plantmaster.com / operador123 (Técnico)
-- mrodriguez@plantmaster.com / operador123 (Técnico)
-- rsanchez@plantmaster.com / supervisor123 (Supervisor)
-- ============================================================
