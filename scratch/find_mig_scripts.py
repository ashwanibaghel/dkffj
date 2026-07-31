import os

search_dir = r"e:\dkffj"
for root, dirs, files in os.walk(search_dir):
    if ".git" in root or "node_modules" in root or ".next" in root:
        continue
    for f in files:
        if f.endswith(".js") or f.endswith(".ts") or f.endswith(".json") or f.endswith(".py"):
            fp = os.path.join(root, f)
            try:
                with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                    txt = file.read()
                    if "MIGRATION_SECRET" in txt or "DKFFJ_MIGRATION_SECRET_2026" in txt or "migrate" in f.lower():
                        print(f"Match in: {fp}")
            except:
                pass
