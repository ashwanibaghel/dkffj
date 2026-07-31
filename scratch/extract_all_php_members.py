import os
import json
import re

sql_path = r"e:\dkffj\kelvinne_dkfound.sql"
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    sql = f.read()

insert_blocks = re.findall(r"INSERT INTO `membership_form` VALUES\s*(.*?);", sql, re.DOTALL)
print(f"Found {len(insert_blocks)} INSERT INTO `membership_form` blocks.")

all_records = []

for block_idx, block in enumerate(insert_blocks):
    # Each block contains tuples separated by ),\n( or ), (
    raw_tuples = block.split("),\n(")
    if len(raw_tuples) == 1:
        raw_tuples = block.split("), (")

    for t_idx, t in enumerate(raw_tuples):
        t_clean = t.strip().lstrip("(").rstrip(")")
        fields = []
        current = ""
        in_quote = False
        i = 0
        while i < len(t_clean):
            c = t_clean[i]
            if c == "'" and (i == 0 or t_clean[i-1] != "\\"):
                in_quote = not in_quote
            elif c == "," and not in_quote:
                fields.append(current.strip().strip("'").replace("\\'", "'"))
                current = ""
            else:
                current += c
            i += 1
        if current:
            fields.append(current.strip().strip("'").replace("\\'", "'"))

        if len(fields) >= 8:
            all_records.append({
                "block": block_idx,
                "index": t_idx,
                "fields": fields
            })

print(f"Total parsed records from membership_form: {len(all_records)}")

# Write to json
with open(r"e:\dkffj\dkffj-next\scratch\all_sql_members.json", "w", encoding="utf-8") as f:
    json.dump(all_records, f, indent=2)

print("Saved to scratch/all_sql_members.json")
