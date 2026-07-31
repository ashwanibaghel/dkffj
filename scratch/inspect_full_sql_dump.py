import os
import re
import json

sql_path = r"e:\dkffj\kelvinne_dkfound.sql"
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

tables = re.findall(r"INSERT INTO `([^`]+)` VALUES", content)
print("Found table inserts in SQL dump:", set(tables))

for t in set(tables):
    matches = re.findall(rf"INSERT INTO `{t}` VALUES\s*(.*?);", content, re.DOTALL)
    if matches:
        print(f"Table `{t}` has data insert block.")

