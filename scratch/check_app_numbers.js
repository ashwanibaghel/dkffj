const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://tgszzjbvpcznndrfkkov.supabase.co";
const supabaseKey = "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("appreciation_applications")
    .select("id, application_no, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Appreciation Records:");
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
