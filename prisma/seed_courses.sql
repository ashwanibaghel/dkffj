-- Seed Sample Courses
INSERT INTO public.courses (title, description, duration, fees, eligibility, image_url, is_active)
VALUES
  (
    'Human Rights Law & Advocacy',
    'A comprehensive course covering Constitutional rights, international frameworks, and litigation procedures for protecting citizen liberties in India.',
    '3 Months',
    2500.00,
    '10+2 or Equivalent',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    TRUE
  ),
  (
    'RTI (Right to Information) Activism',
    'Learn how to draft, file, and appeal RTI applications under the Right to Information Act, 2005 to ensure government transparency.',
    '1 Month',
    1200.00,
    'General Literacy',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    TRUE
  ),
  (
    'NGO Management & Social Work',
    'Professional training on NGO registration, compliance, project planning, fundraising, and grassroot advocacy strategies.',
    '6 Months',
    4500.00,
    'Graduate in any stream',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
    TRUE
  )
ON CONFLICT DO NOTHING;
