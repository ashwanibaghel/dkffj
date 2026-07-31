import os, json
from supabase import create_client

supabase_url = "https://tgszzjbvpcznndrfkkov.supabase.co"
supabase_key = "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n"
supabase = create_client(supabase_url, supabase_key)

res = supabase.from_("appreciation_applications").select("id, application_no, full_name, created_at").order("created_at", desc=True).limit(10).execute()
print("Appreciation Applications Data:")
print(json.dumps(res.data, indent=2))
