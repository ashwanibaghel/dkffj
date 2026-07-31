import os

sql_path = os.path.join("..", "kelvinne_dkfound.sql")
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "membership_form" in l.lower():
        print(f"Line {i+1}: {l[:100]}")
