import os

app_dir = r"e:\dkffj\dkffj-next\src"
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".ts") or f.endswith(".tsx"):
            fp = os.path.join(root, f)
            with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                if "appreciation" in content.lower():
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if "DKFFJ" in line or "2026" in line or "appNo" in line or "application_no" in line or "cert" in line.lower():
                            if "/" in line or "-" in line or "replace" in line or "format" in line:
                                print(f"{os.path.basename(fp)} L{idx+1}: {line.strip()[:100]}")
