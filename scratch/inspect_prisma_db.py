import sqlite3
import os

db_path = r"e:\dkffj\dkffj-next\prisma\dev.db"
if not os.path.exists(db_path):
    print("prisma/dev.db not found!")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print("Tables in sqlite3 dev.db:", tables)

for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM `{t}`;")
    cnt = cursor.fetchone()[0]
    print(f"Table `{t}` count: {cnt}")

conn.close()
