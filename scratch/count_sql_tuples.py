import json

with open(r"e:\dkffj\dkffj-next\scratch\membership_sql_inserts.json", "r", encoding="utf-8") as f:
    inserts = json.load(f)

total_rows = 0
for idx, ins in enumerate(inserts):
    # Each row tuple starts with ( and ends with )
    tuples = ins.split("), (")
    print(f"Insert line {idx+1} contains {len(tuples)} member records.")
    total_rows += len(tuples)

print(f"TOTAL MEMBERSHIP_FORM RECORDS IN SQL DUMP: {total_rows}")
