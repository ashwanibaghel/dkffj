const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sqlCommands = [
    // --- 1. PHOTOS BUCKET POLICIES ---
    `DROP POLICY IF EXISTS "Allow public select on photos" ON storage.objects;`,
    `CREATE POLICY "Allow public select on photos" 
     ON storage.objects FOR SELECT 
     USING (bucket_id = 'photos');`,

    `DROP POLICY IF EXISTS "Allow user insert on own photos folder" ON storage.objects;`,
    `CREATE POLICY "Allow user insert on own photos folder" 
     ON storage.objects FOR INSERT 
     WITH CHECK (
       bucket_id = 'photos' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user update on own photos folder" ON storage.objects;`,
    `CREATE POLICY "Allow user update on own photos folder" 
     ON storage.objects FOR UPDATE 
     USING (
       bucket_id = 'photos' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user delete on own photos folder" ON storage.objects;`,
    `CREATE POLICY "Allow user delete on own photos folder" 
     ON storage.objects FOR DELETE 
     USING (
       bucket_id = 'photos' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    // --- 2. AADHAAR BUCKET POLICIES ---
    `DROP POLICY IF EXISTS "Allow user insert on own aadhaar folder" ON storage.objects;`,
    `CREATE POLICY "Allow user insert on own aadhaar folder" 
     ON storage.objects FOR INSERT 
     WITH CHECK (
       bucket_id = 'aadhaar' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user select on own aadhaar folder" ON storage.objects;`,
    `CREATE POLICY "Allow user select on own aadhaar folder" 
     ON storage.objects FOR SELECT 
     USING (
       bucket_id = 'aadhaar' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow admin select on all aadhaar" ON storage.objects;`,
    `CREATE POLICY "Allow admin select on all aadhaar" 
     ON storage.objects FOR SELECT 
     USING (
       bucket_id = 'aadhaar' AND 
       EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN'))
     );`,

    `DROP POLICY IF EXISTS "Allow user update on own aadhaar folder" ON storage.objects;`,
    `CREATE POLICY "Allow user update on own aadhaar folder" 
     ON storage.objects FOR UPDATE 
     USING (
       bucket_id = 'aadhaar' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user delete on own aadhaar folder" ON storage.objects;`,
    `CREATE POLICY "Allow user delete on own aadhaar folder" 
     ON storage.objects FOR DELETE 
     USING (
       bucket_id = 'aadhaar' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    // --- 3. SIGNATURES BUCKET POLICIES ---
    `DROP POLICY IF EXISTS "Allow user insert on own signatures folder" ON storage.objects;`,
    `CREATE POLICY "Allow user insert on own signatures folder" 
     ON storage.objects FOR INSERT 
     WITH CHECK (
       bucket_id = 'signatures' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user select on own signatures folder" ON storage.objects;`,
    `CREATE POLICY "Allow user select on own signatures folder" 
     ON storage.objects FOR SELECT 
     USING (
       bucket_id = 'signatures' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow admin select on all signatures" ON storage.objects;`,
    `CREATE POLICY "Allow admin select on all signatures" 
     ON storage.objects FOR SELECT 
     USING (
       bucket_id = 'signatures' AND 
       EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN'))
     );`,

    `DROP POLICY IF EXISTS "Allow user update on own signatures folder" ON storage.objects;`,
    `CREATE POLICY "Allow user update on own signatures folder" 
     ON storage.objects FOR UPDATE 
     USING (
       bucket_id = 'signatures' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    `DROP POLICY IF EXISTS "Allow user delete on own signatures folder" ON storage.objects;`,
    `CREATE POLICY "Allow user delete on own signatures folder" 
     ON storage.objects FOR DELETE 
     USING (
       bucket_id = 'signatures' AND 
       (
         auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.users WHERE id::text = (storage.foldername(name))[1])
       )
     );`,

    // --- 4. COMPLAINTS BUCKET POLICIES ---
    `DROP POLICY IF EXISTS "Allow insert on complaints attachments folder" ON storage.objects;`,
    `CREATE POLICY "Allow insert on complaints attachments folder" 
     ON storage.objects FOR INSERT 
     WITH CHECK (
       bucket_id = 'complaints' AND 
       EXISTS (SELECT 1 FROM public.complaints WHERE id::text = (storage.foldername(name))[1])
     );`,

    `DROP POLICY IF EXISTS "Allow select on own complaints attachments folder" ON storage.objects;`,
    `CREATE POLICY "Allow select on own complaints attachments folder" 
     ON storage.objects FOR SELECT 
     USING (
       bucket_id = 'complaints' AND 
       (
         EXISTS (SELECT 1 FROM public.complaints WHERE id::text = (storage.foldername(name))[1] AND user_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN'))
       )
     );`,

    `DROP POLICY IF EXISTS "Allow update/delete on complaints attachments folder" ON storage.objects;`,
    `CREATE POLICY "Allow update/delete on complaints attachments folder" 
     ON storage.objects FOR UPDATE 
     USING (
       bucket_id = 'complaints' AND 
       (
         EXISTS (SELECT 1 FROM public.complaints WHERE id::text = (storage.foldername(name))[1] AND user_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN'))
       )
     );`,

    `DROP POLICY IF EXISTS "Allow delete on complaints attachments folder" ON storage.objects;`,
    `CREATE POLICY "Allow delete on complaints attachments folder" 
     ON storage.objects FOR DELETE 
     USING (
       bucket_id = 'complaints' AND 
       (
         EXISTS (SELECT 1 FROM public.complaints WHERE id::text = (storage.foldername(name))[1] AND user_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN'))
       )
     );`
  ];

  console.log("Applying storage policies...");

  for (const query of sqlCommands) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (err) {
      console.error(`Failed executing statement: \n${query}\nError:`, err.message);
    }
  }

  console.log("Finished applying storage policies.");
  await prisma.$disconnect();
}

main();
