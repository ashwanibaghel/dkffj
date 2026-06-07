// Read from env parameters
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env.");
  process.exit(1);
}

async function run() {
  const email = "admin@dkffj.org";
  const password = "AdminPassword123";

  console.log(`Creating Admin Auth account for ${email} via HTTP REST API...`);
  
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: "DKFFJ Administrator"
        }
      })
    });

    const resJson = await res.json();

    if (!res.ok) {
      if (resJson.message && resJson.message.includes("already registered")) {
        console.log("Admin user account already exists in auth.users.");
      } else {
        console.error("Auth registration error:", resJson.message || resJson);
        process.exit(1);
      }
    } else {
      console.log("Admin Auth account signed up successfully via HTTP REST API!");
    }
  } catch (err) {
    console.error("Network error executing signup:", err);
    process.exit(1);
  }
}

run();
