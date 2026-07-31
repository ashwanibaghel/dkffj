import os
import re

sql_path = r"e:\dkffj\kelvinne_dkfound.sql"
if not os.path.exists(sql_path):
    print("SQL dump file not found at", sql_path)
    exit()

with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    sql = f.read()

create_tables = re.findall(r"CREATE TABLE `([^`]+)`", sql)
insert_tables = list(set(re.findall(r"INSERT INTO `([^`]+)`", sql)))

print("Tables created in SQL dump:", create_tables)
print("\nTables inserted into SQL dump:", insert_tables)

with open(r"e:\dkffj\dkffj-next\scratch\sql_summary.txt", "w", encoding="utf-8") as out:
    out.write(f"Tables: {create_tables}\nInserts: {insert_tables}\n")
