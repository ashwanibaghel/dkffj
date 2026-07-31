import re
import json

sql_path = r"e:\dkffj\kelvinne_dkfound.sql"
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

membership_rows = []
for line in lines:
    if line.startswith("INSERT INTO `membership_form`"):
        # Extract values between VALUES ( and );
        idx = line.find("VALUES")
        if idx != -1:
            val_part = line[idx + len("VALUES"):].strip()
            if val_part.endswith(";"):
                val_part = val_part[:-1]
            membership_rows.append(val_part)

print(f"Found {len(membership_rows)} INSERT lines for `membership_form`.")

# Save raw insert statements
with open(r"e:\dkffj\dkffj-next\scratch\membership_sql_inserts.json", "w", encoding="utf-8") as out:
    json.dump(membership_rows, out, indent=2)

print("Saved to scratch/membership_sql_inserts.json")
