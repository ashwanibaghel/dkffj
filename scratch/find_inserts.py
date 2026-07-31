import re

sql_path = r"e:\dkffj\kelvinne_dkfound.sql"
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    sql = f.read()

matches = re.findall(r"INSERT INTO `([^`]+)`", sql)
print("All INSERT INTO matches:", matches)
