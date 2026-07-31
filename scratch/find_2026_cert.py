import os, re

app_dir = r"e:\dkffj\dkffj-next\src"
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".ts") or f.endswith(".tsx"):
            fp = os.path.join(root, f)
            with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                if "appreciation" in fp.lower() or "certificate" in fp.lower():
                    if "generate_next_number" in content or "DKFFJ" in content or "certificate_no" in content or "appNo" in content:
                        print("File:", fp.replace(app_dir, ""))
