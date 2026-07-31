import os

app_dir = r"e:\dkffj"
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".sql") or f.endswith(".ts") or f.endswith(".js"):
            fp = os.path.join(root, f)
            with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                if "generate_next_number" in content:
                    print("=== File:", fp, "===")
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if "generate_next_number" in line or "prefix" in line:
                            print(f"Line {idx+1}: {line.strip()}")
