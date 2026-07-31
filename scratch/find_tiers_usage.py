with open(r"e:\dkffj\dkffj-next\src\app\apply\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "MEMBERSHIP_TIERS" in line:
        print(f"Line {idx+1}: {line.strip()}")
