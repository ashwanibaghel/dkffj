with open(r"e:\dkffj\dkffj-next\src\app\apply-appreciation\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "49" in line:
        print(f"Line {idx+1}: {line.strip()}")
