-- Elevate seeded user to admin role
UPDATE public.users 
SET role = 'ADMIN'::user_role 
WHERE email = 'admin@dkffj.org';
