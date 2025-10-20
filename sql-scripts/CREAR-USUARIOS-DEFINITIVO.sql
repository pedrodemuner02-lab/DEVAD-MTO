-- ============================================================
-- SOLUCIÓN DEFINITIVA: Crear tabla user_profiles y usuarios
-- ============================================================
-- Este script crea la tabla que Supabase necesita y luego 
-- crea los usuarios de autenticación
-- ============================================================

-- PASO 1: Crear la tabla user_profiles en el esquema public
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS en la tabla
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- PASO 2: Crear función trigger para auto-crear perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'operator'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta al crear un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Ahora SÍ crear los usuarios (el trigger creará los perfiles automáticamente)

-- Usuario 1: Juan Carlos Pérez
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
    'jperez@plantmaster.com',
    crypt('operador123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Juan Carlos Pérez"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  );

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
    format('{"sub": "%s", "email": "%s"}', user_id, 'jperez@plantmaster.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- Usuario 2: María Elena Rodríguez
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
    'mrodriguez@plantmaster.com',
    crypt('operador123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "María Elena Rodríguez"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  );

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
    format('{"sub": "%s", "email": "%s"}', user_id, 'mrodriguez@plantmaster.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- Usuario 3: Roberto Sánchez
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
    'rsanchez@plantmaster.com',
    crypt('supervisor123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Roberto Sánchez"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  );

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
    format('{"sub": "%s", "email": "%s"}', user_id, 'rsanchez@plantmaster.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- PASO 4: Verificar que todo se creó correctamente
SELECT 
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'full_name' as nombre,
  u.created_at,
  p.role as rol_perfil
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE u.email IN ('jperez@plantmaster.com', 'mrodriguez@plantmaster.com', 'rsanchez@plantmaster.com')
ORDER BY u.created_at DESC;

-- ============================================================
-- CREDENCIALES DE ACCESO
-- ============================================================
-- jperez@plantmaster.com / operador123
-- mrodriguez@plantmaster.com / operador123
-- rsanchez@plantmaster.com / supervisor123
-- ============================================================
