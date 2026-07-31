with open(r"e:\dkffj\dkffj-next\src\app\admin\(dashboard)\members\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "<img" in line or "photo_url" in line or "photoUrl" in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")
