const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Query triggers on auth.users or public.users
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name, 
        event_object_table, 
        action_statement
      FROM information_schema.triggers;
    `;
    console.log("TRIGGERS:\n", JSON.stringify(triggers, null, 2));

    // Also search for trigger function definitions containing public.users
    const triggerFunctions = await prisma.$queryRaw`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND pg_get_functiondef(p.oid) LIKE '%users%';
    `;
    console.log("\nTRIGGER FUNCTIONS:\n");
    triggerFunctions.forEach(tf => {
      console.log(`--- ${tf.function_name} ---`);
      console.log(tf.definition);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
